from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, union_all
from database import get_db
from models.companies import Companies
from models.banks import Banks
from models.insurance import Insurance
from models.company_analytics import CompanyAnalytics
from models.company_case_statistics import CompanyCaseStatistics
from models.company_locations import CompanyLocation
from models.company_regulatory import CompanyRegulatory
from models.company_case_links import CompanyCaseLink
from models.company_sources import CompanySource
from schemas.admin import CompanyCreateRequest, CompanyUpdateRequest
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date
import math
import json

router = APIRouter()

# Pydantic schemas for related data
class CompanyLocationCreate(BaseModel):
    company_id: int
    location_type: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = "Ghana"
    postal_code: Optional[str] = None
    is_primary: Optional[bool] = False

class CompanyRegulatoryCreate(BaseModel):
    company_id: int
    regulatory_body: Optional[str] = None
    license_permit_number: Optional[str] = None
    license_permit_type: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    compliance_violations: Optional[str] = None  # For frontend compatibility
    regulatory_actions: Optional[str] = None  # For frontend compatibility

class CompanyCaseLinkCreate(BaseModel):
    company_id: int
    case_id: Optional[int] = None
    role_in_case: Optional[str] = None
    case_number: Optional[str] = None
    case_title: Optional[str] = None

class CompanySourceCreate(BaseModel):
    company_id: int
    source: Optional[str] = None
    source_reference: Optional[str] = None
    notes: Optional[str] = None

