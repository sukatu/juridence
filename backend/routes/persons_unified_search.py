from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc, String, text
from typing import List, Optional, Dict, Any
from datetime import datetime
import math
import re

from database import get_db
from models.change_of_name import ChangeOfName
from models.correction_of_place_of_birth import CorrectionOfPlaceOfBirth
from models.correction_of_date_of_birth import CorrectionOfDateOfBirth
from models.marriage_officer import MarriageOfficer
from models.reported_cases import ReportedCases
from pydantic import BaseModel
from typing import Literal

router = APIRouter(prefix="/persons-unified-search", tags=["persons-unified-search"])

class UnifiedSearchResult(BaseModel):
    id: int
    source_type: Literal["change_of_name", "correction_of_place_of_birth", "correction_of_date_of_birth", "marriage_officer", "judgment"]
    # Common fields
    name: str  # The primary name to display
    data_source: str  # Human-readable source type
    
    # For change of name
    current_name: Optional[str] = None
    old_name: Optional[str] = None
    alias_names: Optional[List[str]] = None
    profession: Optional[str] = None
    gazette_number: Optional[str] = None
    gazette_date: Optional[datetime] = None
    page_number: Optional[int] = None
    
    # For correction of place of birth
    person_name: Optional[str] = None
    old_place_of_birth: Optional[str] = None
    new_place_of_birth: Optional[str] = None
    effective_date: Optional[datetime] = None
    
    # For correction of date of birth
    old_date_of_birth: Optional[datetime] = None
    new_date_of_birth: Optional[datetime] = None
    
    # For marriage officers
    officer_name: Optional[str] = None
    church: Optional[str] = None
    location: Optional[str] = None
    region: Optional[str] = None
    appointing_authority: Optional[str] = None

    # For judgments and rulings
    title: Optional[str] = None
    suit_reference_number: Optional[str] = None
    date: Optional[datetime] = None
    court_type: Optional[str] = None
    case_progress: Optional[str] = None
    protagonist: Optional[str] = None
    antagonist: Optional[str] = None
    case_summary: Optional[str] = None
    
    # Metadata
    match_type: Optional[Literal["current_name", "old_name", "alias"]] = None  # For change of name only
    
    class Config:
        from_attributes = True

class UnifiedSearchResponse(BaseModel):
    results: List[UnifiedSearchResult]
    total: int
    page: int
    limit: int
    total_pages: int
    source_counts: Dict[str, int]

