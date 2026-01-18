from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc, text
from database import get_db
from models.reported_cases import ReportedCases
from models.case_metadata import CaseMetadata, CaseSearchIndex
from models.case_hearings import CaseHearing
from models.user import User
from schemas.case_metadata import (
    CaseSearchResponse, CaseSearchResult, CaseStats, PersonCaseProfile
)
from auth import get_current_user
from typing import List, Optional, Dict, Any
import logging
import math
import time
import re

router = APIRouter()

@router.get("/search", response_model=CaseSearchResponse)
async def search_cases(
    query: str = Query(..., min_length=2, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    case_type: Optional[str] = Query(None, description="Filter by case type"),
    area_of_law: Optional[str] = Query(None, description="Filter by area of law"),
    court_type: Optional[str] = Query(None, description="Filter by court type"),
    status: Optional[str] = Query(None, description="Filter by case status"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # Temporarily disabled for testing
):
    """Search cases by person name, title, or content"""
    
    start_time = time.time()
    
    # Build search query
    search_term = f"%{query.lower()}%"
    
    # Base query
    cases_query = db.query(ReportedCases).outerjoin(
        CaseMetadata, ReportedCases.id == CaseMetadata.case_id
    ).outerjoin(
        CaseSearchIndex, ReportedCases.id == CaseSearchIndex.case_id
    )
    
    # Search conditions - search only in title field
    search_conditions = func.lower(ReportedCases.title).like(search_term)
    
    cases_query = cases_query.filter(search_conditions)
    
    # Apply filters
    if case_type:
        cases_query = cases_query.filter(ReportedCases.type == case_type)
    if area_of_law:
        cases_query = cases_query.filter(ReportedCases.area_of_law.like(f"%{area_of_law}%"))
    if court_type:
        cases_query = cases_query.filter(ReportedCases.court_type == court_type)
    if status:
        cases_query = cases_query.filter(ReportedCases.status == status)
    
    # Get total count
    total_cases = cases_query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    cases = cases_query.offset(offset).limit(limit).all()
    
    # Convert to search results
    results = []
    for case in cases:
        # Determine match type
        match_type = "title"
        if case.title and query.lower() in case.title.lower():
            match_type = "title"
        elif case.protagonist and query.lower() in case.protagonist.lower():
            match_type = "protagonist"
        elif case.antagonist and query.lower() in case.antagonist.lower():
            match_type = "antagonist"
        elif case.presiding_judge and query.lower() in case.presiding_judge.lower():
            match_type = "judge"
        elif case.lawyers and query.lower() in case.lawyers.lower():
            match_type = "lawyer"
        else:
            match_type = "content"
        
        # Calculate relevance score
        relevance_score = calculate_relevance_score(case, query)
        
        # Get metadata if available
        metadata = case.case_metadata
        case_result = CaseSearchResult(
            id=case.id,
            title=case.title or "",
            suit_reference_number=case.suit_reference_number,
            date=case.date,
            presiding_judge=case.presiding_judge,
            court_type=case.court_type,
            court_division=case.court_division,
            area_of_law=case.area_of_law,
            status=str(case.status) if case.status is not None else None,
            case_progress=str(case.case_progress or case.status) if (case.case_progress or case.status) is not None else None,
            protagonist=case.protagonist,
            antagonist=case.antagonist,
            case_summary=metadata.case_summary if metadata else case.case_summary,
            judges=metadata.judges if metadata else None,
            lawyers=metadata.lawyers if metadata else None,
            related_people=metadata.related_people if metadata else None,
            organizations=metadata.organizations if metadata else None,
            banks_involved=metadata.banks_involved if metadata else None,
            insurance_involved=metadata.insurance_involved if metadata else None,
            resolution_status=metadata.resolution_status if metadata else None,
            outcome=metadata.outcome if metadata else None,
            decision_type=metadata.decision_type if metadata else None,
            monetary_amount=metadata.monetary_amount if metadata else None,
            relevance_score=relevance_score,
            match_type=match_type
        )
        results.append(case_result)
    
    # Sort by relevance score
    results.sort(key=lambda x: x.relevance_score, reverse=True)
    
    # Calculate pagination info
    total_pages = math.ceil(total_cases / limit)
    has_next = page < total_pages
    has_prev = page > 1
    
    search_time = (time.time() - start_time) * 1000  # Convert to milliseconds
    
    return CaseSearchResponse(
        results=results,
        total=total_cases,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev,
        search_time_ms=search_time,
        query=query
    )

@router.get("/person/{person_name}", response_model=PersonCaseProfile)
async def get_person_cases(
    person_name: str,
    person_id: Optional[int] = Query(None, description="Person ID to fetch linked cases"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all cases for a specific person"""
    
    # First, get cases from PersonCaseLink if person_id is provided
    linked_case_ids = set()
    if person_id:
        from models.person_case_link import PersonCaseLink
        person_links = db.query(PersonCaseLink).filter(
            PersonCaseLink.person_id == person_id,
            PersonCaseLink.case_id.isnot(None)
        ).all()
        linked_case_ids = {link.case_id for link in person_links if link.case_id}
    
    # Search for cases involving this person by name
    search_term = f"%{person_name.lower()}%"
    
    # Build filter conditions
    name_filters = [
        func.lower(ReportedCases.title).like(search_term),
        func.lower(ReportedCases.protagonist).like(search_term),
        func.lower(ReportedCases.antagonist).like(search_term),
        func.lower(ReportedCases.presiding_judge).like(search_term),
        func.lower(ReportedCases.lawyers).like(search_term),
        func.lower(CaseMetadata.related_people).like(search_term)
    ]
    
    # Add linked case IDs filter if any exist
    if linked_case_ids:
        name_filters.append(ReportedCases.id.in_(linked_case_ids))
    
    cases_query = db.query(ReportedCases).outerjoin(
        CaseMetadata, ReportedCases.id == CaseMetadata.case_id
    ).filter(
        or_(*name_filters)
    )
    
    total_cases = cases_query.count()
    cases = cases_query.offset((page - 1) * limit).limit(limit).all()
    
    # Convert to search results
    results = []
    for case in cases:
        relevance_score = calculate_relevance_score(case, person_name)
        metadata = case.case_metadata
        
        case_result = CaseSearchResult(
            id=case.id,
            title=case.title or "",
            suit_reference_number=case.suit_reference_number,
            date=case.date,
            presiding_judge=case.presiding_judge,
            court_type=case.court_type,
            court_division=case.court_division,
            area_of_law=case.area_of_law,
            status=str(case.status) if case.status is not None else None,
            case_progress=str(case.case_progress or case.status) if (case.case_progress or case.status) is not None else None,
            protagonist=case.protagonist,
            antagonist=case.antagonist,
            case_summary=metadata.case_summary if metadata else case.case_summary,
            judges=metadata.judges if metadata else None,
            lawyers=metadata.lawyers if metadata else None,
            related_people=metadata.related_people if metadata else None,
            organizations=metadata.organizations if metadata else None,
            banks_involved=metadata.banks_involved if metadata else None,
            insurance_involved=metadata.insurance_involved if metadata else None,
            resolution_status=metadata.resolution_status if metadata else None,
            outcome=metadata.outcome if metadata else None,
            decision_type=metadata.decision_type if metadata else None,
            monetary_amount=metadata.monetary_amount if metadata else None,
            relevance_score=relevance_score,
            match_type="person"
        )
        results.append(case_result)
    
    # Calculate stats
    stats = calculate_person_stats(cases, person_name)
    
    # Get affiliations and related people
    affiliations = set()
    related_people = set()
    organizations = set()
    
    for case in cases:
        if case.case_metadata:
            if case.case_metadata.organizations:
                affiliations.update(case.case_metadata.organizations)
            if case.case_metadata.related_people:
                related_people.update(case.case_metadata.related_people)
            if case.case_metadata.organizations:
                organizations.update(case.case_metadata.organizations)
    
    return PersonCaseProfile(
        person_name=person_name,
        total_cases=total_cases,
        resolved_cases=stats.resolved_cases,
        pending_cases=stats.pending_cases,
        favorable_outcomes=stats.favorable_outcomes,
        cases=results,
        stats=stats,
        affiliations=list(affiliations),
        related_people=list(related_people),
        organizations=list(organizations)
    )

@router.get("/suggestions")
async def get_case_suggestions(
    query: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum suggestions"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get case search suggestions for autocomplete"""
    
    search_term = f"%{query.lower()}%"
    
    # Get suggestions from case titles
    case_titles = db.query(ReportedCases.title).filter(
        func.lower(ReportedCases.title).like(search_term)
    ).limit(limit // 2).all()
    
    # Get suggestions from person names
    person_names = db.query(ReportedCases.protagonist).filter(
        func.lower(ReportedCases.protagonist).like(search_term)
    ).union(
        db.query(ReportedCases.antagonist).filter(
            func.lower(ReportedCases.antagonist).like(search_term)
        )
    ).limit(limit // 2).all()
    
    suggestions = []
    
    # Add case titles
    for title in case_titles:
        if title[0]:
            suggestions.append({
                "text": title[0],
                "type": "case",
                "category": "Case Title"
            })
    
    # Add person names
    for name in person_names:
        if name[0]:
            suggestions.append({
                "text": name[0],
                "type": "person",
                "category": "Person"
            })
    
    return {
        "suggestions": suggestions[:limit],
        "total": len(suggestions)
    }

def calculate_relevance_score(case: ReportedCases, query: str) -> float:
    """Calculate relevance score for a case based on search query"""
    score = 0.0
    query_lower = query.lower()
    
    # Title match (highest weight)
    if case.title and query_lower in case.title.lower():
        score += 10.0
        # Exact match bonus
        if case.title.lower() == query_lower:
            score += 5.0
    
    # Protagonist/Antagonist match (high weight)
    if case.protagonist and query_lower in case.protagonist.lower():
        score += 8.0
    if case.antagonist and query_lower in case.antagonist.lower():
        score += 8.0
    
    # Judge match (medium weight)
    if case.presiding_judge and query_lower in case.presiding_judge.lower():
        score += 6.0
    
    # Lawyer match (medium weight)
    if case.lawyers and query_lower in case.lawyers.lower():
        score += 6.0
    
    # Content match (lower weight)
    if case.case_summary and query_lower in case.case_summary.lower():
        score += 3.0
    if case.detail_content and query_lower in case.detail_content.lower():
        score += 2.0
    if case.judgement and query_lower in case.judgement.lower():
        score += 2.0
    
    return score

def calculate_person_stats(cases: List[ReportedCases], person_name: str) -> CaseStats:
    """Calculate statistics for a person's cases"""
    total_cases = len(cases)
    resolved_cases = 0
    pending_cases = 0
    favorable_outcomes = 0
    unfavorable_outcomes = 0
    mixed_outcomes = 0
    
    people_involved = set()
    organizations = set()
    banks = set()
    insurance = set()
    
    for case in cases:
        # Count resolved/pending cases
        if case.status == "1" or case.status == "resolved":
            resolved_cases += 1
        else:
            pending_cases += 1
        
        # Count outcomes (simplified logic)
        if case.case_metadata and case.case_metadata.outcome:
            if case.case_metadata.outcome.lower() in ["favorable", "won", "successful"]:
                favorable_outcomes += 1
            elif case.case_metadata.outcome.lower() in ["unfavorable", "lost", "unsuccessful"]:
                unfavorable_outcomes += 1
            else:
                mixed_outcomes += 1
        
        # Collect people and organizations
        if case.protagonist:
            people_involved.add(case.protagonist)
        if case.antagonist:
            people_involved.add(case.antagonist)
        if case.presiding_judge:
            people_involved.add(case.presiding_judge)
        
        if case.case_metadata:
            if case.case_metadata.related_people:
                people_involved.update(case.case_metadata.related_people)
            if case.case_metadata.organizations:
                organizations.update(case.case_metadata.organizations)
            if case.case_metadata.banks_involved:
                banks.update(case.case_metadata.banks_involved)
            if case.case_metadata.insurance_involved:
                insurance.update(case.case_metadata.insurance_involved)
    
    return CaseStats(
        total_cases=total_cases,
        resolved_cases=resolved_cases,
        pending_cases=pending_cases,
        favorable_outcomes=favorable_outcomes,
        unfavorable_outcomes=unfavorable_outcomes,
        mixed_outcomes=mixed_outcomes,
        total_people_involved=len(people_involved),
        total_organizations=len(organizations),
        total_banks=len(banks),
        total_insurance=len(insurance)
    )

@router.get("/{case_id}/details")
async def get_case_details(
    case_id: int,
    db: Session = Depends(get_db)
    # Temporarily disabled authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific case including all metadata"""
    
    # Get the case with metadata
    case = db.query(ReportedCases).outerjoin(
        CaseMetadata, ReportedCases.id == CaseMetadata.case_id
    ).filter(ReportedCases.id == case_id).first()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    metadata = case.case_metadata
    
    # Get case hearings
    hearings = db.query(CaseHearing).filter(
        CaseHearing.case_id == case_id
    ).order_by(CaseHearing.hearing_date).all()
    
    # Format hearings data
    hearings_data = []
    for hearing in hearings:
        hearings_data.append({
            "id": hearing.id,
            "hearing_date": hearing.hearing_date,
            "hearing_time": hearing.hearing_time,
            "coram": hearing.coram,
            "remark": hearing.remark.value if hearing.remark else None,
            "proceedings": hearing.proceedings,
            "created_at": hearing.created_at,
            "updated_at": hearing.updated_at
        })
    
    # Parse citation data from metadata
    citing_cases = []
    citation_count = 0
    if metadata and metadata.cases_cited:
        try:
            import json
            if isinstance(metadata.cases_cited, str):
                citation_data = json.loads(metadata.cases_cited)
                citing_cases = citation_data.get('citing_cases', [])
                citation_count = citation_data.get('citation_count', 0)
            elif isinstance(metadata.cases_cited, list):
                citing_cases = metadata.cases_cited
                citation_count = len(citing_cases)
        except (json.JSONDecodeError, AttributeError):
            # If parsing fails, treat as empty
            citing_cases = []
            citation_count = 0
    
    # Build detailed response
    case_details = {
        "id": case.id,
        "title": case.title,
        "suit_reference_number": case.suit_reference_number,
        "date": case.date,
        "year": case.year,
        "presiding_judge": case.presiding_judge,
        "judgement_by": case.judgement_by,
        "opinion_by": case.opinion_by,
        "court_type": case.court_type,
        "court_division": case.court_division,
        "area_of_law": case.area_of_law,
        "status": str(case.status) if case.status is not None else None,
        "type": case.type,
        "dl_type": case.dl_type,
        "dl_citation_no": case.dl_citation_no,
        "citation": case.citation,
        "protagonist": case.protagonist,
        "antagonist": case.antagonist,
        "lawyers": case.lawyers,
        "town": case.town,
        "region": case.region,
        "published": case.published,
        "file_name": case.file_name,
        "file_url": case.file_url,
        "firebase_url": case.firebase_url,
        "created_at": case.created_at,
        "updated_at": case.updated_at,
        
        # Case content
        "case_summary": case.case_summary,
        "detail_content": case.detail_content,
        "decision": case.decision,
        "judgement": case.judgement,
        "commentary": case.commentary,
        "headnotes": case.headnotes,
        "keywords_phrases": case.keywords_phrases,
        "statutes_cited": case.statutes_cited,
        "cases_cited": case.cases_cited,
        "summernote": case.summernote,
        "summernote_content": metadata.summernote_content if metadata else None,
        "conclusion": case.conclusion,
        
        # AI Banking Summary Fields
        "ai_case_outcome": case.ai_case_outcome,
        "ai_court_orders": case.ai_court_orders,
        "ai_financial_impact": case.ai_financial_impact,
        "ai_detailed_outcome": case.ai_detailed_outcome,
        "ai_summary_generated_at": case.ai_summary_generated_at,
        "ai_summary_version": case.ai_summary_version,
        
        # Citation data
        "citing_cases": {
            "count": citation_count,
            "cases": citing_cases[:50]  # Limit to first 50 for performance
        },
        
        # Hearings data
        "hearings": hearings_data,
        
        # Metadata (if available)
        "metadata": {
            "case_summary": metadata.case_summary if metadata else None,
            "case_type": metadata.case_type if metadata else None,
            "area_of_law": metadata.area_of_law if metadata else None,
            "keywords": metadata.keywords if metadata else None,
            "judges": metadata.judges if metadata else None,
            "lawyers": metadata.lawyers if metadata else None,
            "related_people": metadata.related_people if metadata else None,
            "protagonist": metadata.protagonist if metadata else None,
            "antagonist": metadata.antagonist if metadata else None,
            "organizations": metadata.organizations if metadata else None,
            "banks_involved": metadata.banks_involved if metadata else None,
            "insurance_involved": metadata.insurance_involved if metadata else None,
            "resolution_status": metadata.resolution_status if metadata else None,
            "outcome": metadata.outcome if metadata else None,
            "decision_type": metadata.decision_type if metadata else None,
            "monetary_amount": metadata.monetary_amount if metadata else None,
            "statutes_cited": metadata.statutes_cited if metadata else None,
            "cases_cited": metadata.cases_cited if metadata else None,
            "court_type": metadata.court_type if metadata else None,
            "court_division": metadata.court_division if metadata else None,
            "search_keywords": metadata.search_keywords if metadata else None,
            "relevance_score": metadata.relevance_score if metadata else None,
            "is_processed": metadata.is_processed if metadata else None,
            "created_at": metadata.created_at if metadata else None,
            "updated_at": metadata.updated_at if metadata else None,
            "processed_at": metadata.processed_at if metadata else None
        }
    }
    
    return case_details

@router.get("/{case_id}/related-cases")
async def get_related_cases(
    case_id: int,
    limit: int = Query(10, ge=1, le=50, description="Maximum related cases"),
    db: Session = Depends(get_db)
):
    """Get cases related to the people involved in the current case"""
    
    # Get the current case
    current_case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    if not current_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Extract people from current case
    people_to_search = []
    
    # Add protagonist and antagonist
    if current_case.protagonist:
        people_to_search.append(current_case.protagonist.strip())
    if current_case.antagonist:
        people_to_search.append(current_case.antagonist.strip())
    
    # Add lawyers
    if current_case.lawyers:
        lawyers = [lawyer.strip() for lawyer in current_case.lawyers.split(',') if lawyer.strip()]
        people_to_search.extend(lawyers)
    
    # Add presiding judge
    if current_case.presiding_judge:
        if isinstance(current_case.presiding_judge, list):
            people_to_search.extend([judge.strip() for judge in current_case.presiding_judge if judge.strip()])
        else:
            people_to_search.append(current_case.presiding_judge.strip())
    
    # Add judgement by
    if current_case.judgement_by and current_case.judgement_by != '-':
        people_to_search.append(current_case.judgement_by.strip())
    
    # Remove duplicates and empty strings
    people_to_search = list(set([person for person in people_to_search if person and person != '-']))
    
    if not people_to_search:
        return {
            "related_cases": [],
            "total": 0,
            "search_people": []
        }
    
    # Search for cases involving these people
    related_cases = []
    
    for person in people_to_search:
        # Search in title, protagonist, antagonist, lawyers, presiding_judge, judgement_by
        person_cases = db.query(ReportedCases).filter(
            or_(
                func.lower(ReportedCases.title).like(f"%{person.lower()}%"),
                func.lower(ReportedCases.protagonist).like(f"%{person.lower()}%"),
                func.lower(ReportedCases.antagonist).like(f"%{person.lower()}%"),
                func.lower(ReportedCases.lawyers).like(f"%{person.lower()}%"),
                func.lower(ReportedCases.presiding_judge).like(f"%{person.lower()}%"),
                func.lower(ReportedCases.judgement_by).like(f"%{person.lower()}%")
            ),
            ReportedCases.id != case_id  # Exclude current case
        ).limit(limit).all()
        
        for case in person_cases:
            # Avoid duplicates
            if not any(rc['id'] == case.id for rc in related_cases):
                related_cases.append({
                    "id": case.id,
                    "title": case.title,
                    "suit_reference_number": case.suit_reference_number,
                    "date": case.date,
                    "court_type": case.court_type,
                    "area_of_law": case.area_of_law,
                    "protagonist": case.protagonist,
                    "antagonist": case.antagonist,
                    "presiding_judge": case.presiding_judge,
                    "ai_case_outcome": case.ai_case_outcome,
                    "ai_financial_impact": case.ai_financial_impact,
                    "matched_person": person
                })
    
    # Sort by date (most recent first) and limit results
    related_cases.sort(key=lambda x: x['date'] or '', reverse=True)
    related_cases = related_cases[:limit]
    
    return {
        "related_cases": related_cases,
        "total": len(related_cases),
        "search_people": people_to_search
    }
