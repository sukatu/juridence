from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc, String
from database import get_db
from models.people import People
from models.user import User
from models.person_case_statistics import PersonCaseStatistics
from schemas.people import (
    PeopleCreate, 
    PeopleUpdate, 
    PeopleResponse, 
    PeopleSearchRequest, 
    PeopleSearchResponse,
    PeopleStats
)
from auth import get_current_user
from typing import List, Optional, Dict, Any
import logging
import math
import json
import traceback
from services.ai_service import get_openai_client, AIService

router = APIRouter()

@router.get("/search", response_model=PeopleSearchResponse)
async def search_people(
    query: Optional[str] = Query(None, description="General search query"),
    first_name: Optional[str] = Query(None, description="First name filter"),
    last_name: Optional[str] = Query(None, description="Last name filter"),
    id_number: Optional[str] = Query(None, description="ID number filter"),
    phone_number: Optional[str] = Query(None, description="Phone number filter"),
    email: Optional[str] = Query(None, description="Email filter"),
    city: Optional[str] = Query(None, description="City filter"),
    region: Optional[str] = Query(None, description="Region filter"),
    risk_level: Optional[str] = Query(None, description="Risk level filter"),
    occupation: Optional[str] = Query(None, description="Occupation filter"),
    employer: Optional[str] = Query(None, description="Employer filter"),
    organization: Optional[str] = Query(None, description="Organization filter"),
    gender: Optional[str] = Query(None, description="Gender filter"),
    nationality: Optional[str] = Query(None, description="Nationality filter"),
    is_verified: Optional[bool] = Query(None, description="Verification status filter"),
    person_status: Optional[str] = Query(None, description="Status filter"),
    min_risk_score: Optional[float] = Query(None, ge=0, le=200, description="Minimum risk score"),
    max_risk_score: Optional[float] = Query(None, ge=0, le=200, description="Maximum risk score"),
    min_case_count: Optional[int] = Query(None, ge=0, description="Minimum case count"),
    max_case_count: Optional[int] = Query(None, ge=0, description="Maximum case count"),
    sort_by: str = Query("full_name", description="Sort field"),
    sort_order: str = Query("asc", regex="^(asc|desc)$", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    # current_user: User = Depends(get_current_user),  # Temporarily disabled for testing
    db: Session = Depends(get_db)
):
    """Search for people with various filters"""
    try:
        # Build query - only join case statistics for small queries to improve performance
        if limit <= 20:
            query_obj = db.query(People).outerjoin(
                PersonCaseStatistics, 
                People.id == PersonCaseStatistics.person_id
            )
        else:
            query_obj = db.query(People)
        
        # Apply filters
        filters = []
        
        if query:
            # General search across multiple fields
            search_term = f"%{query.lower()}%"
            filters.append(
                or_(
                    func.lower(People.full_name).like(search_term),
                    func.lower(People.first_name).like(search_term),
                    func.lower(People.last_name).like(search_term),
                    func.lower(People.id_number).like(search_term),
                    func.lower(People.phone_number).like(search_term),
                    func.lower(People.email).like(search_term),
                    func.lower(People.address).like(search_term),
                    func.lower(People.city).like(search_term),
                    func.lower(People.region).like(search_term),
                    func.lower(People.occupation).like(search_term),
                    func.lower(People.employer).like(search_term),
                    func.lower(People.organization).like(search_term),
                    # Search in previous_names (alias names) JSON array
                    func.cast(People.previous_names, String).ilike(search_term)
                )
            )
        
        if first_name:
            filters.append(func.lower(People.first_name).like(f"%{first_name.lower()}%"))
        if last_name:
            filters.append(func.lower(People.last_name).like(f"%{last_name.lower()}%"))
        if id_number:
            filters.append(People.id_number.ilike(f"%{id_number}%"))
        if phone_number:
            filters.append(People.phone_number.ilike(f"%{phone_number}%"))
        if email:
            filters.append(func.lower(People.email).like(f"%{email.lower()}%"))
        if city:
            filters.append(func.lower(People.city).like(f"%{city.lower()}%"))
        if region:
            filters.append(func.lower(People.region).like(f"%{region.lower()}%"))
        if risk_level:
            # Case-insensitive matching for risk_level
            filters.append(func.lower(People.risk_level) == func.lower(risk_level))
        if occupation:
            filters.append(func.lower(People.occupation).like(f"%{occupation.lower()}%"))
        if employer:
            filters.append(func.lower(People.employer).like(f"%{employer.lower()}%"))
        if organization:
            filters.append(func.lower(People.organization).like(f"%{organization.lower()}%"))
        if gender:
            filters.append(People.gender == gender)
        if nationality:
            filters.append(func.lower(People.nationality).like(f"%{nationality.lower()}%"))
        if is_verified is not None:
            filters.append(People.is_verified == is_verified)
        if person_status:
            filters.append(People.status == person_status)
        if min_risk_score is not None:
            filters.append(People.risk_score >= min_risk_score)
        if max_risk_score is not None:
            filters.append(People.risk_score <= max_risk_score)
        if min_case_count is not None:
            filters.append(People.case_count >= min_case_count)
        if max_case_count is not None:
            filters.append(People.case_count <= max_case_count)
        
        # Apply all filters
        if filters:
            query_obj = query_obj.filter(and_(*filters))
        
        # Apply sorting
        sort_column = getattr(People, sort_by, People.full_name)
        if sort_order == "desc":
            query_obj = query_obj.order_by(desc(sort_column))
        else:
            query_obj = query_obj.order_by(asc(sort_column))
        
        # Get total count
        total = query_obj.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        people = query_obj.offset(offset).limit(limit).all()
        
        # Calculate pagination info
        total_pages = math.ceil(total / limit)
        has_next = page < total_pages
        has_prev = page > 1
        
        # Add case statistics if available (without updating search counts for performance)
        for person in people:
            # Cap risk score at 200 to prevent validation errors
            if person.risk_score and person.risk_score > 200:
                person.risk_score = 200.0
            
            if limit <= 20:
                # Case statistics already joined for small queries
                if hasattr(person, 'case_statistics') and person.case_statistics:
                    stats = person.case_statistics
                    person.total_cases = stats.total_cases
                    person.resolved_cases = stats.resolved_cases
                    person.unresolved_cases = stats.unresolved_cases
                    person.favorable_cases = stats.favorable_cases
                    person.unfavorable_cases = stats.unfavorable_cases
                    person.mixed_cases = stats.mixed_cases
                    person.case_outcome = stats.case_outcome
                else:
                    # Default values if no statistics available
                    person.total_cases = 0
                    person.resolved_cases = 0
                    person.unresolved_cases = 0
                    person.favorable_cases = 0
                    person.unfavorable_cases = 0
                    person.mixed_cases = 0
                    person.case_outcome = "N/A"
            else:
                # For large queries, use basic case count from People table
                person.total_cases = person.case_count or 0
                person.resolved_cases = 0
                person.unresolved_cases = person.case_count or 0
                person.favorable_cases = 0
                person.unfavorable_cases = 0
                person.mixed_cases = 0
                person.case_outcome = "N/A"
        
        # Only commit if we're updating search counts (for single searches, not batch loads)
        if limit <= 20:  # Only update search counts for small queries
            for person in people:
                if person.search_count is None:
                    person.search_count = 0
                person.search_count += 1
                person.last_searched = func.now()
            db.commit()
        
        return PeopleSearchResponse(
            people=people,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        logging.error(f"Error searching people: {str(e)}")
        logging.error(f"Error type: {type(e).__name__}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search people: {str(e)}"
        )

@router.get("/name-suggestions")
async def get_name_suggestions(
    query: str = Query(..., min_length=2, description="Name search query"),
    limit: int = Query(10, ge=1, le=20, description="Maximum suggestions"),
    db: Session = Depends(get_db)
):
    """Get name suggestions for autocomplete from people table"""
    try:
        search_term = f"%{query.lower()}%"
        
        # Query for matching names (full name, first name, last name)
        people = db.query(People).filter(
            or_(
                func.lower(People.full_name).like(search_term),
                func.lower(People.first_name).like(search_term),
                func.lower(People.last_name).like(search_term)
            )
        ).limit(limit * 2).all()  # Get more to filter duplicates
        
        # Format suggestions and remove duplicates
        result = []
        seen_names = set()
        
        for person in people:
            # Prefer full_name, fallback to combining first and last
            display_name = person.full_name or f"{person.first_name or ''} {person.last_name or ''}".strip()
            
            if display_name and display_name.lower() not in seen_names and len(result) < limit:
                seen_names.add(display_name.lower())
                result.append({
                    "name": display_name,
                    "id": person.id,
                    "first_name": person.first_name,
                    "last_name": person.last_name
                })
        
        return {"suggestions": result}
        
    except Exception as e:
        logging.error(f"Error getting name suggestions: {str(e)}")
        return {"suggestions": []}

@router.post("/ai-search", response_model=PeopleSearchResponse)
async def ai_search_people(
    query: str = Body(..., embed=True, description="Natural language search query"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    # current_user: User = Depends(get_current_user),  # Temporarily disabled for testing
    db: Session = Depends(get_db)
):
    """AI-powered search that parses natural language queries into structured search parameters"""
    try:
        # Use AI to parse the natural language query
        client = get_openai_client(db)
        
        prompt = f"""
        Parse the following natural language search query about a person and extract structured search parameters.
        Return ONLY a valid JSON object with the following structure (use null for missing values):
        
        {{
            "name": "Full name or part of name (if mentioned)",
            "first_name": "First name (if specifically mentioned)",
            "last_name": "Last name (if specifically mentioned)",
            "location": "City, town, or location (if mentioned)",
            "city": "City name (if mentioned)",
            "region": "Region or state (if mentioned)",
            "profession": "Profession, occupation, or job title (if mentioned)",
            "occupation": "Occupation (if mentioned)",
            "employer": "Employer or company name (if mentioned)",
            "organization": "Organization name (if mentioned)",
            "phone": "Phone number (if mentioned)",
            "email": "Email address (if mentioned)",
            "risk_level": "Risk level like Low, Medium, High (if mentioned)",
            "database_type": "Database type like change_of_name, change_of_dob, marriage_officers, company_officers, court (if mentioned)"
        }}
        
        Query: "{query}"
        
        Examples:
        - "Find John Smith in Accra" -> {{"first_name": "John", "last_name": "Smith", "city": "Accra"}}
        - "Show me lawyers in Greater Accra" -> {{"occupation": "lawyer", "region": "Greater Accra"}}
        - "People named Kwame who are doctors" -> {{"first_name": "Kwame", "profession": "doctor"}}
        - "Find all court officers" -> {{"database_type": "court"}}
        
        Respond with ONLY the JSON object, no additional text.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a search query parser. Extract structured parameters from natural language queries. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.1
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # Parse AI response
        try:
            # Remove markdown code blocks if present
            if ai_response.startswith("```json"):
                ai_response = ai_response[7:]
            if ai_response.startswith("```"):
                ai_response = ai_response[3:]
            if ai_response.endswith("```"):
                ai_response = ai_response[:-3]
            ai_response = ai_response.strip()
            
            parsed_params = json.loads(ai_response)
        except json.JSONDecodeError as e:
            logging.error(f"Error parsing AI response: {e}, Response: {ai_response}")
            # Fallback: use query as general search
            parsed_params = {"name": query}
        
        # Build search query using parsed parameters
        query_obj = db.query(People)
        filters = []
        
        # Apply parsed parameters
        if parsed_params.get("name"):
            filters.append(
                or_(
                    func.lower(People.full_name).like(f"%{parsed_params['name'].lower()}%"),
                    func.lower(People.first_name).like(f"%{parsed_params['name'].lower()}%"),
                    func.lower(People.last_name).like(f"%{parsed_params['name'].lower()}%")
                )
            )
        if parsed_params.get("first_name"):
            filters.append(func.lower(People.first_name).like(f"%{parsed_params['first_name'].lower()}%"))
        if parsed_params.get("last_name"):
            filters.append(func.lower(People.last_name).like(f"%{parsed_params['last_name'].lower()}%"))
        if parsed_params.get("city") or parsed_params.get("location"):
            city = parsed_params.get("city") or parsed_params.get("location")
            filters.append(func.lower(People.city).like(f"%{city.lower()}%"))
        if parsed_params.get("region"):
            filters.append(func.lower(People.region).like(f"%{parsed_params['region'].lower()}%"))
        if parsed_params.get("profession") or parsed_params.get("occupation"):
            occupation = parsed_params.get("profession") or parsed_params.get("occupation")
            filters.append(func.lower(People.occupation).like(f"%{occupation.lower()}%"))
        if parsed_params.get("employer"):
            filters.append(func.lower(People.employer).like(f"%{parsed_params['employer'].lower()}%"))
        if parsed_params.get("organization"):
            filters.append(func.lower(People.organization).like(f"%{parsed_params['organization'].lower()}%"))
        if parsed_params.get("phone"):
            filters.append(People.phone_number.ilike(f"%{parsed_params['phone']}%"))
        if parsed_params.get("email"):
            filters.append(func.lower(People.email).like(f"%{parsed_params['email'].lower()}%"))
        if parsed_params.get("risk_level"):
            filters.append(People.risk_level == parsed_params["risk_level"])
        
        # Apply filters
        if filters:
            query_obj = query_obj.filter(and_(*filters))
        
        # Get total count
        total = query_obj.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        people = query_obj.order_by(People.full_name.asc()).offset(offset).limit(limit).all()
        
        # Format response
        people_list = []
        for person in people:
            # Get case statistics if available
            case_stats = db.query(PersonCaseStatistics).filter(
                PersonCaseStatistics.person_id == person.id
            ).first()
            
            people_list.append({
                "id": person.id,
                "full_name": person.full_name,
                "first_name": person.first_name,
                "last_name": person.last_name,
                "id_number": person.id_number,
                "phone_number": person.phone_number,
                "email": person.email,
                "date_of_birth": person.date_of_birth.isoformat() if person.date_of_birth else None,
                "gender": person.gender,
                "address": person.address,
                "city": person.city,
                "region": person.region,
                "nationality": person.nationality,
                "occupation": person.occupation,
                "employer": person.employer,
                "organization": person.organization,
                "risk_level": person.risk_level,
                "risk_score": person.risk_score,
                "is_verified": person.is_verified,
                "person_status": person.person_status,
                "case_count": case_stats.total_cases if case_stats else 0,
                "created_at": person.created_at.isoformat() if person.created_at else None,
                "updated_at": person.updated_at.isoformat() if person.updated_at else None
            })
        
        total_pages = math.ceil(total / limit) if limit > 0 else 0
        
        return {
            "people": people_list,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "ai_parsed_params": parsed_params  # Include parsed params for debugging/transparency
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in AI search: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform AI search: {str(e)}"
        )

@router.get("/{people_id}", response_model=PeopleResponse)
async def get_person(
    people_id: int,
    # current_user: User = Depends(get_current_user),  # Temporarily disabled for testing
    db: Session = Depends(get_db)
):
    """Get a specific person by ID"""
    try:
        person = db.query(People).filter(People.id == people_id).first()
        if not person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Person not found"
            )
        
        # Update search count
        person.search_count += 1
        person.last_searched = func.now()
        db.commit()
        
        return person
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting person: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve person"
        )

@router.post("/", response_model=PeopleResponse)
async def create_person(
    request_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new person record with optional employment history, case links, and relationships"""
    try:
        logging.info(f"Creating person - Request data keys: {list(request_data.keys())}")
        
        # Extract person data and related data from request
        person_data_dict = {k: v for k, v in request_data.items() if k not in ['employment_history', 'case_links', 'relationships']}
        employment_history = request_data.get('employment_history') or []
        case_links = request_data.get('case_links') or []
        relationships = request_data.get('relationships') or []
        
        logging.info(f"Extracted data - Employment history: {len(employment_history)}, Case links: {len(case_links)}, Relationships: {len(relationships)}")
        
        # Filter out computed fields and invalid fields before validation
        # These fields come from PersonCaseStatistics relationship, not the People table
        computed_fields = [
            'total_cases', 'resolved_cases', 'unresolved_cases', 
            'favorable_cases', 'unfavorable_cases', 'mixed_cases', 
            'case_outcome'
        ]
        
        # Also filter out fields that are not in People model
        # These are metadata fields that shouldn't be set during creation
        invalid_fields = [
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'last_searched', 'verification_date'
        ]
        
        # Clean the person_data_dict
        cleaned_person_data = {
            k: v for k, v in person_data_dict.items() 
            if k not in computed_fields and k not in invalid_fields
        }
        
        # Validate gender length if provided
        if cleaned_person_data.get('gender') and len(cleaned_person_data['gender']) > 10:
            logging.warning(f"Gender value too long: {cleaned_person_data['gender']}, truncating to 10 characters")
            cleaned_person_data['gender'] = cleaned_person_data['gender'][:10]
        
        # Create PeopleCreate object - handle fields that might not be in schema
        try:
            person_data = PeopleCreate(**cleaned_person_data)
        except Exception as schema_error:
            # If schema validation fails, try with only required and valid fields
            logging.warning(f"Schema validation warning: {str(schema_error)}")
            # Extract only valid fields for PeopleCreate (matching People model columns)
            valid_fields = {
                'first_name': cleaned_person_data.get('first_name', 'Unknown'),
                'last_name': cleaned_person_data.get('last_name', ''),
                'full_name': cleaned_person_data.get('full_name', ''),
                'previous_names': cleaned_person_data.get('previous_names'),
                'date_of_birth': cleaned_person_data.get('date_of_birth'),
                'date_of_death': cleaned_person_data.get('date_of_death'),
                'place_of_birth': cleaned_person_data.get('place_of_birth'),
                'id_number': cleaned_person_data.get('id_number'),
                'phone_number': cleaned_person_data.get('phone_number'),
                'email': cleaned_person_data.get('email'),
                'address': cleaned_person_data.get('address'),
                'city': cleaned_person_data.get('city'),
                'region': cleaned_person_data.get('region'),
                'country': cleaned_person_data.get('country', 'Ghana'),
                'postal_code': cleaned_person_data.get('postal_code'),
                'risk_level': cleaned_person_data.get('risk_level'),
                'risk_score': cleaned_person_data.get('risk_score'),
                'case_count': cleaned_person_data.get('case_count', 0),
                'case_types': cleaned_person_data.get('case_types'),
                'court_records': cleaned_person_data.get('court_records'),
                'occupation': cleaned_person_data.get('occupation'),
                'employer': cleaned_person_data.get('employer'),
                'organization': cleaned_person_data.get('organization'),
                'job_title': cleaned_person_data.get('job_title'),
                'marital_status': cleaned_person_data.get('marital_status'),
                'spouse_name': cleaned_person_data.get('spouse_name'),
                'children_count': cleaned_person_data.get('children_count', 0),
                'emergency_contact': cleaned_person_data.get('emergency_contact'),
                'emergency_phone': cleaned_person_data.get('emergency_phone'),
                'nationality': cleaned_person_data.get('nationality', 'Ghanaian'),
                'gender': cleaned_person_data.get('gender'),
                'education_level': cleaned_person_data.get('education_level'),
                'languages': cleaned_person_data.get('languages'),
                'is_verified': cleaned_person_data.get('is_verified', False),
                'verification_notes': cleaned_person_data.get('verification_notes'),
                'status': cleaned_person_data.get('status', 'active'),
                'notes': cleaned_person_data.get('notes'),
                'search_count': cleaned_person_data.get('search_count', 0)
            }
            
            # Ensure full_name is set
            if not valid_fields['full_name']:
                valid_fields['full_name'] = f"{valid_fields['first_name']} {valid_fields['last_name']}".strip()
            
            person_data = PeopleCreate(**valid_fields)
        
        # Create full name if not provided
        if not person_data.full_name:
            person_data.full_name = f"{person_data.first_name} {person_data.last_name}".strip()
        
        # Final validation: ensure required fields are present
        if not person_data.first_name or not person_data.first_name.strip():
            raise HTTPException(status_code=400, detail="first_name is required")
        if not person_data.last_name:
            person_data.last_name = ""
        if not person_data.full_name or not person_data.full_name.strip():
            person_data.full_name = f"{person_data.first_name} {person_data.last_name}".strip()
        
        # Convert to dict and filter out computed fields one more time (safety check)
        person_dict = person_data.dict(exclude_none=False)
        for field in computed_fields + invalid_fields:
            person_dict.pop(field, None)
        
        # Ensure gender doesn't exceed 10 characters
        if person_dict.get('gender') and len(person_dict['gender']) > 10:
            person_dict['gender'] = person_dict['gender'][:10]
        
        person = People(
            **person_dict,
            created_by=current_user.id
        )
        
        db.add(person)
        db.commit()
        db.refresh(person)
        
        # Add employment history if provided
        if employment_history and len(employment_history) > 0:
            from models.person_employment import PersonEmployment
            logging.info(f"Processing {len(employment_history)} employment records for person {person.id}")
            for idx, emp in enumerate(employment_history):
                if emp.get('company_name'):  # Only add if company name is provided
                    employment = PersonEmployment(
                        person_id=person.id,
                        company_name=emp.get('company_name', ''),
                        position=emp.get('position', ''),
                        department=emp.get('department'),
                        start_date=emp.get('startDate') or emp.get('start_date'),
                        end_date=emp.get('endDate') or emp.get('end_date'),
                        is_current=emp.get('endDate') == 'Present' or emp.get('end_date') == 'Present' or not emp.get('endDate'),
                        reason_for_leaving=emp.get('reasonForLeaving') or emp.get('reason_for_leaving'),
                        source=emp.get('source'),
                        address=emp.get('address')
                    )
                    db.add(employment)
                    logging.info(f"Added employment {idx + 1}: company={employment.company_name}, position={employment.position}")
                else:
                    logging.warning(f"Skipping employment {idx + 1}: no company name provided")
        
        # Add case links if provided
        if case_links and len(case_links) > 0:
            from models.person_case_link import PersonCaseLink
            logging.info(f"Processing {len(case_links)} case links for person {person.id}")
            for idx, case_link in enumerate(case_links):
                # Check if we have any case data (case_id, case_number, or case_title)
                has_case_data = (
                    case_link.get('case_id') or 
                    case_link.get('caseNumber') or 
                    case_link.get('case_number') or 
                    case_link.get('caseTitle') or 
                    case_link.get('case_title')
                )
                if has_case_data:
                    link = PersonCaseLink(
                        person_id=person.id,
                        case_id=case_link.get('case_id'),
                        case_number=case_link.get('caseNumber') or case_link.get('case_number'),
                        case_title=case_link.get('caseTitle') or case_link.get('case_title'),
                        role_in_case=case_link.get('roleInCase') or case_link.get('role_in_case', 'Related Party'),
                        notes=case_link.get('notes')
                    )
                    db.add(link)
                    logging.info(f"Added case link {idx + 1}: case_id={link.case_id}, case_number={link.case_number}, case_title={link.case_title}, role={link.role_in_case}")
                else:
                    logging.warning(f"Skipping case link {idx + 1}: no case data provided")
        
        # Add relationships if provided
        if relationships and len(relationships) > 0:
            from models.person_relationship import PersonRelationship
            logging.info(f"Processing {len(relationships)} relationships for person {person.id}")
            for idx, rel in enumerate(relationships):
                # Check if we have person name or related_person_id
                has_person_data = (
                    rel.get('personName') or 
                    rel.get('related_person_name') or 
                    rel.get('related_person_id')
                )
                if has_person_data:
                    relationship = PersonRelationship(
                        person_id=person.id,
                        related_person_id=rel.get('related_person_id'),
                        related_person_name=rel.get('personName') or rel.get('related_person_name', ''),
                        relationship_type=rel.get('relationship') or rel.get('relationship_type', ''),
                        phone=rel.get('phone'),
                        email=rel.get('email'),
                        notes=rel.get('notes')
                    )
                    db.add(relationship)
                    logging.info(f"Added relationship {idx + 1}: related_person_id={relationship.related_person_id}, name={relationship.related_person_name}, type={relationship.relationship_type}")
                else:
                    logging.warning(f"Skipping relationship {idx + 1}: no person data provided")
        
        db.commit()
        db.refresh(person)
        
        logging.info(f"Person created successfully with ID: {person.id}")
        logging.info(f"Person name: {person.full_name}")
        logging.info(f"Total employment records saved: {len(employment_history)}")
        logging.info(f"Total case links saved: {len(case_links)}")
        logging.info(f"Total relationships saved: {len(relationships)}")
        
        # Generate analytics for the new person
        try:
            from services.auto_analytics_generator import AutoAnalyticsGenerator
            generator = AutoAnalyticsGenerator(db)
            generator.generate_analytics_for_person(person.id)
            logging.info(f"Analytics generated for new person {person.id}")
        except Exception as analytics_error:
            logging.warning(f"Failed to generate analytics for person {person.id}: {str(analytics_error)}")
            # Don't fail the person creation if analytics generation fails
        
        return person
        
    except HTTPException:
        db.rollback()
        raise
    except ValueError as ve:
        db.rollback()
        logging.error(f"Validation error creating person: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(ve)}"
        )
    except Exception as e:
        db.rollback()
        logging.error(f"Error creating person: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create person: {str(e)}"
        )

@router.put("/{people_id}", response_model=PeopleResponse)
async def update_person(
    people_id: int,
    person_data: PeopleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a person record"""
    try:
        person = db.query(People).filter(People.id == people_id).first()
        if not person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Person not found"
            )
        
        # Update only provided fields
        update_data = person_data.dict(exclude_unset=True)
        
        # Filter out computed fields that are not actual columns in People model
        computed_fields = [
            'total_cases', 'resolved_cases', 'unresolved_cases', 
            'favorable_cases', 'unfavorable_cases', 'mixed_cases', 
            'case_outcome'
        ]
        invalid_fields = [
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'last_searched', 'verification_date', 'id'
        ]
        
        for field in computed_fields + invalid_fields:
            update_data.pop(field, None)
        
        # Validate gender length if provided
        if update_data.get('gender') and len(update_data['gender']) > 10:
            logging.warning(f"Gender value too long: {update_data['gender']}, truncating to 10 characters")
            update_data['gender'] = update_data['gender'][:10]
        
        # Update full name if first_name or last_name changed
        if "first_name" in update_data or "last_name" in update_data:
            first_name = update_data.get("first_name", person.first_name)
            last_name = update_data.get("last_name", person.last_name)
            update_data["full_name"] = f"{first_name} {last_name}".strip()
        
        # Date conversion is handled by Pydantic validator in PeopleUpdate schema
        
        # Only update fields that exist in the model
        for field, value in update_data.items():
            if hasattr(person, field) and field not in computed_fields + invalid_fields:
                # Skip None values for optional fields (keep existing value)
                if value is not None:
                    setattr(person, field, value)
        
        person.updated_by = current_user.id
        db.commit()
        db.refresh(person)
        
        logging.info(f"Person {person.id} updated successfully by user {current_user.id}")
        logging.info(f"Updated fields: {list(update_data.keys())}")
        
        return person
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating person: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update person"
        )

@router.delete("/{people_id}")
async def delete_person(
    people_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a person record (soft delete)"""
    try:
        person = db.query(People).filter(People.id == people_id).first()
        if not person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Person not found"
            )
        
        # Soft delete by changing status
        person.status = "archived"
        person.updated_by = current_user.id
        db.commit()
        
        return {"message": "Person deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting person: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete person"
        )

@router.get("/stats/overview", response_model=PeopleStats)
async def get_people_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get people statistics overview"""
    try:
        # Total people
        total_people = db.query(People).filter(People.status == "active").count()
        
        # Verified people
        verified_people = db.query(People).filter(
            and_(People.status == "active", People.is_verified == True)
        ).count()
        
        # Risk level breakdown
        high_risk = db.query(People).filter(
            and_(People.status == "active", People.risk_level == "High")
        ).count()
        
        medium_risk = db.query(People).filter(
            and_(People.status == "active", People.risk_level == "Medium")
        ).count()
        
        low_risk = db.query(People).filter(
            and_(People.status == "active", People.risk_level == "Low")
        ).count()
        
        # People with cases
        people_with_cases = db.query(People).filter(
            and_(People.status == "active", People.case_count > 0)
        ).count()
        
        # People by region
        region_stats = db.query(
            People.region, func.count(People.id)
        ).filter(People.status == "active").group_by(People.region).all()
        people_by_region = {region or "Unknown": count for region, count in region_stats}
        
        # People by occupation
        occupation_stats = db.query(
            People.occupation, func.count(People.id)
        ).filter(
            and_(People.status == "active", People.occupation.isnot(None))
        ).group_by(People.occupation).all()
        people_by_occupation = {occupation: count for occupation, count in occupation_stats}
        
        # Recent searches (last 24 hours)
        recent_searches = db.query(People).filter(
            and_(
                People.status == "active",
                People.last_searched.isnot(None),
                People.last_searched >= func.now() - func.interval(1, 'day')
            )
        ).count()
        
        # Top searched people
        top_searched = db.query(
            People.full_name, People.search_count
        ).filter(People.status == "active").order_by(
            desc(People.search_count)
        ).limit(10).all()
        top_searched_list = [
            {"name": name, "search_count": count} 
            for name, count in top_searched
        ]
        
        return PeopleStats(
            total_people=total_people,
            verified_people=verified_people,
            high_risk_people=high_risk,
            medium_risk_people=medium_risk,
            low_risk_people=low_risk,
            people_with_cases=people_with_cases,
            people_by_region=people_by_region,
            people_by_occupation=people_by_occupation,
            recent_searches=recent_searches,
            top_searched=top_searched_list
        )
        
    except Exception as e:
        logging.error(f"Error getting people stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve people statistics"
        )
