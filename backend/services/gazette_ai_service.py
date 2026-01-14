import os
import openai
import logging
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, text
from models.settings import Settings
from models.gazette import Gazette
from models.correction_of_place_of_birth import CorrectionOfPlaceOfBirth
from models.correction_of_date_of_birth import CorrectionOfDateOfBirth
from models.marriage_officer import MarriageOfficer
from datetime import datetime
import json
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
gazette_ai_logger = logging.getLogger("gazette_ai")

class GazetteAIService:
    def __init__(self, db: Session):
        self.db = db
        self.openai_client = self._get_openai_client()
        self.model = self._get_ai_model()
    
    def _get_openai_client(self):
        """Get OpenAI client with API key from database or environment"""
        try:
            setting = self.db.query(Settings).filter(Settings.key == "openai_api_key").first()
            if setting and setting.value:
                return openai.OpenAI(api_key=setting.value)
        except Exception as e:
            gazette_ai_logger.error(f"Error fetching API key from database: {e}")
        
        # Fallback to environment variable
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key not found in database or environment variables")
        return openai.OpenAI(api_key=api_key)
    
    def _get_ai_model(self) -> str:
        """Get AI model from settings"""
        try:
            setting = self.db.query(Settings).filter(Settings.key == "ai_model").first()
            return setting.value if setting and setting.value else "gpt-3.5-turbo"
        except Exception as e:
            gazette_ai_logger.error(f"Error fetching AI model from database: {e}")
            return "gpt-3.5-turbo"
    
    def parse_user_query(self, user_message: str) -> Dict[str, Any]:
        """Parse user query to extract search parameters using AI"""
        try:
            system_prompt = """You are an assistant that helps parse user queries about gazette entries and related records.
IMPORTANT: Searches can include gazette_entries table, correction_of_place_of_birth table, correction_of_date_of_birth table, and marriage_officers table. Do NOT search the people table or any other tables.

Extract search parameters from the user's query. Return a JSON object with the following fields:
- name: name to search for (if mentioned) - searches person_name in correction tables and officer_name in marriage_officers
- gazette_type: type of record (CHANGE_OF_NAME, CHANGE_OF_PLACE_OF_BIRTH, CHANGE_OF_DATE_OF_BIRTH, APPOINTMENT_OF_MARRIAGE_OFFICERS, DEATH_NOTICE, etc.) if mentioned
- search_type: which table(s) to search - can be "gazette", "correction_of_place_of_birth", "correction_of_date_of_birth", "marriage_officers", or "all" (default: "all")
- date_from: start date if date range is mentioned (format: YYYY-MM-DD)
- date_to: end date if date range is mentioned (format: YYYY-MM-DD)
- location: location/city/place of birth if mentioned
- keywords: any other relevant keywords

Recognize these record types:
- "change of name" or "name change" -> CHANGE_OF_NAME (search gazette_entries)
- "correction of place of birth" or "place of birth correction" or "pob correction" -> search correction_of_place_of_birth table
- "correction of date of birth" or "date of birth correction" or "dob correction" -> search correction_of_date_of_birth table
- "marriage officer" or "marriage officers" -> search marriage_officers table
- "place of birth" or "birth place" or "pob" -> CHANGE_OF_PLACE_OF_BIRTH (gazette) or correction_of_place_of_birth table
- "date of birth" or "dob" -> CHANGE_OF_DATE_OF_BIRTH (gazette) or correction_of_date_of_birth table
- "death" or "obituary" -> DEATH_NOTICE

Return only valid JSON, no other text."""

            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=200,
                temperature=0.3
            )
            
            content = response.choices[0].message.content.strip()
            # Try to extract JSON from response
            json_match = re.search(r'\{[^}]+\}', content, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                return parsed
            return {}
        except Exception as e:
            gazette_ai_logger.error(f"Error parsing query: {e}")
            return {}
    
    def search_gazettes(self, search_params: Dict[str, Any], limit: int = 50) -> List[Dict]:
        """Search gazette entries and related tables based on parsed parameters"""
        try:
            all_results = []
            search_type = search_params.get("search_type", "all")
            name = search_params.get("name", "").strip() if search_params.get("name") else None
            
            # Determine which tables to search based on search_type and gazette_type
            search_gazette = True
            search_correction_pob = False
            search_correction_dob = False
            search_marriage_officers = False
            
            if search_type == "all":
                gazette_type = search_params.get("gazette_type", "").upper()
                if "PLACE_OF_BIRTH" in gazette_type or "POB" in search_params.get("keywords", "").upper():
                    search_correction_pob = True
                if "DATE_OF_BIRTH" in gazette_type or "DOB" in search_params.get("keywords", "").upper():
                    search_correction_dob = True
                if "MARRIAGE" in gazette_type or "MARRIAGE OFFICER" in search_params.get("keywords", "").upper():
                    search_marriage_officers = True
                # Always search gazette table by default, but also search specific tables if mentioned
                if not search_correction_pob and not search_correction_dob and not search_marriage_officers:
                    # Default behavior: search all tables if no specific type mentioned
                    search_correction_pob = True
                    search_correction_dob = True
                    search_marriage_officers = True
            elif search_type == "correction_of_place_of_birth":
                search_gazette = False
                search_correction_pob = True
            elif search_type == "correction_of_date_of_birth":
                search_gazette = False
                search_correction_dob = True
            elif search_type == "marriage_officers":
                search_gazette = False
                search_marriage_officers = True
            
            # Search Gazette table
            if search_gazette:
                try:
                    query = self.db.query(Gazette).filter(Gazette.is_public == True)

                    # Exclude PERSONAL_NOTICE entries from search results
                    query = query.filter(Gazette.gazette_type != "PERSONAL_NOTICE")

                    # Search by name (current_name, old_name, new_name, alias_names, name_value)
                    # PRIORITIZE EXACT MATCHES for precision
                    if search_params.get("name"):

                        name = search_params["name"].strip()


                        name_lower = name.lower()

                
                        name_parts = name.split()

                        from sqlalchemy import text, func

                        # PRIORITY 1: Exact matches (most precise)
                        exact_search_term = name
                        exact_conditions = [
                            func.lower(Gazette.current_name) == name_lower,
                            func.lower(Gazette.new_name) == name_lower,
                            func.lower(Gazette.old_name) == name_lower,
                            func.lower(Gazette.name_value) == name_lower,
                        ]

                        # PRIORITY 2: Starts with (high precision)
                        starts_with_term = f"{name}%"
                        starts_with_conditions = [
                            Gazette.current_name.ilike(starts_with_term),
                            Gazette.new_name.ilike(starts_with_term),
                            Gazette.old_name.ilike(starts_with_term),
                            Gazette.name_value.ilike(starts_with_term),
                        ]

                        # PRIORITY 3: Contains (medium precision) - only for multi-word names
                        contains_term = f"%{name}%"
                        contains_conditions = []
                        if len(name_parts) > 1:
                            contains_conditions = [
                                Gazette.current_name.ilike(contains_term),
                                Gazette.new_name.ilike(contains_term),
                                Gazette.old_name.ilike(contains_term),
                                Gazette.name_value.ilike(contains_term),
                            ]

                            # Also try reversed order for multi-word names
                            reversed_name = " ".join(reversed(name_parts))
                            reversed_term = f"%{reversed_name}%"
                            contains_conditions.extend([
                                Gazette.current_name.ilike(reversed_term),
                                Gazette.new_name.ilike(reversed_term),
                                Gazette.old_name.ilike(reversed_term),
                                Gazette.name_value.ilike(reversed_term),
                            ])

                        # PRIORITY 4: Word-by-word (lower precision, only if needed)
                        word_conditions = []
                        if len(name_parts) > 1 and len(name_parts) <= 3:  # Only for 2-3 word names
                            for part in name_parts:
                                if len(part) > 2:  # Only search words longer than 2 characters
                                    part_term = f"%{part}%"
                                    word_conditions.extend([
                                        Gazette.current_name.ilike(part_term),
                                        Gazette.new_name.ilike(part_term),
                                        Gazette.old_name.ilike(part_term),
                                        Gazette.name_value.ilike(part_term),
                                    ])
                        
                        # Search in alias_names JSONB array
                        alias_search_pattern = f"%{name_lower}%"
                        alias_search_condition = text(
                            "(gazette_entries.alias_names IS NOT NULL AND "
                            "(jsonb_typeof(gazette_entries.alias_names) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements_text(gazette_entries.alias_names) AS alias_elem "
                            "WHERE LOWER(alias_elem::text) LIKE :search_pattern)) OR "
                            "(jsonb_typeof(gazette_entries.alias_names) != 'array' AND LOWER(gazette_entries.alias_names::text) LIKE :search_pattern))"
                        ).params(search_pattern=alias_search_pattern)
                        
                        # Combine conditions with priority: exact > starts_with > contains > words
                        # Use OR to match any condition, but results will be ordered by relevance
                        all_conditions = exact_conditions + starts_with_conditions + contains_conditions + word_conditions + [alias_search_condition]
                        query = query.filter(or_(*all_conditions))
                        
                        # Order by relevance: exact matches first, then starts with, then contains
                        from sqlalchemy import case
                        relevance_order = case(
                            (func.lower(Gazette.current_name) == name_lower, 1),
                            (func.lower(Gazette.new_name) == name_lower, 1),
                            (func.lower(Gazette.old_name) == name_lower, 1),
                            (func.lower(Gazette.name_value) == name_lower, 1),
                            (func.lower(Gazette.current_name).like(f"{name_lower}%"), 2),
                            (func.lower(Gazette.new_name).like(f"{name_lower}%"), 2),
                            (func.lower(Gazette.old_name).like(f"{name_lower}%"), 2),
                            (func.lower(Gazette.name_value).like(f"{name_lower}%"), 2),
                            else_=3
                        )
                        query = query.order_by(relevance_order.asc(), Gazette.publication_date.desc())
                    
                    # Filter by gazette type
                    if search_params.get("gazette_type"):
                        query = query.filter(Gazette.gazette_type == search_params["gazette_type"])
                    
                    # Filter by date range
                    if search_params.get("date_from"):
                        try:
                            date_from = datetime.fromisoformat(search_params["date_from"])
                            query = query.filter(Gazette.publication_date >= date_from)
                        except:
                            pass
                    
                    if search_params.get("date_to"):
                        try:
                            date_to = datetime.fromisoformat(search_params["date_to"])
                            query = query.filter(Gazette.publication_date <= date_to)
                        except:
                            pass
                    
                    # Search by location/place of birth
                    if search_params.get("location"):
                        location = search_params["location"].strip()
                        location_term = f"%{location}%"
                        location_conditions = [
                            Gazette.place_of_birth.ilike(location_term),
                            Gazette.old_place_of_birth.ilike(location_term),
                            Gazette.new_place_of_birth.ilike(location_term),
                        ]
                        if location_conditions:
                            query = query.filter(or_(*location_conditions))
                    
                    # Search by keywords in title, content, description
                    if search_params.get("keywords"):
                        keywords = search_params["keywords"]
                        if isinstance(keywords, str):
                            keywords = [keywords]
                        
                        keyword_conditions = []
                        for keyword in keywords:
                            keyword_term = f"%{keyword}%"
                            keyword_conditions.extend([
                                Gazette.title.ilike(keyword_term),
                                Gazette.content.ilike(keyword_term),
                                Gazette.description.ilike(keyword_term),
                            ])
                        
                        if keyword_conditions:
                            query = query.filter(or_(*keyword_conditions))
                    
                    # Order by relevance if name search was performed, otherwise by publication date
                    if not search_params.get("name"):
                        # No name search - order by publication date (most recent first)
                        query = query.order_by(Gazette.publication_date.desc())
                    # Note: If name search was performed, ordering is already set by relevance in the name search section above
                    
                    # Limit results for precision
                    results = query.limit(limit).all()
                    
                    # Convert to dictionaries
                    for gazette in results:
                        gazette_dict = {
                            "id": gazette.id,
                            "title": gazette.title,
                            "gazette_number": gazette.gazette_number,
                            "gazette_date": gazette.gazette_date.isoformat() if gazette.gazette_date else None,
                            "publication_date": gazette.publication_date.isoformat() if gazette.publication_date else None,
                            "gazette_type": gazette.gazette_type,
                            "current_name": gazette.current_name,
                            "new_name": gazette.new_name,
                            "old_name": gazette.old_name,
                            "name_value": gazette.name_value,
                            "alias_names": gazette.alias_names,
                            "person_name": gazette.current_name or gazette.name_value,
                            "description": gazette.description,
                            "content": gazette.content[:500] if gazette.content else None,  # Truncate content
                            "person_id": gazette.person_id,
                            "source_table": "gazette_entries",
                            # Include place of birth fields for CHANGE_OF_PLACE_OF_BIRTH
                            "old_place_of_birth": gazette.old_place_of_birth,
                            "new_place_of_birth": gazette.new_place_of_birth,
                            "place_of_birth": gazette.place_of_birth,
                            # Include date of birth fields for CHANGE_OF_DATE_OF_BIRTH
                            "old_date_of_birth": gazette.old_date_of_birth.isoformat() if gazette.old_date_of_birth else None,
                            "new_date_of_birth": gazette.new_date_of_birth.isoformat() if gazette.new_date_of_birth else None,
                        }
                        all_results.append(gazette_dict)
                except Exception as e:
                    gazette_ai_logger.error(f"Error searching gazette_entries: {e}")
            
            # Search correction_of_place_of_birth table
            if search_correction_pob:
                try:
                    query = self.db.query(CorrectionOfPlaceOfBirth)
                
                    if name:
                        name_term = f"%{name}%"
                        query = query.filter(CorrectionOfPlaceOfBirth.person_name.ilike(name_term))
                    
                    # Filter by location if provided
                    if search_params.get("location"):
                        location = search_params["location"].strip()
                        location_term = f"%{location}%"
                        query = query.filter(
                            or_(
                                CorrectionOfPlaceOfBirth.old_place_of_birth.ilike(location_term),
                                CorrectionOfPlaceOfBirth.new_place_of_birth.ilike(location_term)
                            )
                        )
                    
                    # Filter by date range
                    if search_params.get("date_from"):
                        try:
                            date_from = datetime.fromisoformat(search_params["date_from"])
                            query = query.filter(CorrectionOfPlaceOfBirth.gazette_date >= date_from)
                        except:
                            pass
                    
                    if search_params.get("date_to"):
                        try:
                            date_to = datetime.fromisoformat(search_params["date_to"])
                            query = query.filter(CorrectionOfPlaceOfBirth.gazette_date <= date_to)
                        except:
                            pass
                    
                    results = query.order_by(CorrectionOfPlaceOfBirth.gazette_date.desc()).limit(limit).all()
                    
                    for entry in results:
                        entry_dict = {
                            "id": entry.id,
                            "title": f"Correction of Place of Birth - {entry.person_name}",
                            "gazette_number": entry.gazette_number,
                            "gazette_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                            "publication_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                            "gazette_type": "CHANGE_OF_PLACE_OF_BIRTH",
                            "person_name": entry.person_name,
                            "current_name": entry.person_name,
                            "alias": entry.alias,
                            "alias_names": [entry.alias] if entry.alias else None,
                            "old_place_of_birth": entry.old_place_of_birth,
                            "new_place_of_birth": entry.new_place_of_birth,
                            "place_of_birth": entry.new_place_of_birth,
                            "profession": entry.profession,
                            "address": entry.address,
                            "gender": entry.gender,
                            "effective_date": entry.effective_date.isoformat() if entry.effective_date else None,
                            "page": entry.page,
                            "source_details": entry.source_details,
                            "source_table": "correction_of_place_of_birth",
                        }
                        all_results.append(entry_dict)
                except Exception as e:
                    gazette_ai_logger.error(f"Error searching correction_of_place_of_birth: {e}")
            
            # Search correction_of_date_of_birth table
            if search_correction_dob:
                try:
                    query = self.db.query(CorrectionOfDateOfBirth)
                
                    if name:
                        name_term = f"%{name}%"
                        query = query.filter(CorrectionOfDateOfBirth.person_name.ilike(name_term))
                    
                    # Filter by date range
                    if search_params.get("date_from"):
                        try:
                            date_from = datetime.fromisoformat(search_params["date_from"])
                            query = query.filter(CorrectionOfDateOfBirth.gazette_date >= date_from)
                        except:
                            pass
                    
                    if search_params.get("date_to"):
                        try:
                            date_to = datetime.fromisoformat(search_params["date_to"])
                            query = query.filter(CorrectionOfDateOfBirth.gazette_date <= date_to)
                        except:
                            pass
                    
                    results = query.order_by(CorrectionOfDateOfBirth.gazette_date.desc()).limit(limit).all()
                    
                    for entry in results:
                        entry_dict = {
                            "id": entry.id,
                            "title": f"Correction of Date of Birth - {entry.person_name}",
                            "gazette_number": entry.gazette_number,
                            "gazette_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                            "publication_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                            "gazette_type": "CHANGE_OF_DATE_OF_BIRTH",
                            "person_name": entry.person_name,
                            "current_name": entry.person_name,
                            "alias": entry.alias,
                            "alias_names": [entry.alias] if entry.alias else None,
                            "old_date_of_birth": entry.old_date_of_birth.isoformat() if entry.old_date_of_birth else None,
                            "new_date_of_birth": entry.new_date_of_birth.isoformat() if entry.new_date_of_birth else None,
                            "profession": entry.profession,
                            "address": entry.address,
                            "gender": entry.gender,
                            "effective_date": entry.effective_date.isoformat() if entry.effective_date else None,
                            "page": entry.page,
                            "source_details": entry.source_details,
                            "source_table": "correction_of_date_of_birth",
                        }
                        all_results.append(entry_dict)
                except Exception as e:
                    gazette_ai_logger.error(f"Error searching correction_of_date_of_birth: {e}")
            
            # Search marriage_officers table
            if search_marriage_officers:
                try:
                    query = self.db.query(MarriageOfficer)
                    
                    if name:
                        name_term = f"%{name}%"
                        query = query.filter(MarriageOfficer.officer_name.ilike(name_term))
                    
                    # Filter by location if provided
                    if search_params.get("location"):
                        location = search_params["location"].strip()
                        location_term = f"%{location}%"
                        query = query.filter(MarriageOfficer.location.ilike(location_term))
                    
                    # Filter by date range (use gazette_date or appointment_date)
                    if search_params.get("date_from"):
                        try:
                            date_from = datetime.fromisoformat(search_params["date_from"])
                            query = query.filter(
                                or_(
                                    MarriageOfficer.gazette_date >= date_from,
                                    MarriageOfficer.appointment_date >= date_from
                                )
                            )
                        except:
                            pass
                    
                    if search_params.get("date_to"):
                        try:
                            date_to = datetime.fromisoformat(search_params["date_to"])
                            query = query.filter(
                                or_(
                                    MarriageOfficer.gazette_date <= date_to,
                                    MarriageOfficer.appointment_date <= date_to
                                )
                            )
                        except:
                            pass
                    
                    results = query.order_by(MarriageOfficer.gazette_date.desc()).limit(limit).all()
                    
                    for entry in results:
                        entry_dict = {
                            "id": entry.id,
                            "title": f"Marriage Officer - {entry.officer_name}",
                            "gazette_number": entry.gazette_number,
                            "gazette_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                            "publication_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                            "gazette_type": "APPOINTMENT_OF_MARRIAGE_OFFICERS",
                            "person_name": entry.officer_name,
                            "current_name": entry.officer_name,
                            "officer_name": entry.officer_name,
                            "church": entry.church,
                            "location": entry.location,
                            "appointing_authority": entry.appointing_authority,
                            "appointment_date": entry.appointment_date.isoformat() if entry.appointment_date else None,
                            "page": entry.page_number,
                            "source_details": entry.source_details,
                            "source_table": "marriage_officers",
                        }
                        all_results.append(entry_dict)
                except Exception as e:
                    gazette_ai_logger.error(f"Error searching marriage_officers: {e}")
            
            # Sort all results by publication_date (most recent first) and limit
            all_results.sort(key=lambda x: x.get("publication_date") or "", reverse=True)
            return all_results[:limit]
            
        except Exception as e:
            gazette_ai_logger.error(f"Error in search_gazettes: {e}")
            return []
    
    def generate_ai_response(self, user_message: str, chat_history: List[Dict] = None, 
                           session_id: str = None) -> Dict[str, Any]:
        """Generate AI response based on gazette search results"""
        start_time = datetime.utcnow()
        response_time_ms = None
        tokens_used = None
        ai_response = None
        error = None
        search_results = []
        
        try:
            # Parse user query to extract search parameters
            search_params = self.parse_user_query(user_message)
            
            # Perform search if parameters were extracted
            if search_params:
                search_results = self.search_gazettes(search_params, limit=20)
            
                # If no results with full name, try searching with individual name parts
                if not search_results and search_params.get("name"):
                    name = search_params["name"].strip()
                    name_parts = name.split()
                    if len(name_parts) > 1:
                        # Try searching with just first name
                        first_name_params = search_params.copy()
                        first_name_params["name"] = name_parts[0]
                        search_results = self.search_gazettes(first_name_params, limit=20)
                        
                        # If still no results, try with last name
                        if not search_results and len(name_parts) > 1:
                            last_name_params = search_params.copy()
                            last_name_params["name"] = name_parts[-1]
                            search_results = self.search_gazettes(last_name_params, limit=20)
            
            # If no search params or results, do a general text search across all tables
            if not search_results and user_message:
                # Try direct text search with improved name matching across all tables
                search_text = user_message.strip()
                search_term = f"%{search_text}%"
                search_text_lower = search_text.lower()
                
                # Split into words for better matching
                text_parts = search_text.split()
                
                # Search Gazette table
                word_conditions = []
                base_conditions = [
                    Gazette.title.ilike(search_term),
                    Gazette.content.ilike(search_term),
                    Gazette.description.ilike(search_term),
                    Gazette.current_name.ilike(search_term),
                    Gazette.new_name.ilike(search_term),
                    Gazette.old_name.ilike(search_term),
                    Gazette.name_value.ilike(search_term),
                ]
                
                # Add word-by-word search for multi-word queries
                if len(text_parts) > 1:
                    for part in text_parts:
                        part_term = f"%{part}%"
                        word_conditions.extend([
                            Gazette.current_name.ilike(part_term),
                            Gazette.new_name.ilike(part_term),
                            Gazette.old_name.ilike(part_term),
                            Gazette.name_value.ilike(part_term),
                            Gazette.title.ilike(part_term),
                        ])
                    
                    # Try reversed order
                    reversed_text = " ".join(reversed(text_parts))
                    reversed_term = f"%{reversed_text}%"
                    base_conditions.extend([
                        Gazette.current_name.ilike(reversed_term),
                        Gazette.new_name.ilike(reversed_term),
                        Gazette.old_name.ilike(reversed_term),
                        Gazette.name_value.ilike(reversed_term),
                    ])
                
                # Search in alias_names using proper parameter binding
                alias_search_pattern = f"%{search_text_lower}%"
                alias_condition = text(
                    "(gazette_entries.alias_names IS NOT NULL AND "
                    "(jsonb_typeof(gazette_entries.alias_names) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements_text(gazette_entries.alias_names) AS alias_elem "
                    "WHERE LOWER(alias_elem::text) LIKE :search_pattern)) OR "
                    "(jsonb_typeof(gazette_entries.alias_names) != 'array' AND LOWER(gazette_entries.alias_names::text) LIKE :search_pattern))"
                ).params(search_pattern=alias_search_pattern)
                
                all_conditions = base_conditions + word_conditions + [alias_condition]
                
                gazette_results = self.db.query(Gazette).filter(
                    and_(
                        Gazette.is_public == True,
                        or_(*all_conditions)
                    )
                ).order_by(Gazette.publication_date.desc()).limit(10).all()
                
                search_results = [{
                    "id": g.id,
                    "title": g.title,
                    "gazette_number": g.gazette_number,
                    "gazette_date": g.gazette_date.isoformat() if g.gazette_date else None,
                    "gazette_type": g.gazette_type,
                    "current_name": g.current_name,
                    "new_name": g.new_name,
                    "old_name": g.old_name,
                    "name_value": g.name_value,
                    "alias_names": g.alias_names,
                    "person_name": g.current_name or g.name_value,
                    "old_place_of_birth": g.old_place_of_birth,
                    "new_place_of_birth": g.new_place_of_birth,
                    "place_of_birth": g.place_of_birth,
                    "old_date_of_birth": g.old_date_of_birth.isoformat() if g.old_date_of_birth else None,
                    "new_date_of_birth": g.new_date_of_birth.isoformat() if g.new_date_of_birth else None,
                    "source_table": "gazette_entries",
                } for g in gazette_results]
                
                # Also search correction_of_place_of_birth table
                correction_pob_results = self.db.query(CorrectionOfPlaceOfBirth).filter(
                    CorrectionOfPlaceOfBirth.person_name.ilike(search_term)
                ).limit(10).all()
                
                for entry in correction_pob_results:
                    search_results.append({
                        "id": entry.id,
                        "title": f"Correction of Place of Birth - {entry.person_name}",
                        "gazette_number": entry.gazette_number,
                        "gazette_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                        "publication_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                        "gazette_type": "CHANGE_OF_PLACE_OF_BIRTH",
                        "person_name": entry.person_name,
                        "current_name": entry.person_name,
                        "alias": entry.alias,
                        "alias_names": [entry.alias] if entry.alias else None,
                        "old_place_of_birth": entry.old_place_of_birth,
                        "new_place_of_birth": entry.new_place_of_birth,
                        "place_of_birth": entry.new_place_of_birth,
                        "source_table": "correction_of_place_of_birth",
                    })
                
                # Also search correction_of_date_of_birth table
                correction_dob_results = self.db.query(CorrectionOfDateOfBirth).filter(
                    CorrectionOfDateOfBirth.person_name.ilike(search_term)
                ).limit(10).all()
                
                for entry in correction_dob_results:
                    search_results.append({
                        "id": entry.id,
                        "title": f"Correction of Date of Birth - {entry.person_name}",
                        "gazette_number": entry.gazette_number,
                        "gazette_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                        "publication_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                        "gazette_type": "CHANGE_OF_DATE_OF_BIRTH",
                        "person_name": entry.person_name,
                        "current_name": entry.person_name,
                        "alias": entry.alias,
                        "alias_names": [entry.alias] if entry.alias else None,
                        "old_date_of_birth": entry.old_date_of_birth.isoformat() if entry.old_date_of_birth else None,
                        "new_date_of_birth": entry.new_date_of_birth.isoformat() if entry.new_date_of_birth else None,
                        "source_table": "correction_of_date_of_birth",
                    })
                
                # Also search marriage_officers table
                marriage_officer_results = self.db.query(MarriageOfficer).filter(
                    MarriageOfficer.officer_name.ilike(search_term)
                ).limit(10).all()
                
                for entry in marriage_officer_results:
                    search_results.append({
                        "id": entry.id,
                        "title": f"Marriage Officer - {entry.officer_name}",
                        "gazette_number": entry.gazette_number,
                        "gazette_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                        "publication_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                        "gazette_type": "APPOINTMENT_OF_MARRIAGE_OFFICERS",
                        "person_name": entry.officer_name,
                        "current_name": entry.officer_name,
                        "officer_name": entry.officer_name,
                        "church": entry.church,
                        "location": entry.location,
                        "appointing_authority": entry.appointing_authority,
                        "appointment_date": entry.appointment_date.isoformat() if entry.appointment_date else None,
                        "source_table": "marriage_officers",
                    })
            
            # Build system prompt
            system_prompt = """You are a helpful assistant that helps users search and understand gazette entries and related records from the Ghana Government Gazette.

CRITICAL: Searches are limited to the following tables ONLY: gazette_entries, correction_of_place_of_birth, correction_of_date_of_birth, and marriage_officers. Do NOT search the people table, cases table, or any other tables.

The database contains various types of records:

1. gazette_entries table:
- CHANGE_OF_NAME: Records of legal name changes with current names, old names, and alias names
- CHANGE_OF_DATE_OF_BIRTH: Records of date of birth corrections with old and new dates (from gazette entries)
- CHANGE_OF_PLACE_OF_BIRTH: Records of place of birth corrections with old and new places of birth (from gazette entries)
- APPOINTMENT_OF_MARRIAGE_OFFICERS: Records of marriage officer appointments (from gazette entries)
- DEATH_NOTICE: Death notices and obituaries
- LEGAL_NOTICE: Various legal notices
- BUSINESS_NOTICE: Business-related notices
- PROPERTY_NOTICE: Property-related notices
- REGULATORY_NOTICE: Regulatory notices
- COURT_NOTICE: Court notices
- BANKRUPTCY_NOTICE: Bankruptcy notices
- PROBATE_NOTICE: Probate notices
- OTHER: Various other government notices

2. correction_of_place_of_birth table:
- Contains dedicated records of place of birth corrections
- Fields: person_name, alias, old_place_of_birth, new_place_of_birth, gazette_number, gazette_date, source_details, etc.
- Searches by person_name column only

3. correction_of_date_of_birth table:
- Contains dedicated records of date of birth corrections
- Fields: person_name, alias, old_date_of_birth, new_date_of_birth, gazette_number, gazette_date, source_details, etc.
- Searches by person_name column only

4. marriage_officers table:
- Contains records of appointed marriage officers
- Fields: officer_name, church, location, appointing_authority, appointment_date, gazette_number, gazette_date, etc.
- Searches by officer_name column only

All searches are based exclusively on these tables. Do not reference or categorize results as "personal Record" or any other category. Do not search or reference the people table.

When you find search results, summarize them clearly and helpfully. Include:
- The number of results found and which table(s) they came from (source_table field)
- Key information from the results (names, dates, gazette numbers, places of birth, etc.)
- Any patterns or insights
- For correction_of_place_of_birth entries (source_table: "correction_of_place_of_birth"), mention: person_name, alias (if available), old_place_of_birth, new_place_of_birth, gazette_number, source_details
- For correction_of_date_of_birth entries (source_table: "correction_of_date_of_birth"), mention: person_name, alias (if available), old_date_of_birth, new_date_of_birth, gazette_number, source_details
- For marriage_officers entries (source_table: "marriage_officers"), mention: officer_name, church, location, appointing_authority, appointment_date, gazette_number
- For CHANGE_OF_PLACE_OF_BIRTH entries from gazette_entries, mention the old and new places of birth
- For CHANGE_OF_NAME entries, mention the old name, new name, and any aliases
- For CHANGE_OF_DATE_OF_BIRTH entries from gazette_entries, mention the old and new dates

If no results are found, suggest alternative search strategies:
- Try searching with just the first name or last name separately
- Try different name order (e.g., "Tutu Osei" instead of "Osei Tutu")
- Check if the name might be listed under aliases or previous names
- Try searching with partial names or initials
- Consider searching by record type (correction of place of birth, correction of date of birth, marriage officers), date range, or location if known
- Suggest that the name might be spelled differently or recorded with variations"""

            # Prepare context with search results
            context = ""
            if search_results:
                context = f"\n\nFound {len(search_results)} gazette entries:\n"
                for i, result in enumerate(search_results[:10], 1):  # Limit to 10 for context
                    context += f"\n{i}. {result.get('title', 'No title')}\n"
                    if result.get('name_value'):
                        context += f"   Name: {result['name_value']}\n"
                    if result.get('current_name'):
                        context += f"   Current Name: {result['current_name']}\n"
                    if result.get('old_name'):
                        context += f"   Old Name: {result['old_name']}\n"
                    if result.get('new_name'):
                        context += f"   New Name: {result['new_name']}\n"
                    if result.get('alias_names'):
                        aliases = result['alias_names']
                        if isinstance(aliases, list) and len(aliases) > 0:
                            context += f"   Aliases: {', '.join(aliases)}\n"
                        elif aliases:
                            context += f"   Aliases: {aliases}\n"
                    if result.get('gazette_type'):
                        context += f"   Type: {result['gazette_type'].replace('_', ' ')}\n"
                    if result.get('gazette_number'):
                        context += f"   Gazette #: {result['gazette_number']}\n"
                    if result.get('gazette_date'):
                        context += f"   Date: {result['gazette_date']}\n"
                    # Add place of birth information for CHANGE_OF_PLACE_OF_BIRTH entries
                    if result.get('gazette_type') == 'CHANGE_OF_PLACE_OF_BIRTH' or result.get('source_table') == 'correction_of_place_of_birth':
                        if result.get('old_place_of_birth'):
                            context += f"   Old Place of Birth: {result['old_place_of_birth']}\n"
                        if result.get('new_place_of_birth'):
                            context += f"   New Place of Birth: {result['new_place_of_birth']}\n"
                        if result.get('source_table'):
                            context += f"   Source Table: {result['source_table']}\n"
                    # Add date of birth information for CHANGE_OF_DATE_OF_BIRTH entries
                    if result.get('gazette_type') == 'CHANGE_OF_DATE_OF_BIRTH' or result.get('source_table') == 'correction_of_date_of_birth':
                        if result.get('old_date_of_birth'):
                            context += f"   Old Date of Birth: {result['old_date_of_birth']}\n"
                        if result.get('new_date_of_birth'):
                            context += f"   New Date of Birth: {result['new_date_of_birth']}\n"
                        if result.get('source_table'):
                            context += f"   Source Table: {result['source_table']}\n"
                    # Add marriage officer information
                    if result.get('gazette_type') == 'APPOINTMENT_OF_MARRIAGE_OFFICERS' or result.get('source_table') == 'marriage_officers':
                        if result.get('officer_name'):
                            context += f"   Officer Name: {result['officer_name']}\n"
                        if result.get('church'):
                            context += f"   Church: {result['church']}\n"
                        if result.get('location'):
                            context += f"   Location: {result['location']}\n"
                        if result.get('appointing_authority'):
                            context += f"   Appointing Authority: {result['appointing_authority']}\n"
                        if result.get('appointment_date'):
                            context += f"   Appointment Date: {result['appointment_date']}\n"
                        if result.get('source_table'):
                            context += f"   Source Table: {result['source_table']}\n"
            else:
                context = "\n\nNo gazette entries found matching the search criteria."
            
            # Build messages for OpenAI
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # Add chat history if provided
            if chat_history:
                for msg in chat_history[-10:]:  # Limit to last 10 messages
                    messages.append({
                        "role": "user" if msg["role"] == "user" else "assistant",
                        "content": msg["content"]
                    })
            
            # Add current user message with context
            user_prompt = f"{user_message}{context}"
            messages.append({"role": "user", "content": user_prompt})
            
            # Generate response
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                stream=False
            )
            
            ai_response = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else None
            response_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return {
                "success": True,
                "response": ai_response,
                "search_results": search_results,
                "search_params": search_params,
                "tokens_used": tokens_used,
                "response_time_ms": response_time_ms
            }
            
        except Exception as e:
            error = str(e)
            gazette_ai_logger.error(f"Error generating AI response: {error}")
            return {
                "success": False,
                "error": error,
                "response": "I apologize, but I encountered an error processing your request. Please try again.",
                "search_results": [],
                "tokens_used": tokens_used,
                "response_time_ms": response_time_ms
            }

