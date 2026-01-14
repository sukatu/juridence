#!/usr/bin/env python3
"""
Gazette Statistics Service
Provides dashboard statistics for gazette processing
"""

from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from models.gazette import Gazette, GazetteType
from models.people import People
import logging

logger = logging.getLogger(__name__)


class GazetteStatistics:
    """Service for generating gazette processing statistics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_overall_statistics(self) -> Dict:
        """Get overall gazette processing statistics"""
        try:
            # Total gazettes processed (unique gazette numbers)
            total_gazettes = self.db.query(func.count(func.distinct(Gazette.gazette_number))).scalar() or 0
            
            # Total names retrieved (unique people from gazettes)
            total_names = self.db.query(func.count(func.distinct(Gazette.person_id))).filter(
                Gazette.person_id.isnot(None)
            ).scalar() or 0
            
            # Total entries extracted
            total_entries = self.db.query(func.count(Gazette.id)).scalar() or 0
            
            # Breakdown by type
            by_type = {}
            for gtype in GazetteType:
                count = self.db.query(func.count(Gazette.id)).filter(
                    Gazette.gazette_type == gtype
                ).scalar() or 0
                by_type[gtype.value] = count
            
            return {
                'total_gazettes_processed': total_gazettes,
                'total_names_retrieved': total_names,
                'total_entries_extracted': total_entries,
                'breakdown_by_type': by_type,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting overall statistics: {e}")
            return {
                'total_gazettes_processed': 0,
                'total_names_retrieved': 0,
                'total_entries_extracted': 0,
                'breakdown_by_type': {},
                'error': str(e)
            }
    
    def get_statistics_by_year(self) -> Dict:
        """Get statistics grouped by year"""
        try:
            # Get all gazettes with dates
            gazettes = self.db.query(
                extract('year', Gazette.gazette_date).label('year'),
                func.count(func.distinct(Gazette.gazette_number)).label('gazette_count'),
                func.count(func.distinct(Gazette.person_id)).label('name_count'),
                func.count(Gazette.id).label('entry_count')
            ).filter(
                Gazette.gazette_date.isnot(None)
            ).group_by('year').order_by('year').all()
            
            year_stats = {}
            for row in gazettes:
                year = int(row.year) if row.year else 0
                year_stats[str(year)] = {
                    'gazettes_processed': row.gazette_count or 0,
                    'names_retrieved': row.name_count or 0,
                    'entries_extracted': row.entry_count or 0
                }
            
            return year_stats
        except Exception as e:
            logger.error(f"Error getting statistics by year: {e}")
            return {}
    
    def get_gazette_list(self, year: Optional[int] = None, limit: int = 100) -> List[Dict]:
        """Get list of processed gazettes"""
        try:
            query = self.db.query(
                Gazette.gazette_number,
                Gazette.gazette_date,
                func.count(func.distinct(Gazette.person_id)).label('name_count'),
                func.count(Gazette.id).label('entry_count'),
                func.min(Gazette.created_at).label('processed_at')
            ).filter(
                Gazette.gazette_number.isnot(None)
            )
            
            if year:
                query = query.filter(extract('year', Gazette.gazette_date) == year)
            
            gazettes = query.group_by(
                Gazette.gazette_number,
                Gazette.gazette_date
            ).order_by(
                Gazette.gazette_date.desc()
            ).limit(limit).all()
            
            result = []
            for row in gazettes:
                result.append({
                    'gazette_number': row.gazette_number,
                    'gazette_date': row.gazette_date.isoformat() if row.gazette_date else None,
                    'names_retrieved': row.name_count or 0,
                    'entries_extracted': row.entry_count or 0,
                    'processed_at': row.processed_at.isoformat() if row.processed_at else None
                })
            
            return result
        except Exception as e:
            logger.error(f"Error getting gazette list: {e}")
            return []
    
    def get_name_linking_statistics(self) -> Dict:
        """Get statistics about name linking across gazettes"""
        try:
            # Find names that appear in multiple gazettes
            linked_names = self.db.query(
                Gazette.person_id,
                People.full_name,
                func.count(func.distinct(Gazette.gazette_number)).label('gazette_count'),
                func.count(Gazette.id).label('entry_count')
            ).join(
                People, Gazette.person_id == People.id
            ).filter(
                Gazette.person_id.isnot(None)
            ).group_by(
                Gazette.person_id,
                People.full_name
            ).having(
                func.count(func.distinct(Gazette.gazette_number)) > 1
            ).all()
            
            result = {
                'total_linked_names': len(linked_names),
                'linked_names': []
            }
            
            for row in linked_names:
                # Get all gazette appearances for this person
                appearances = self.db.query(
                    Gazette.gazette_number,
                    Gazette.gazette_date,
                    Gazette.item_number,
                    Gazette.gazette_type
                ).filter(
                    Gazette.person_id == row.person_id
                ).order_by(
                    Gazette.gazette_date
                ).all()
                
                result['linked_names'].append({
                    'person_id': row.person_id,
                    'full_name': row.full_name,
                    'gazette_count': row.gazette_count,
                    'entry_count': row.entry_count,
                    'appearances': [
                        {
                            'gazette_number': app.gazette_number,
                            'gazette_date': app.gazette_date.isoformat() if app.gazette_date else None,
                            'item_number': app.item_number,
                            'type': app.gazette_type.value if app.gazette_type else None
                        }
                        for app in appearances
                    ]
                })
            
            return result
        except Exception as e:
            logger.error(f"Error getting name linking statistics: {e}")
            return {'total_linked_names': 0, 'linked_names': []}
    
    def get_complete_statistics(self) -> Dict:
        """Get complete statistics for dashboard"""
        return {
            'overall': self.get_overall_statistics(),
            'by_year': self.get_statistics_by_year(),
            'name_linking': self.get_name_linking_statistics(),
            'generated_at': datetime.now().isoformat()
        }

