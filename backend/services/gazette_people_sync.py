#!/usr/bin/env python3
"""
Service to synchronize gazette entries with people table.
This ensures that whenever a gazette entry is created or updated,
the corresponding person record is also updated with the latest gazette data.
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.gazette import Gazette
from models.people import People

logger = logging.getLogger(__name__)

class GazettePeopleSync:
    """Service to synchronize gazette data with people records"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def sync_gazette_to_people(self, gazette_id: int) -> bool:
        """
        Synchronize a specific gazette entry with its linked person record.
        
        Args:
            gazette_id: ID of the gazette entry to synchronize
            
        Returns:
            bool: True if synchronization was successful, False otherwise
        """
        try:
            # Get the gazette entry
            gazette = self.db.query(Gazette).filter(Gazette.id == gazette_id).first()
            if not gazette:
                logger.warning(f"Gazette entry {gazette_id} not found")
                return False
            
            # If no person is linked, skip synchronization
            if not gazette.person_id:
                logger.info(f"Gazette entry {gazette_id} has no linked person, skipping sync")
                return True
            
            # Get the linked person
            person = self.db.query(People).filter(People.id == gazette.person_id).first()
            if not person:
                logger.warning(f"Person {gazette.person_id} linked to gazette {gazette_id} not found")
                return False
            
            # Prepare gazette source information
            gazette_source = f"Gazette {gazette.gazette_number}"
            if gazette.gazette_date:
                gazette_source += f" ({gazette.gazette_date.strftime('%Y-%m-%d')})"
            if gazette.source:
                gazette_source += f" - {gazette.source}"
            
            # Update person record with gazette data
            # Use COALESCE to only update if the field is currently NULL or empty
            update_query = text("""
                UPDATE people SET
                    occupation = COALESCE(NULLIF(occupation, ''), :profession),
                    place_of_birth = COALESCE(NULLIF(place_of_birth, ''), :place_of_birth),
                    old_place_of_birth = COALESCE(NULLIF(old_place_of_birth, ''), :old_place_of_birth),
                    new_place_of_birth = COALESCE(NULLIF(new_place_of_birth, ''), :new_place_of_birth),
                    old_date_of_birth = COALESCE(old_date_of_birth, :old_date_of_birth),
                    new_date_of_birth = COALESCE(new_date_of_birth, :new_date_of_birth),
                    effective_date_of_change = COALESCE(effective_date_of_change, :effective_date_of_change),
                    gazette_remarks = COALESCE(NULLIF(gazette_remarks, ''), :remarks),
                    gazette_source = COALESCE(NULLIF(gazette_source, ''), :gazette_source),
                    gazette_reference = COALESCE(NULLIF(gazette_reference, ''), :reference_number),
                    updated_at = :updated_at
                WHERE id = :person_id
            """)
            
            self.db.execute(update_query, {
                'person_id': gazette.person_id,
                'profession': gazette.profession,
                'place_of_birth': gazette.place_of_birth,
                'old_place_of_birth': gazette.old_place_of_birth,
                'new_place_of_birth': gazette.new_place_of_birth,
                'old_date_of_birth': gazette.old_date_of_birth,
                'new_date_of_birth': gazette.new_date_of_birth,
                'effective_date_of_change': gazette.effective_date_of_change,
                'remarks': gazette.remarks,
                'gazette_source': gazette_source,
                'reference_number': gazette.reference_number,
                'updated_at': datetime.utcnow()
            })
            
            self.db.commit()
            logger.info(f"Successfully synchronized gazette {gazette_id} with person {gazette.person_id}")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error synchronizing gazette {gazette_id} with people table: {e}")
            return False
    
    def sync_all_gazettes(self) -> dict:
        """
        Synchronize all gazette entries with their linked people records.
        
        Returns:
            dict: Statistics about the synchronization process
        """
        try:
            # Get all gazette entries with person relationships
            gazette_entries = self.db.query(Gazette).filter(Gazette.person_id.isnot(None)).all()
            
            stats = {
                'total_gazettes': len(gazette_entries),
                'successful_syncs': 0,
                'failed_syncs': 0,
                'errors': []
            }
            
            for gazette in gazette_entries:
                if self.sync_gazette_to_people(gazette.id):
                    stats['successful_syncs'] += 1
                else:
                    stats['failed_syncs'] += 1
                    stats['errors'].append(f"Failed to sync gazette {gazette.id}")
            
            logger.info(f"Synchronization completed: {stats['successful_syncs']}/{stats['total_gazettes']} successful")
            return stats
            
        except Exception as e:
            logger.error(f"Error in bulk synchronization: {e}")
            return {
                'total_gazettes': 0,
                'successful_syncs': 0,
                'failed_syncs': 0,
                'errors': [str(e)]
            }
    
    def sync_person_gazettes(self, person_id: int) -> bool:
        """
        Synchronize all gazette entries for a specific person.
        
        Args:
            person_id: ID of the person to synchronize
            
        Returns:
            bool: True if synchronization was successful, False otherwise
        """
        try:
            # Get all gazette entries for this person
            gazette_entries = self.db.query(Gazette).filter(Gazette.person_id == person_id).all()
            
            if not gazette_entries:
                logger.info(f"No gazette entries found for person {person_id}")
                return True
            
            # Use the most recent gazette entry for synchronization
            latest_gazette = max(gazette_entries, key=lambda g: g.created_at)
            
            return self.sync_gazette_to_people(latest_gazette.id)
            
        except Exception as e:
            logger.error(f"Error synchronizing gazettes for person {person_id}: {e}")
            return False
    
    def create_person_from_gazette(self, gazette_id: int) -> int:
        """
        Create a new person record from gazette data if no person is linked.
        
        Args:
            gazette_id: ID of the gazette entry
            
        Returns:
            int: ID of the created person, or None if creation failed
        """
        try:
            gazette = self.db.query(Gazette).filter(Gazette.id == gazette_id).first()
            if not gazette:
                logger.warning(f"Gazette entry {gazette_id} not found")
                return None
            
            # Extract name from gazette data
            full_name = gazette.new_name or gazette.old_name or gazette.title
            if not full_name:
                logger.warning(f"No name found in gazette {gazette_id}")
                return None
            
            # Create new person record
            person = People(
                full_name=full_name,
                first_name=full_name.split()[0] if full_name.split() else full_name,
                last_name=full_name.split()[-1] if len(full_name.split()) > 1 else "",
                occupation=gazette.profession,
                address=None,  # Will be updated if available
                place_of_birth=gazette.place_of_birth,
                old_place_of_birth=gazette.old_place_of_birth,
                new_place_of_birth=gazette.new_place_of_birth,
                old_date_of_birth=gazette.old_date_of_birth,
                new_date_of_birth=gazette.new_date_of_birth,
                effective_date_of_change=gazette.effective_date_of_change,
                gazette_remarks=gazette.remarks,
                gazette_source=f"Gazette {gazette.gazette_number}" + (f" ({gazette.gazette_date.strftime('%Y-%m-%d')})" if gazette.gazette_date else ""),
                gazette_reference=gazette.reference_number,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.db.add(person)
            self.db.commit()
            self.db.refresh(person)
            
            # Link the gazette to the new person
            gazette.person_id = person.id
            self.db.commit()
            
            logger.info(f"Created person {person.id} from gazette {gazette_id}")
            return person.id
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating person from gazette {gazette_id}: {e}")
            return None

# Convenience functions for use in routes
def sync_gazette_to_people(db: Session, gazette_id: int) -> bool:
    """Convenience function to sync a gazette entry with people table"""
    sync_service = GazettePeopleSync(db)
    return sync_service.sync_gazette_to_people(gazette_id)

def sync_all_gazettes(db: Session) -> dict:
    """Convenience function to sync all gazette entries"""
    sync_service = GazettePeopleSync(db)
    return sync_service.sync_all_gazettes()

def sync_person_gazettes(db: Session, person_id: int) -> bool:
    """Convenience function to sync all gazettes for a person"""
    sync_service = GazettePeopleSync(db)
    return sync_service.sync_person_gazettes(person_id)

def create_person_from_gazette(db: Session, gazette_id: int) -> int:
    """Convenience function to create a person from gazette data"""
    sync_service = GazettePeopleSync(db)
    return sync_service.create_person_from_gazette(gazette_id)