@router.get("/stats")
async def get_companies_stats(db: Session = Depends(get_db)):
    """Get comprehensive company statistics for admin dashboard"""
    try:
        # Basic counts
        total_companies = db.query(Companies).count()
        
        # Financial analysis
        total_revenue = 0
        revenue_data = db.query(Companies.annual_revenue).filter(Companies.annual_revenue.isnot(None)).all()
        for revenue in revenue_data:
            try:
                if revenue[0]:
                    # Convert to string, remove commas and other characters, then convert to float
                    clean_revenue = str(revenue[0]).replace(',', '').replace('$', '').replace(' ', '')
                    if clean_revenue.replace('.', '').replace('-', '').isdigit():
                        total_revenue += float(clean_revenue)
            except (ValueError, TypeError):
                continue
        
        total_employees = 0
        employee_data = db.query(Companies.employee_count).filter(Companies.employee_count.isnot(None)).all()
        for employees in employee_data:
            try:
                if employees[0]:
                    # Convert to string, remove commas, then convert to int
                    clean_employees = str(employees[0]).replace(',', '').replace(' ', '')
                    if clean_employees.isdigit():
                        total_employees += int(clean_employees)
            except (ValueError, TypeError):
                continue
        
        # Average rating
        avg_rating = 0
        rating_data = db.query(Companies.rating).filter(Companies.rating.isnot(None)).all()
        if rating_data:
            valid_ratings = []
            for rating in rating_data:
                try:
                    if rating[0] is not None:
                        clean_rating = str(rating[0]).replace(',', '').replace(' ', '')
                        if clean_rating.replace('.', '').isdigit():
                            valid_ratings.append(float(clean_rating))
                except (ValueError, TypeError):
                    continue
            avg_rating = sum(valid_ratings) / len(valid_ratings) if valid_ratings else 0
        
        # Active companies
        active_companies = db.query(Companies).filter(Companies.is_active == True).count()
        
        return {
            "total_companies": total_companies,
            "total_revenue": total_revenue,
            "total_employees": total_employees,
            "avg_rating": avg_rating,
            "active_companies": active_companies,
            "last_updated": db.query(Companies.updated_at).order_by(Companies.updated_at.desc()).first()[0].isoformat() if db.query(Companies.updated_at).first() else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching companies stats: {str(e)}")

@router.get("/")
async def get_companies(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=10000),  # Increased limit to 10000 for large datasets
    search: Optional[str] = Query(None),
    company_type: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of companies, banks, and insurances with optional filtering"""
    try:
        all_results = []
        
        # Determine which tables to query based on industry
        # Banking & Finance includes banks and insurance companies
        # Other industries only include regular companies
        include_banks = False
        include_insurance = False
        include_companies = True
        
        if industry:
            industry_lower = industry.lower()
            if 'banking' in industry_lower or 'finance' in industry_lower:
                include_banks = True
                include_insurance = True
            # Companies are always included if industry is specified
        
        # Query Companies
        if include_companies:
            companies_query = db.query(Companies)
            
            if industry:
                companies_query = companies_query.filter(Companies.industry.ilike(f"%{industry}%"))
            
            if company_type:
                companies_query = companies_query.filter(Companies.company_type.ilike(f"%{company_type}%"))
            
            if search:
                search_filter = or_(
                    Companies.name.ilike(f"%{search}%"),
                    Companies.short_name.ilike(f"%{search}%"),
                    Companies.registration_number.ilike(f"%{search}%"),
                    Companies.industry.ilike(f"%{search}%")
                )
                companies_query = companies_query.filter(search_filter)
            
            companies_list = companies_query.all()
            for company in companies_list:
                try:
                    company_dict = company.__dict__.copy()
                    company_dict.pop('_sa_instance_state', None)
                    company_dict['entity_type'] = 'company'
                    all_results.append(company_dict)
                except Exception as e:
                    print(f"Error processing company: {e}")
                    continue
        
        # Query Banks
        if include_banks:
            banks_query = db.query(Banks)
            
            if company_type:
                # Map company types to bank types if needed
                banks_query = banks_query.filter(Banks.bank_type.ilike(f"%{company_type}%"))
            
            if search:
                search_filter = or_(
                    Banks.name.ilike(f"%{search}%"),
                    Banks.short_name.ilike(f"%{search}%"),
                    Banks.license_number.ilike(f"%{search}%"),
                    Banks.bank_code.ilike(f"%{search}%")
                )
                banks_query = banks_query.filter(search_filter)
            
            banks_list = banks_query.all()
            for bank in banks_list:
                try:
                    bank_dict = bank.__dict__.copy()
                    bank_dict.pop('_sa_instance_state', None)
                    bank_dict['entity_type'] = 'bank'
                    bank_dict['industry'] = 'Banking & Finance'  # Add industry for consistency
                    bank_dict['company_type'] = bank.bank_type or 'Bank'
                    all_results.append(bank_dict)
                except Exception as e:
                    print(f"Error processing bank: {e}")
                    continue
        
        # Query Insurance
        if include_insurance:
            insurance_query = db.query(Insurance)
            
            if company_type:
                insurance_query = insurance_query.filter(Insurance.insurance_type.ilike(f"%{company_type}%"))
            
            if search:
                search_filter = or_(
                    Insurance.name.ilike(f"%{search}%"),
                    Insurance.short_name.ilike(f"%{search}%"),
                    Insurance.license_number.ilike(f"%{search}%"),
                    Insurance.registration_number.ilike(f"%{search}%")
                )
                insurance_query = insurance_query.filter(search_filter)
            
            insurance_list = insurance_query.all()
            for insurance in insurance_list:
                try:
                    insurance_dict = insurance.__dict__.copy()
                    insurance_dict.pop('_sa_instance_state', None)
                    insurance_dict['entity_type'] = 'insurance'
                    insurance_dict['industry'] = 'Banking & Finance'  # Add industry for consistency
                    insurance_dict['company_type'] = insurance.insurance_type or 'Insurance'
                    all_results.append(insurance_dict)
                except Exception as e:
                    print(f"Error processing insurance: {e}")
                    continue
        
        # Apply status filter if needed (client-side for now)
        # This will be handled in the response formatting
        
        # Get total count
        total = len(all_results)
        print(f"Debug: Total entities (companies + banks + insurance): {total}")
        
        # Apply pagination
        offset = (page - 1) * limit
        paginated_results = all_results[offset:offset + limit]
        print(f"Debug: After pagination: {len(paginated_results)} entities")
        
        # Convert to formatted response
        formatted_companies = []
        for entity in paginated_results:
            try:
                # Entity is already a dict, just need to format it
                company_dict = entity.copy()
                
                # Convert JSON arrays to comma-separated strings (only for companies)
                if company_dict.get('entity_type') == 'company':
                    if company_dict.get('business_activities'):
                        if isinstance(company_dict['business_activities'], list):
                            company_dict['business_activities'] = ', '.join(str(item) for item in company_dict['business_activities'])
                        elif isinstance(company_dict['business_activities'], str):
                            try:
                                data = json.loads(company_dict['business_activities'])
                                if isinstance(data, list):
                                    company_dict['business_activities'] = ', '.join(str(item) for item in data)
                            except:
                                pass
                    else:
                        company_dict['business_activities'] = ''
                    
                    if company_dict.get('directors') and company_dict['directors'] is not None:
                        if isinstance(company_dict['directors'], list):
                            # Convert list of dicts to comma-separated names
                            director_names = []
                            for director in company_dict['directors']:
                                if isinstance(director, dict) and 'name' in director:
                                    director_names.append(director['name'])
                                elif isinstance(director, str):
                                    director_names.append(director)
                            company_dict['directors'] = ', '.join(director_names) if director_names else ''
                        elif isinstance(company_dict['directors'], str):
                            try:
                                data = json.loads(company_dict['directors'])
                                if isinstance(data, list):
                                    director_names = []
                                    for director in data:
                                        if isinstance(director, dict) and 'name' in director:
                                            director_names.append(director['name'])
                                        elif isinstance(director, str):
                                            director_names.append(director)
                                    company_dict['directors'] = ', '.join(director_names) if director_names else ''
                            except:
                                pass
                    else:
                        company_dict['directors'] = ''
                    
                    if company_dict.get('secretary'):
                        if isinstance(company_dict['secretary'], dict):
                            company_dict['secretary'] = company_dict['secretary'].get('name', '')
                        elif isinstance(company_dict['secretary'], str):
                            try:
                                data = json.loads(company_dict['secretary'])
                                if isinstance(data, dict) and 'name' in data:
                                    company_dict['secretary'] = data['name']
                            except:
                                pass
                    else:
                        company_dict['secretary'] = ''
                    
                    if company_dict.get('auditor'):
                        if isinstance(company_dict['auditor'], dict):
                            company_dict['auditor'] = company_dict['auditor'].get('name', '')
                        elif isinstance(company_dict['auditor'], str):
                            try:
                                data = json.loads(company_dict['auditor'])
                                if isinstance(data, dict) and 'name' in data:
                                    company_dict['auditor'] = data['name']
                            except:
                                pass
                    else:
                        company_dict['auditor'] = ''
                else:
                    # For banks and insurance, set empty values for company-specific fields
                    company_dict['business_activities'] = ''
                    company_dict['directors'] = ''
                    company_dict['secretary'] = ''
                    company_dict['auditor'] = ''
                    
                # Convert rating from string to number if possible (for all entity types)
                if company_dict.get('rating'):
                    try:
                        # Try to convert rating to float
                        rating_str = str(company_dict['rating'])
                        if rating_str.replace('.', '').replace('-', '').isdigit():
                            company_dict['rating'] = float(rating_str)
                        else:
                            # Handle letter grades like 'A+', 'A', etc.
                            rating_map = {'A+': 4.3, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0.0}
                            company_dict['rating'] = rating_map.get(rating_str, 0.0)
                    except (ValueError, TypeError):
                        company_dict['rating'] = 0.0
                else:
                    company_dict['rating'] = 0.0
                
                formatted_companies.append(company_dict)
                print(f"Processed company: {company_dict.get('name', 'No name')} - business_activities: {company_dict.get('business_activities', 'None')}")
                
            except Exception as e:
                print(f"Error processing company: {e}")
                continue
        
        # Calculate total pages
        total_pages = math.ceil(total / limit) if total > 0 else 0
        
        return {
            "companies": formatted_companies,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in get_companies: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching companies: {str(e)}")

@router.get("/{company_id}")
async def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific company"""
    try:
        company = db.query(Companies).filter(Companies.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Get analytics if available
        analytics = db.query(CompanyAnalytics).filter(CompanyAnalytics.company_id == company_id).first()
        case_stats = db.query(CompanyCaseStatistics).filter(CompanyCaseStatistics.company_id == company_id).first()
        
        # Convert company data for API response
        company_dict = company.__dict__.copy()
        
        # Keep business_activities as array for detailed view (don't convert to string)
        # Only convert if it's a string that needs parsing
        if company_dict.get('business_activities'):
            if isinstance(company_dict['business_activities'], str):
                try:
                    company_dict['business_activities'] = json.loads(company_dict['business_activities'])
                except:
                    # If parsing fails, keep as string
                    pass
            elif not isinstance(company_dict['business_activities'], list):
                company_dict['business_activities'] = []
        else:
            company_dict['business_activities'] = []
            
        # Keep directors as array for detailed view
        if company_dict.get('directors'):
            if isinstance(company_dict['directors'], str):
                try:
                    parsed = json.loads(company_dict['directors'])
                    company_dict['directors'] = parsed if isinstance(parsed, list) else []
                except Exception as e:
                    print(f"Error parsing directors JSON: {e}, raw value: {company_dict['directors']}")
                    company_dict['directors'] = []
            elif not isinstance(company_dict['directors'], list):
                company_dict['directors'] = []
        else:
            company_dict['directors'] = []
            
        # Keep board_of_directors as array for detailed view
        if company_dict.get('board_of_directors'):
            if isinstance(company_dict['board_of_directors'], str):
                try:
                    parsed = json.loads(company_dict['board_of_directors'])
                    company_dict['board_of_directors'] = parsed if isinstance(parsed, list) else []
                except Exception as e:
                    print(f"Error parsing board_of_directors JSON: {e}, raw value: {company_dict['board_of_directors']}")
                    company_dict['board_of_directors'] = []
            elif not isinstance(company_dict['board_of_directors'], list):
                company_dict['board_of_directors'] = []
        else:
            company_dict['board_of_directors'] = []
            
        # Debug logging
        print(f"Company {company_id} - directors count: {len(company_dict.get('directors', []))}, board_of_directors count: {len(company_dict.get('board_of_directors', []))}")
        if company_dict.get('directors'):
            print(f"Directors sample: {company_dict['directors'][:2] if len(company_dict['directors']) > 0 else 'empty'}")
        if company_dict.get('board_of_directors'):
            print(f"Board of directors sample: {company_dict['board_of_directors'][:2] if len(company_dict['board_of_directors']) > 0 else 'empty'}")
            
        # Keep secretary as object for detailed view
        if company_dict.get('secretary'):
            if isinstance(company_dict['secretary'], str):
                try:
                    company_dict['secretary'] = json.loads(company_dict['secretary'])
                except:
                    company_dict['secretary'] = {}
            elif not isinstance(company_dict['secretary'], dict):
                company_dict['secretary'] = {}
        else:
            company_dict['secretary'] = {}
            
        # Keep auditor as object for detailed view
        if company_dict.get('auditor'):
            if isinstance(company_dict['auditor'], str):
                try:
                    company_dict['auditor'] = json.loads(company_dict['auditor'])
                except:
                    company_dict['auditor'] = {}
            elif not isinstance(company_dict['auditor'], dict):
                company_dict['auditor'] = {}
        else:
            company_dict['auditor'] = {}
        
        # Keep shareholders as array for detailed view
        if company_dict.get('shareholders'):
            if isinstance(company_dict['shareholders'], str):
                try:
                    company_dict['shareholders'] = json.loads(company_dict['shareholders'])
                except:
                    company_dict['shareholders'] = []
            elif not isinstance(company_dict['shareholders'], list):
                company_dict['shareholders'] = []
        else:
            company_dict['shareholders'] = []
        
        # Keep key_personnel as array for detailed view (employees)
        if company_dict.get('key_personnel'):
            if isinstance(company_dict['key_personnel'], str):
                try:
                    company_dict['key_personnel'] = json.loads(company_dict['key_personnel'])
                except:
                    company_dict['key_personnel'] = []
            elif not isinstance(company_dict['key_personnel'], list):
                company_dict['key_personnel'] = []
        else:
            company_dict['key_personnel'] = []
        
        # Keep key_personnel as array for detailed view
        if company_dict.get('key_personnel'):
            if isinstance(company_dict['key_personnel'], str):
                try:
                    company_dict['key_personnel'] = json.loads(company_dict['key_personnel'])
                except:
                    company_dict['key_personnel'] = []
            elif not isinstance(company_dict['key_personnel'], list):
                company_dict['key_personnel'] = []
        else:
            company_dict['key_personnel'] = []
            
        # Convert rating from string to number if possible
        if company_dict.get('rating'):
            try:
                # Try to convert rating to float
                rating_str = str(company_dict['rating'])
                if rating_str.replace('.', '').replace('-', '').isdigit():
                    company_dict['rating'] = float(rating_str)
                else:
                    # Handle letter grades like 'A+', 'A', etc.
                    rating_map = {'A+': 4.3, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0.0}
                    company_dict['rating'] = rating_map.get(rating_str, 0.0)
            except (ValueError, TypeError):
                company_dict['rating'] = 0.0
        else:
            company_dict['rating'] = 0.0
        
        # Remove SQLAlchemy internal attributes
        company_dict.pop('_sa_instance_state', None)
        
        analytics_dict = None
        if analytics:
            analytics_dict = analytics.__dict__.copy()
            analytics_dict.pop("_sa_instance_state", None)
            # Normalize decimals and datetimes for JSON serialization
            for key in [
                "total_monetary_amount",
                "average_case_value",
                "customer_dispute_rate",
                "success_rate",
            ]:
                if analytics_dict.get(key) is not None:
                    try:
                        analytics_dict[key] = float(analytics_dict[key])
                    except (TypeError, ValueError):
                        analytics_dict[key] = 0.0
            for key in ["last_updated", "created_at"]:
                if analytics_dict.get(key) and hasattr(analytics_dict[key], "isoformat"):
                    analytics_dict[key] = analytics_dict[key].isoformat()
            # Enums to string
            for key in ["risk_level", "financial_risk_level"]:
                if analytics_dict.get(key) is not None:
                    analytics_dict[key] = str(analytics_dict[key])

        case_stats_dict = case_stats.to_dict() if case_stats else None

        return {
            "company": company_dict,
            "analytics": analytics_dict,
            "case_statistics": case_stats_dict
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching company: {str(e)}")

@router.post("/")
async def create_company(company_data: CompanyCreateRequest, db: Session = Depends(get_db)):
    """Create a new company"""
    try:
        # Convert comma-separated strings to JSON arrays for storage
        company_dict = company_data.dict()
        
        # Convert string fields to JSON arrays/objects
        if company_dict.get('business_activities'):
            company_dict['business_activities'] = [activity.strip() for activity in company_dict['business_activities'].split(',') if activity.strip()]
        else:
            company_dict['business_activities'] = []
            
        if company_dict.get('directors'):
            # Convert comma-separated names to list of dicts
            director_names = [name.strip() for name in company_dict['directors'].split(',') if name.strip()]
            company_dict['directors'] = [{'name': name, 'id_number': f'P{str(i).zfill(9)}'} for i, name in enumerate(director_names, 1)]
        else:
            company_dict['directors'] = []
            
        if company_dict.get('secretary'):
            company_dict['secretary'] = {'name': company_dict['secretary'], 'id_number': f'P{str(1).zfill(9)}'}
        else:
            company_dict['secretary'] = {}
            
        # Handle auditor - can be string, dict, or None
        if company_dict.get('auditor'):
            if isinstance(company_dict['auditor'], dict):
                # Already a dict, ensure it has required structure
                if 'firm_name' in company_dict['auditor']:
                    # Rename firm_name to name for consistency
                    company_dict['auditor']['name'] = company_dict['auditor'].get('firm_name', '')
                # Keep as is
                pass
            elif isinstance(company_dict['auditor'], str):
                # Convert string to dict
                company_dict['auditor'] = {'name': company_dict['auditor'], 'id_number': f'C{str(1).zfill(9)}'}
            else:
                company_dict['auditor'] = {}
        else:
            company_dict['auditor'] = {}
        
        # Handle shareholders - can be string, list of dicts, or None
        if company_dict.get('shareholders'):
            if isinstance(company_dict['shareholders'], list):
                # Already a list of dicts, keep as is
                pass
            elif isinstance(company_dict['shareholders'], str):
                # Convert comma-separated string to list of dicts
                shareholder_names = [name.strip() for name in company_dict['shareholders'].split(',') if name.strip()]
                company_dict['shareholders'] = [{'name': name} for name in shareholder_names]
            else:
                company_dict['shareholders'] = []
        else:
            company_dict['shareholders'] = []
        
        # Handle key_personnel - can be string, list of dicts, or None
        if company_dict.get('key_personnel'):
            if isinstance(company_dict['key_personnel'], list):
                # Already a list of dicts, keep as is
                pass
            elif isinstance(company_dict['key_personnel'], str):
                # Convert comma-separated string to list of dicts
                personnel_names = [name.strip() for name in company_dict['key_personnel'].split(',') if name.strip()]
                company_dict['key_personnel'] = [{'name': name} for name in personnel_names]
            else:
                company_dict['key_personnel'] = []
        else:
            company_dict['key_personnel'] = []
        
        # Handle other_linked_companies - can be string, list of dicts, or None
        if company_dict.get('other_linked_companies'):
            if isinstance(company_dict['other_linked_companies'], list):
                # Already a list of dicts, keep as is
                pass
            elif isinstance(company_dict['other_linked_companies'], str):
                # Convert comma-separated string to list of dicts
                company_names = [name.strip() for name in company_dict['other_linked_companies'].split(',') if name.strip()]
                company_dict['other_linked_companies'] = [{'name': name} for name in company_names]
            else:
                company_dict['other_linked_companies'] = []
        else:
            company_dict['other_linked_companies'] = []
        
        # Handle new financial fields - convert strings to appropriate types
        if company_dict.get('authorized_capital'):
            try:
                if isinstance(company_dict['authorized_capital'], str):
                    company_dict['authorized_capital'] = float(str(company_dict['authorized_capital']).replace(',', '').replace(' ', ''))
            except (ValueError, TypeError):
                company_dict['authorized_capital'] = None
        
        if company_dict.get('annual_turnover'):
            try:
                if isinstance(company_dict['annual_turnover'], str):
                    company_dict['annual_turnover'] = float(str(company_dict['annual_turnover']).replace(',', '').replace(' ', ''))
            except (ValueError, TypeError):
                company_dict['annual_turnover'] = None
        
        if company_dict.get('total_assets'):
            try:
                if isinstance(company_dict['total_assets'], str):
                    company_dict['total_assets'] = float(str(company_dict['total_assets']).replace(',', '').replace(' ', ''))
            except (ValueError, TypeError):
                company_dict['total_assets'] = None
        
        # Create the company
        company = Companies(**company_dict)
        db.add(company)
        db.commit()
        db.refresh(company)
        
        return {"message": "Company created successfully", "company_id": company.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating company: {str(e)}")

@router.put("/{company_id}")
async def update_company(company_id: int, company_data: CompanyUpdateRequest, db: Session = Depends(get_db)):
    """Update an existing company"""
    try:
        company = db.query(Companies).filter(Companies.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Convert comma-separated strings to JSON arrays for storage
        update_data = company_data.dict(exclude_unset=True)
        
        # Convert string fields to JSON arrays/objects
        if 'business_activities' in update_data and update_data['business_activities']:
            update_data['business_activities'] = [activity.strip() for activity in update_data['business_activities'].split(',') if activity.strip()]
        elif 'business_activities' in update_data and not update_data['business_activities']:
            update_data['business_activities'] = []
            
        if 'directors' in update_data and update_data['directors']:
            # Check if it's a JSON string
            if isinstance(update_data['directors'], str):
                try:
                    # Try to parse as JSON first
                    parsed = json.loads(update_data['directors'])
                    if isinstance(parsed, list):
                        # Validate that each director has a name field
                        validated_directors = []
                        for dir_obj in parsed:
                            if isinstance(dir_obj, dict):
                                # If it already has a name, use it as is
                                if 'name' in dir_obj and dir_obj['name']:
                                    validated_directors.append(dir_obj)
                                else:
                                    print(f"[UPDATE] Warning: Director object missing name field: {dir_obj}")
                                    # Try to find name in other fields
                                    name = dir_obj.get('Name') or dir_obj.get('NAME') or dir_obj.get('full_name') or ''
                                    if name:
                                        dir_obj['name'] = name
                                        validated_directors.append(dir_obj)
                                    else:
                                        print(f"[UPDATE] Skipping director with no name: {dir_obj}")
                            else:
                                # If it's not a dict, convert to dict with name
                                validated_directors.append({'name': str(dir_obj)} if dir_obj else {'name': 'Unknown'})
                        update_data['directors'] = validated_directors
                        print(f"[UPDATE] Validated {len(validated_directors)} directors")
                    else:
                        # If not a list, treat as comma-separated
                        director_names = [name.strip() for name in update_data['directors'].split(',') if name.strip()]
                        update_data['directors'] = [{'name': name, 'id_number': f'P{str(i).zfill(9)}'} for i, name in enumerate(director_names, 1)]
                except (json.JSONDecodeError, TypeError):
                    # Not JSON, treat as comma-separated
                    director_names = [name.strip() for name in update_data['directors'].split(',') if name.strip()]
                    update_data['directors'] = [{'name': name, 'id_number': f'P{str(i).zfill(9)}'} for i, name in enumerate(director_names, 1)]
            elif isinstance(update_data['directors'], list):
                # Already a list, use as is
                pass
            else:
                update_data['directors'] = []
        elif 'directors' in update_data and not update_data['directors']:
            update_data['directors'] = []
            
        if 'secretary' in update_data and update_data['secretary']:
            # Check if it's a JSON string
            if isinstance(update_data['secretary'], str):
                try:
                    # Try to parse as JSON first
                    parsed = json.loads(update_data['secretary'])
                    if isinstance(parsed, dict):
                        update_data['secretary'] = parsed
                    else:
                        # If not a dict, treat as name only
                        update_data['secretary'] = {'name': update_data['secretary'], 'id_number': f'P{str(1).zfill(9)}'}
                except (json.JSONDecodeError, TypeError):
                    # Not JSON, treat as name only
                    update_data['secretary'] = {'name': update_data['secretary'], 'id_number': f'P{str(1).zfill(9)}'}
            elif isinstance(update_data['secretary'], dict):
                # Already a dict, use as is
                pass
            else:
                update_data['secretary'] = {}
        elif 'secretary' in update_data and not update_data['secretary']:
            update_data['secretary'] = {}
            
        if 'auditor' in update_data and update_data['auditor']:
            # Check if it's a JSON string
            if isinstance(update_data['auditor'], str):
                try:
                    # Try to parse as JSON first
                    parsed = json.loads(update_data['auditor'])
                    if isinstance(parsed, dict):
                        update_data['auditor'] = parsed
                    else:
                        # If not a dict, treat as name only
                        update_data['auditor'] = {'name': update_data['auditor'], 'id_number': f'C{str(1).zfill(9)}'}
                except (json.JSONDecodeError, TypeError):
                    # Not JSON, treat as name only
                    update_data['auditor'] = {'name': update_data['auditor'], 'id_number': f'C{str(1).zfill(9)}'}
            elif isinstance(update_data['auditor'], dict):
                # Already a dict, use as is
                pass
            else:
                update_data['auditor'] = {}
        elif 'auditor' in update_data and not update_data['auditor']:
            update_data['auditor'] = {}
            
        if 'key_personnel' in update_data and update_data['key_personnel']:
            # Check if it's a JSON string
            if isinstance(update_data['key_personnel'], str):
                try:
                    # Try to parse as JSON first
                    parsed = json.loads(update_data['key_personnel'])
                    if isinstance(parsed, list):
                        update_data['key_personnel'] = parsed
                    else:
                        update_data['key_personnel'] = []
                except (json.JSONDecodeError, TypeError):
                    update_data['key_personnel'] = []
            elif isinstance(update_data['key_personnel'], list):
                # Already a list, use as is
                pass
            else:
                update_data['key_personnel'] = []
        elif 'key_personnel' in update_data and not update_data['key_personnel']:
            update_data['key_personnel'] = []
            
        if 'board_of_directors' in update_data and update_data['board_of_directors']:
            # Check if it's a JSON string
            if isinstance(update_data['board_of_directors'], str):
                try:
                    # Try to parse as JSON first
                    parsed = json.loads(update_data['board_of_directors'])
                    if isinstance(parsed, list):
                        update_data['board_of_directors'] = parsed
                    else:
                        update_data['board_of_directors'] = []
                except (json.JSONDecodeError, TypeError):
                    update_data['board_of_directors'] = []
            elif isinstance(update_data['board_of_directors'], list):
                # Already a list, use as is
                pass
            else:
                update_data['board_of_directors'] = []
        elif 'board_of_directors' in update_data and not update_data['board_of_directors']:
            update_data['board_of_directors'] = []
        
        # Update the company
        print(f"\n[UPDATE] Updating company {company_id}")
        for field, value in update_data.items():
            setattr(company, field, value)
            if field in ['directors', 'board_of_directors', 'secretary', 'key_personnel']:
                print(f"[UPDATE] Setting {field} = {type(value).__name__} (length: {len(value) if isinstance(value, (list, dict)) else 'N/A'})")
            else:
                print(f"[UPDATE] Setting {field} = {value} (type: {type(value).__name__})")
        
        db.commit()
        db.refresh(company)
        
        # Log the updated values to verify they were saved
        print(f"[UPDATE] Company {company_id} updated successfully")
        if 'directors' in update_data:
            directors_value = company.directors
            if isinstance(directors_value, list):
                print(f"[UPDATE] Directors after update: {len(directors_value)} items")
                for idx, dir in enumerate(directors_value[:3]):  # Show first 3
                    print(f"  [{idx}] {dir.get('name', 'No name') if isinstance(dir, dict) else dir}")
            else:
                print(f"[UPDATE] Directors after update: {type(directors_value).__name__} = {directors_value}")
        if 'board_of_directors' in update_data:
            board_value = company.board_of_directors
            if isinstance(board_value, list):
                print(f"[UPDATE] Board of directors after update: {len(board_value)} items")
            else:
                print(f"[UPDATE] Board of directors after update: {type(board_value).__name__}")
        
        return {"message": "Company updated successfully", "company_id": company_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating company: {str(e)}")

# Company Locations Routes
@router.post("/locations/")
async def create_company_location(location_data: CompanyLocationCreate, db: Session = Depends(get_db)):
    """Create a new company location"""
    try:
        # Check if company exists
        company = db.query(Companies).filter(Companies.id == location_data.company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        location = CompanyLocation(**location_data.dict())
        db.add(location)
        db.commit()
        db.refresh(location)
        
        return {"message": "Location created successfully", "location_id": location.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating location: {str(e)}")

# Company Regulatory Routes
@router.get("/regulatory/{company_id}")
async def get_company_regulatory(company_id: int, db: Session = Depends(get_db)):
    """Get all regulatory compliance records for a company"""
    try:
        regulatory_records = db.query(CompanyRegulatory).filter(
            CompanyRegulatory.company_id == company_id
        ).order_by(CompanyRegulatory.created_at.desc()).all()
        
        # Convert to dict format
        result = []
        for record in regulatory_records:
            record_dict = {
                'id': record.id,
                'body': record.regulatory_body or 'N/A',
                'licenseNumber': record.license_permit_number or 'N/A',
                'status': record.status or 'N/A',
                'violations': '',  # Will be extracted from notes if needed
                'actions': '',  # Will be extracted from notes if needed
                'date': record.issue_date.strftime('%m/%d/%Y') if record.issue_date else 'N/A',
                'issue_date': record.issue_date.isoformat() if record.issue_date else None,
                'expiry_date': record.expiry_date.isoformat() if record.expiry_date else None,
                'notes': record.notes or ''
            }
            
            # Try to extract violations and actions from notes if they exist
            if record.notes:
                # Simple parsing - can be enhanced later
                if 'violations:' in record.notes.lower():
                    parts = record.notes.split('violations:')
                    if len(parts) > 1:
                        record_dict['violations'] = parts[1].split('actions:')[0].strip() if 'actions:' in parts[1] else parts[1].strip()
                if 'actions:' in record.notes.lower():
                    parts = record.notes.split('actions:')
                    if len(parts) > 1:
                        record_dict['actions'] = parts[1].strip()
            
            result.append(record_dict)
        
        return {"regulatory": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching regulatory records: {str(e)}")

@router.post("/regulatory/")
async def create_company_regulatory(regulatory_data: CompanyRegulatoryCreate, db: Session = Depends(get_db)):
    """Create a new regulatory compliance record"""
    try:
        # Check if company exists
        company = db.query(Companies).filter(Companies.id == regulatory_data.company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Build notes field from violations and actions if provided
        notes_parts = []
        if hasattr(regulatory_data, 'compliance_violations') and regulatory_data.compliance_violations:
            notes_parts.append(f"Violations: {regulatory_data.compliance_violations}")
        if hasattr(regulatory_data, 'regulatory_actions') and regulatory_data.regulatory_actions:
            notes_parts.append(f"Actions: {regulatory_data.regulatory_actions}")
        
        # Get the dict and remove fields that don't exist in the model
        regulatory_dict = regulatory_data.dict()
        
        # Remove fields that aren't in the CompanyRegulatory model
        fields_to_remove = ['compliance_violations', 'regulatory_actions']
        for field in fields_to_remove:
            regulatory_dict.pop(field, None)
        
        # Add combined notes if we have violations or actions
        if notes_parts:
            existing_notes = regulatory_dict.get('notes', '')
            if existing_notes:
                regulatory_dict['notes'] = f"{existing_notes} | {' | '.join(notes_parts)}"
            else:
                regulatory_dict['notes'] = ' | '.join(notes_parts)
        
        regulatory = CompanyRegulatory(**regulatory_dict)
        db.add(regulatory)
        db.commit()
        db.refresh(regulatory)
        
        return {"message": "Regulatory record created successfully", "regulatory_id": regulatory.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating regulatory record: {str(e)}")

@router.put("/regulatory/{regulatory_id}")
async def update_company_regulatory(regulatory_id: int, regulatory_data: CompanyRegulatoryCreate, db: Session = Depends(get_db)):
    """Update an existing regulatory compliance record"""
    try:
        regulatory = db.query(CompanyRegulatory).filter(CompanyRegulatory.id == regulatory_id).first()
        if not regulatory:
            raise HTTPException(status_code=404, detail="Regulatory record not found")

        # Build notes field from violations and actions if provided
        notes_parts = []
        if hasattr(regulatory_data, 'compliance_violations') and regulatory_data.compliance_violations:
            notes_parts.append(f"Violations: {regulatory_data.compliance_violations}")
        if hasattr(regulatory_data, 'regulatory_actions') and regulatory_data.regulatory_actions:
            notes_parts.append(f"Actions: {regulatory_data.regulatory_actions}")

        # Get the dict and remove fields that don't exist in the model
        regulatory_dict = regulatory_data.dict(exclude_unset=True)
        
        # Remove fields that aren't in the CompanyRegulatory model
        fields_to_remove = ['compliance_violations', 'regulatory_actions', 'company_id']
        for field in fields_to_remove:
            regulatory_dict.pop(field, None)

        # Add combined notes if we have violations or actions
        if notes_parts:
            existing_notes = regulatory_dict.get('notes', regulatory.notes or '')
            if existing_notes and 'Violations:' not in existing_notes and 'Actions:' not in existing_notes:
                regulatory_dict['notes'] = f"{existing_notes} | {' | '.join(notes_parts)}"
            else:
                regulatory_dict['notes'] = ' | '.join(notes_parts)

        # Update the record
        for field, value in regulatory_dict.items():
            setattr(regulatory, field, value)
        
        db.commit()
        db.refresh(regulatory)
        
        return {"message": "Regulatory record updated successfully", "regulatory_id": regulatory.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating regulatory record: {str(e)}")

@router.delete("/regulatory/{regulatory_id}")
async def delete_company_regulatory(regulatory_id: int, db: Session = Depends(get_db)):
    """Delete a regulatory compliance record"""
    try:
        regulatory = db.query(CompanyRegulatory).filter(CompanyRegulatory.id == regulatory_id).first()
        if not regulatory:
            raise HTTPException(status_code=404, detail="Regulatory record not found")

        db.delete(regulatory)
        db.commit()
        
        return {"message": "Regulatory record deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting regulatory record: {str(e)}")

# Company Case Links Routes
@router.post("/case-links/")
async def create_company_case_link(case_link_data: CompanyCaseLinkCreate, db: Session = Depends(get_db)):
    """Create a new company-case link"""
    try:
        # Check if company exists
        company = db.query(Companies).filter(Companies.id == case_link_data.company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # If case_id is provided, verify it exists
        if case_link_data.case_id:
            from models.reported_cases import ReportedCases
            case = db.query(ReportedCases).filter(ReportedCases.id == case_link_data.case_id).first()
            if not case:
                raise HTTPException(status_code=404, detail="Case not found")
        
        case_link = CompanyCaseLink(**case_link_data.dict())
        db.add(case_link)
        db.commit()
        db.refresh(case_link)
        
        return {"message": "Case link created successfully", "case_link_id": case_link.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating case link: {str(e)}")

@router.put("/case-links/{case_link_id}")
async def update_company_case_link(case_link_id: int, case_link_data: CompanyCaseLinkCreate, db: Session = Depends(get_db)):
    """Update an existing company-case link"""
    try:
        case_link = db.query(CompanyCaseLink).filter(CompanyCaseLink.id == case_link_id).first()
        if not case_link:
            raise HTTPException(status_code=404, detail="Case link not found")

        # If case_id is provided, verify it exists
        if case_link_data.case_id:
            from models.reported_cases import ReportedCases
            case = db.query(ReportedCases).filter(ReportedCases.id == case_link_data.case_id).first()
            if not case:
                raise HTTPException(status_code=404, detail="Case not found")

        # Get the dict and remove company_id (shouldn't be updated)
        case_link_dict = case_link_data.dict(exclude_unset=True)
        case_link_dict.pop('company_id', None)

        # Update the record
        for field, value in case_link_dict.items():
            setattr(case_link, field, value)
        
        db.commit()
        db.refresh(case_link)
        
        return {"message": "Case link updated successfully", "case_link_id": case_link.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating case link: {str(e)}")

@router.delete("/case-links/{case_link_id}")
async def delete_company_case_link(case_link_id: int, db: Session = Depends(get_db)):
    """Delete a company-case link"""
    try:
        case_link = db.query(CompanyCaseLink).filter(CompanyCaseLink.id == case_link_id).first()
        if not case_link:
            raise HTTPException(status_code=404, detail="Case link not found")

        db.delete(case_link)
        db.commit()
        
        return {"message": "Case link deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting case link: {str(e)}")

# Company Sources Routes
@router.post("/sources/")
async def create_company_source(source_data: CompanySourceCreate, db: Session = Depends(get_db)):
    """Create a new company source"""
    try:
        # Check if company exists
        company = db.query(Companies).filter(Companies.id == source_data.company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        source = CompanySource(**source_data.dict())
        db.add(source)
        db.commit()
        db.refresh(source)
        
        return {"message": "Source created successfully", "source_id": source.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating source: {str(e)}")

@router.delete("/{company_id}")
async def delete_company(company_id: int, db: Session = Depends(get_db)):
    """Delete a company and all associated data"""
    try:
        company = db.query(Companies).filter(Companies.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Delete associated analytics and statistics
        db.query(CompanyAnalytics).filter(CompanyAnalytics.company_id == company_id).delete()
        db.query(CompanyCaseStatistics).filter(CompanyCaseStatistics.company_id == company_id).delete()
        
        # Delete the company
        db.delete(company)
        db.commit()
        
        return {"message": "Company deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting company: {str(e)}")