@router.get("/", response_model=UnifiedSearchResponse)
async def unified_persons_search(
    query: str = Query(..., min_length=1, description="Search query (name)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(25, ge=1, le=100, description="Items per page"),
    source_type: Optional[Literal["change_of_name", "correction_of_place_of_birth", "correction_of_date_of_birth", "marriage_officer", "judgment"]] = Query(None, description="Limit results to one database"),
    include_judgments: bool = Query(False, description="Include published judgments and rulings"),
    db: Session = Depends(get_db)
):
    """Unified search across change_of_name, correction_of_place_of_birth, correction_of_date_of_birth, and marriage_officers tables"""
    
    try:
        search_lower = query.lower().strip()
        words = search_lower.split()
        
        # If multiple words, search for exact phrase
        # If single word, prefer whole-word but also allow partial matches
        if len(words) > 1:
            # Multiple words: search for exact phrase "Thomas Appiah"
            search_terms = [f"%{search_lower}%"]
            use_regex = False
        else:
            # Single word: search for whole word only (word boundary match)
            # Escape special regex characters in the search term
            escaped_word = re.escape(search_lower)
            search_terms = [escaped_word]
            use_regex = True
        
        all_results: List[Dict[str, Any]] = []
        
        # 1. Search change_of_name table
        change_of_name_query = db.query(ChangeOfName)
        
        # Search in new_name (current name)
        if use_regex:
            word = search_terms[0]
            new_name_match = or_(
                func.lower(ChangeOfName.new_name).op('~*')(f'\\y{word}\\y'),
                func.lower(ChangeOfName.new_name).like(f"%{search_lower}%")
            )
        else:
            new_name_conditions = [func.lower(ChangeOfName.new_name).like(term) for term in search_terms]
            new_name_match = or_(*new_name_conditions) if new_name_conditions else None
        
        # Search in old_name
        if use_regex:
            word = search_terms[0]
            old_name_match = or_(
                func.lower(ChangeOfName.old_name).op('~*')(f'\\y{word}\\y'),
                func.lower(ChangeOfName.old_name).like(f"%{search_lower}%")
            )
        else:
            old_name_conditions = [func.lower(ChangeOfName.old_name).like(term) for term in search_terms]
            old_name_match = or_(*old_name_conditions) if old_name_conditions else None
        
        # Search in alias_name (comma-separated text, can contain multiple names)
        # For alias, we always use regex if use_regex is true, otherwise like
        if use_regex:
            word = search_terms[0]
            alias_match = and_(
                ChangeOfName.alias_name.isnot(None),
                or_(
                    func.lower(ChangeOfName.alias_name).op('~*')(f'\\y{word}\\y'),
                    func.lower(ChangeOfName.alias_name).like(f"%{search_lower}%")
                )
            )
        else:
            alias_conditions = [func.lower(ChangeOfName.alias_name).like(term) for term in search_terms]
            alias_match = and_(
                ChangeOfName.alias_name.isnot(None),
                or_(*alias_conditions) if alias_conditions else None
            )
        
        # Get new name matches (current name)
        new_name_results = change_of_name_query.filter(new_name_match).all()
        for entry in new_name_results:
            all_results.append({
                "id": entry.id,
                "source_type": "change_of_name",
                "data_source": "Change of Name",
                "name": entry.new_name or "",
                "current_name": entry.new_name,  # new_name is the current name
                "old_name": entry.old_name,
                "alias_names": [alias.strip() for alias in entry.alias_name.split(",") if alias.strip()] if entry.alias_name else [],  # Split comma-separated aliases
                "profession": entry.profession,
                "gazette_number": str(entry.gazette_number) if entry.gazette_number is not None else None,
                "gazette_date": entry.gazette_date,
                "page_number": entry.page_number,
                "match_type": "current_name"
            })
        
        # Get old name matches
        old_name_results = change_of_name_query.filter(old_name_match).all()
        for entry in old_name_results:
            # Skip if already added as current_name match
            if not any(r["id"] == entry.id and r["match_type"] == "current_name" for r in all_results):
                all_results.append({
                    "id": entry.id,
                    "source_type": "change_of_name",
                    "data_source": "Change of Name",
                    "name": entry.old_name or "",
                    "current_name": entry.new_name,
                    "old_name": entry.old_name,
                    "alias_names": [alias.strip() for alias in entry.alias_name.split(",") if alias.strip()] if entry.alias_name else [],
                    "profession": entry.profession,
                    "gazette_number": entry.gazette_number,
                    "gazette_date": entry.gazette_date,
                    "page_number": entry.page_number,
                    "match_type": "old_name"
                })
        
        # Get alias matches
        alias_results = change_of_name_query.filter(alias_match).all()
        for entry in alias_results:
            # Check if this alias matches the search query
            alias_names_str = entry.alias_name or ""
            alias_names = [alias.strip() for alias in alias_names_str.split(",") if alias.strip()]
            # Match if the search query (exact phrase or single word) appears in any alias
            matching_aliases = []
            for alias in alias_names:
                alias_lower = alias.lower()
                # Check if search query matches (exact phrase for multi-word, whole word for single word)
                if use_regex:
                    # Use word boundary matching for single-word queries
                    word_pattern = re.compile(r'\b' + re.escape(search_lower) + r'\b', re.IGNORECASE)
                    if word_pattern.search(alias_lower):
                        matching_aliases.append(alias)
                else:
                    # Use exact phrase matching for multi-word queries
                    if search_lower in alias_lower:
                        matching_aliases.append(alias)
            
            for alias in matching_aliases:
                # Skip if already added
                if not any(r["id"] == entry.id and r["match_type"] in ["current_name", "old_name"] for r in all_results):
                    all_results.append({
                        "id": entry.id,
                        "source_type": "change_of_name",
                        "data_source": "Change of Name",
                        "name": alias,
                        "current_name": entry.new_name,
                        "old_name": entry.old_name,
                        "alias_names": alias_names,
                        "profession": entry.profession,
                        "gazette_number": entry.gazette_number,
                        "gazette_date": entry.gazette_date,
                        "page_number": entry.page_number,
                        "match_type": "alias"
                    })
        
        # 2. Search correction_of_place_of_birth
        if use_regex:
            word = search_terms[0]
            place_of_birth_query = db.query(CorrectionOfPlaceOfBirth).filter(
                or_(
                    func.lower(CorrectionOfPlaceOfBirth.person_name).op('~*')(f'\\y{word}\\y'),
                    func.lower(CorrectionOfPlaceOfBirth.person_name).like(f"%{search_lower}%"),
                    func.lower(CorrectionOfPlaceOfBirth.alias).op('~*')(f'\\y{word}\\y'),
                    func.lower(CorrectionOfPlaceOfBirth.alias).like(f"%{search_lower}%")
                )
            )
        else:
            place_of_birth_conditions = [
                CorrectionOfPlaceOfBirth.person_name.ilike(term)
                for term in search_terms
            ]
            place_of_birth_alias_conditions = [
                CorrectionOfPlaceOfBirth.alias.ilike(term)
                for term in search_terms
            ]
            place_of_birth_query = db.query(CorrectionOfPlaceOfBirth).filter(
                or_(*(place_of_birth_conditions + place_of_birth_alias_conditions)) if (place_of_birth_conditions or place_of_birth_alias_conditions) else None
            )
        place_of_birth_results = place_of_birth_query.all()
        for entry in place_of_birth_results:
            all_results.append({
                "id": entry.id,
                "source_type": "correction_of_place_of_birth",
                "data_source": "Correction of Place of Birth",
                "name": entry.person_name or "",
                "person_name": entry.person_name,
                "old_place_of_birth": entry.old_place_of_birth,
                "new_place_of_birth": entry.new_place_of_birth,
                "effective_date": entry.effective_date,
                "gazette_number": str(entry.gazette_number) if entry.gazette_number is not None else None,
                "gazette_date": entry.gazette_date,
                "page_number": entry.page,  # CorrectionOfPlaceOfBirth uses 'page'
            })
        
        # 3. Search correction_of_date_of_birth
        if use_regex:
            word = search_terms[0]
            date_of_birth_query = db.query(CorrectionOfDateOfBirth).filter(
                or_(
                    func.lower(CorrectionOfDateOfBirth.person_name).op('~*')(f'\\y{word}\\y'),
                    func.lower(CorrectionOfDateOfBirth.person_name).like(f"%{search_lower}%"),
                    func.lower(CorrectionOfDateOfBirth.alias).op('~*')(f'\\y{word}\\y'),
                    func.lower(CorrectionOfDateOfBirth.alias).like(f"%{search_lower}%")
                )
            )
        else:
            date_of_birth_conditions = [
                CorrectionOfDateOfBirth.person_name.ilike(term)
                for term in search_terms
            ]
            date_of_birth_alias_conditions = [
                CorrectionOfDateOfBirth.alias.ilike(term)
                for term in search_terms
            ]
            date_of_birth_query = db.query(CorrectionOfDateOfBirth).filter(
                or_(*(date_of_birth_conditions + date_of_birth_alias_conditions)) if (date_of_birth_conditions or date_of_birth_alias_conditions) else None
            )
        date_of_birth_results = date_of_birth_query.all()
        for entry in date_of_birth_results:
            all_results.append({
                "id": entry.id,
                "source_type": "correction_of_date_of_birth",
                "data_source": "Correction of Date of Birth",
                "name": entry.person_name or "",
                "person_name": entry.person_name,
                "old_date_of_birth": entry.old_date_of_birth,
                "new_date_of_birth": entry.new_date_of_birth,
                "effective_date": entry.effective_date,
                "gazette_number": str(entry.gazette_number) if entry.gazette_number is not None else None,
                "gazette_date": entry.gazette_date,
                "page_number": entry.page,  # CorrectionOfDateOfBirth uses 'page'
            })
        
        # 4. Search marriage_officers
        # Use ILIKE for maximum compatibility; coalesce to empty string for NULL-safe partial match
        _pat = f"%{search_lower}%"
        marriage_officer_query = db.query(MarriageOfficer).filter(
            or_(
                func.coalesce(MarriageOfficer.officer_name, "").ilike(_pat),
                func.coalesce(MarriageOfficer.church, "").ilike(_pat),
                func.coalesce(MarriageOfficer.location, "").ilike(_pat),
                func.coalesce(MarriageOfficer.region, "").ilike(_pat),
                func.coalesce(MarriageOfficer.appointing_authority, "").ilike(_pat),
                func.coalesce(MarriageOfficer.appointing_authority_title, "").ilike(_pat),
            )
        )
        marriage_officer_results = marriage_officer_query.all()
        for entry in marriage_officer_results:
            all_results.append({
                "id": entry.id,
                "source_type": "marriage_officer",
                "data_source": "Marriage Officer",
                "name": entry.officer_name or "",
                "officer_name": entry.officer_name,
                "church": entry.church,
                "location": entry.location,
                "region": entry.region,
                "appointing_authority": entry.appointing_authority,
                "gazette_number": str(entry.gazette_number) if entry.gazette_number is not None else None,
                "gazette_date": entry.gazette_date,
            })

        # 5. Search published judgments only when explicitly requested. Existing
        # API consumers continue to receive the four Gazette datasets by default.
        if include_judgments or source_type == "judgment":
            judgment_query = db.query(ReportedCases).filter(
                or_(
                    func.coalesce(ReportedCases.title, "").ilike(_pat),
                    func.coalesce(ReportedCases.protagonist, "").ilike(_pat),
                    func.coalesce(ReportedCases.antagonist, "").ilike(_pat),
                    func.coalesce(ReportedCases.presiding_judge, "").ilike(_pat),
                    func.coalesce(ReportedCases.lawyers, "").ilike(_pat),
                )
            )
            for entry in judgment_query.all():
                all_results.append({
                    "id": entry.id,
                    "source_type": "judgment",
                    "data_source": "Judgments & Rulings",
                    "name": entry.title or entry.protagonist or entry.antagonist or "Untitled case",
                    "title": entry.title,
                    "suit_reference_number": entry.suit_reference_number or entry.citation,
                    "date": entry.date,
                    "court_type": entry.court_type,
                    "case_progress": entry.case_progress or entry.status,
                    "protagonist": entry.protagonist,
                    "antagonist": entry.antagonist,
                    "case_summary": entry.case_summary,
                })
        
        # Remove duplicates (keep first occurrence)
        seen = set()
        unique_results = []
        for result in all_results:
            key = (result["source_type"], result["id"], result.get("match_type"))
            if key not in seen:
                seen.add(key)
                unique_results.append(result)

        source_counts: Dict[str, int] = {}
        for result in unique_results:
            result_source = result["source_type"]
            source_counts[result_source] = source_counts.get(result_source, 0) + 1

        if source_type:
            unique_results = [result for result in unique_results if result["source_type"] == source_type]
        
        # Sort results (prefer current_name matches, then old_name, then alias, then others)
        def sort_key(result):
            if result.get("match_type") == "current_name":
                return (0, result["name"])
            elif result.get("match_type") == "old_name":
                return (1, result["name"])
            elif result.get("match_type") == "alias":
                return (2, result["name"])
            else:
                return (3, result["name"])
        
        unique_results.sort(key=sort_key)
        
        total = len(unique_results)
        total_pages = math.ceil(total / limit) if total else 0
        start = (page - 1) * limit
        paginated_results = unique_results[start:start + limit]
        
        response_results = []
        for result in paginated_results:
            # Normalize empty date strings to None to satisfy Pydantic datetime parsing
            for field in ("gazette_date", "effective_date", "old_date_of_birth", "new_date_of_birth"):
                if result.get(field) == "":
                    result[field] = None
            response_results.append(UnifiedSearchResult(**result))
        
        return UnifiedSearchResponse(
            results=response_results,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            source_counts=source_counts,
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error in unified search: {str(e)}")

@router.get("/{source_type}/{entry_id}", response_model=Dict[str, Any])
async def get_entry_details(
    source_type: Literal["change_of_name", "correction_of_place_of_birth", "correction_of_date_of_birth", "marriage_officer", "judgment"],
    entry_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information for a specific entry"""
    
    try:
        def _safe_iso(value):
            return value.isoformat() if hasattr(value, "isoformat") else value
        if source_type == "change_of_name":
            entry = db.query(ChangeOfName).filter(ChangeOfName.id == entry_id).first()
            if not entry:
                raise HTTPException(status_code=404, detail="Entry not found")
            # Parse comma-separated alias names
            alias_names = [alias.strip() for alias in entry.alias_name.split(",")] if entry.alias_name else []
            return {
                "id": entry.id,
                "source_type": "change_of_name",
                "data_source": "Change of Name",
                "current_name": entry.new_name,  # new_name is the current name
                "old_name": entry.old_name,
                "alias_names": alias_names,
                "profession": entry.profession,
                "gender": entry.gender,
                "address": entry.address,
                "town_city": entry.town_city,
                "region": entry.region,
                "gazette_number": str(entry.gazette_number) if entry.gazette_number is not None else None,
                "gazette_date": _safe_iso(entry.gazette_date) if entry.gazette_date else None,
                "page_number": entry.page_number,
                "source_details": entry.source_details,
                "source": entry.source,
                "effective_date": _safe_iso(entry.effective_date) if entry.effective_date else None,
                "remarks": entry.remarks,
                "item_number": entry.item_number,
                "document_filename": entry.document_filename,
            }
        elif source_type == "correction_of_place_of_birth":
            entry = db.query(CorrectionOfPlaceOfBirth).filter(CorrectionOfPlaceOfBirth.id == entry_id).first()
            if not entry:
                raise HTTPException(status_code=404, detail="Entry not found")
            return {
                "id": entry.id,
                "source_type": "correction_of_place_of_birth",
                "data_source": "Correction of Place of Birth",
                "person_name": entry.person_name,
                "old_place_of_birth": entry.old_place_of_birth,
                "new_place_of_birth": entry.new_place_of_birth,
                "effective_date": _safe_iso(entry.effective_date) if entry.effective_date else None,
                "gazette_number": str(entry.gazette_number) if entry.gazette_number is not None else None,
                "gazette_date": _safe_iso(entry.gazette_date) if entry.gazette_date else None,
                "page_number": entry.page,  # CorrectionOfPlaceOfBirth uses 'page'
                "source_details": entry.source_details,
                "alias": entry.alias,
            }
        elif source_type == "correction_of_date_of_birth":
            entry = db.query(CorrectionOfDateOfBirth).filter(CorrectionOfDateOfBirth.id == entry_id).first()
            if not entry:
                raise HTTPException(status_code=404, detail="Entry not found")
            return {
                "id": entry.id,
                "source_type": "correction_of_date_of_birth",
                "data_source": "Correction of Date of Birth",
                "person_name": entry.person_name,
                "old_date_of_birth": _safe_iso(entry.old_date_of_birth) if entry.old_date_of_birth else None,
                "new_date_of_birth": _safe_iso(entry.new_date_of_birth) if entry.new_date_of_birth else None,
                "effective_date": _safe_iso(entry.effective_date) if entry.effective_date else None,
                "gazette_number": str(entry.gazette_number) if entry.gazette_number is not None else None,
                "gazette_date": _safe_iso(entry.gazette_date) if entry.gazette_date else None,
                "page_number": entry.page,  # CorrectionOfDateOfBirth uses 'page'
                "source_details": entry.source_details,
            }
        elif source_type == "marriage_officer":
            entry = db.query(MarriageOfficer).filter(MarriageOfficer.id == entry_id).first()
            if not entry:
                raise HTTPException(status_code=404, detail="Entry not found")
            return {
                "id": entry.id,
                "source_type": "marriage_officer",
                "data_source": "Marriage Officer",
                "officer_name": entry.officer_name,
                "church": entry.church,
                "location": entry.location,
                "region": entry.region,
                "appointing_authority": entry.appointing_authority,
                "appointing_authority_title": entry.appointing_authority_title,
                "appointment_date": _safe_iso(entry.appointment_date) if entry.appointment_date else None,
                "gazette_number": str(entry.gazette_number) if entry.gazette_number is not None else None,
                "gazette_date": _safe_iso(entry.gazette_date) if entry.gazette_date else None,
                "page_number": entry.page_number,
                "source_details": entry.source_details,
            }
        elif source_type == "judgment":
            entry = db.query(ReportedCases).filter(ReportedCases.id == entry_id).first()
            if not entry:
                raise HTTPException(status_code=404, detail="Entry not found")
            return {
                "id": entry.id,
                "source_type": "judgment",
                "data_source": "Judgments & Rulings",
                "title": entry.title,
                "suit_reference_number": entry.suit_reference_number or entry.citation,
                "date": _safe_iso(entry.date) if entry.date else None,
                "court_type": entry.court_type,
                "court_division": entry.court_division,
                "case_progress": entry.case_progress or entry.status,
                "protagonist": entry.protagonist,
                "antagonist": entry.antagonist,
                "presiding_judge": entry.presiding_judge,
                "area_of_law": entry.area_of_law,
                "case_summary": entry.case_summary,
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid source type")
            
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching entry details: {str(e)}")
