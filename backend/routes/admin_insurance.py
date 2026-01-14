from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.insurance import Insurance
from models.insurance_analytics import InsuranceAnalytics
from models.insurance_case_statistics import InsuranceCaseStatistics
from schemas.admin import InsuranceCreateRequest, InsuranceUpdateRequest
from typing import List, Optional
import math
import json

router = APIRouter()

@router.get("/stats")
async def get_insurance_stats(db: Session = Depends(get_db)):
    """Get comprehensive insurance statistics for admin dashboard"""
    try:
        # Basic counts
        total_insurance = db.query(Insurance).count()
        
        # Financial analysis
        total_assets = db.query(Insurance.total_assets).filter(Insurance.total_assets.isnot(None)).all()
        total_assets = sum([assets[0] for assets in total_assets]) if total_assets else 0
        
        total_branches = db.query(Insurance.branches_count).filter(Insurance.branches_count.isnot(None)).all()
        total_branches = sum([branches[0] for branches in total_branches]) if total_branches else 0
        
        # Average rating
        avg_rating = db.query(Insurance.rating).filter(Insurance.rating.isnot(None)).all()
        avg_rating = sum([rating[0] for rating in avg_rating]) / len(avg_rating) if avg_rating else 0
        
        # Active insurance companies
        active_insurance = db.query(Insurance).filter(Insurance.is_active == True).count()
        
        return {
            "total_insurance": total_insurance,
            "total_assets": total_assets,
            "total_branches": total_branches,
            "avg_rating": avg_rating,
            "active_insurance": active_insurance,
            "last_updated": db.query(Insurance.updated_at).order_by(Insurance.updated_at.desc()).first()[0].isoformat() if db.query(Insurance.updated_at).first() else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching insurance stats: {str(e)}")

@router.get("/")
async def get_insurance(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    insurance_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of insurance companies with optional filtering"""
    try:
        query = db.query(Insurance)
        
        # Apply search filter
        if search:
            query = query.filter(
                Insurance.name.ilike(f"%{search}%") |
                Insurance.short_name.ilike(f"%{search}%") |
                Insurance.email.ilike(f"%{search}%")
            )
        
        # Apply insurance type filter
        if insurance_type:
            query = query.filter(Insurance.insurance_type == insurance_type)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        insurance = query.offset(offset).limit(limit).all()
        
        # Convert JSON arrays to strings for API response
        formatted_insurance = []
        for company in insurance:
            company_dict = company.__dict__.copy()
            
            # Convert JSON arrays to comma-separated strings
            if company_dict.get('previous_names') and isinstance(company_dict['previous_names'], list):
                company_dict['previous_names'] = ', '.join(company_dict['previous_names']) if company_dict['previous_names'] else ''
            elif company_dict.get('previous_names') is None or company_dict.get('previous_names') == []:
                company_dict['previous_names'] = ''
                
            if company_dict.get('services'):
                if isinstance(company_dict['services'], list):
                    company_dict['services'] = ', '.join(company_dict['services']) if company_dict['services'] else ''
                elif isinstance(company_dict['services'], str) and company_dict['services'].startswith('['):
                    # Handle JSON string format
                    import json
                    try:
                        services_list = json.loads(company_dict['services'])
                        company_dict['services'] = ', '.join(services_list) if services_list else ''
                    except:
                        company_dict['services'] = company_dict['services']  # Keep as is if parsing fails
            elif company_dict.get('services') is None or company_dict.get('services') == []:
                company_dict['services'] = ''
                
            if company_dict.get('coverage_areas'):
                if isinstance(company_dict['coverage_areas'], list):
                    company_dict['coverage_areas'] = ', '.join(company_dict['coverage_areas']) if company_dict['coverage_areas'] else ''
                elif isinstance(company_dict['coverage_areas'], str) and company_dict['coverage_areas'].startswith('['):
                    # Handle JSON string format
                    import json
                    try:
                        areas_list = json.loads(company_dict['coverage_areas'])
                        company_dict['coverage_areas'] = ', '.join(areas_list) if areas_list else ''
                    except:
                        company_dict['coverage_areas'] = company_dict['coverage_areas']  # Keep as is if parsing fails
            elif company_dict.get('coverage_areas') is None or company_dict.get('coverage_areas') == []:
                company_dict['coverage_areas'] = ''
                
            if company_dict.get('specializes_in'):
                if isinstance(company_dict['specializes_in'], list):
                    company_dict['specializes_in'] = ', '.join(company_dict['specializes_in']) if company_dict['specializes_in'] else ''
                elif isinstance(company_dict['specializes_in'], str) and company_dict['specializes_in'].startswith('['):
                    # Handle JSON string format
                    import json
                    try:
                        specializes_list = json.loads(company_dict['specializes_in'])
                        company_dict['specializes_in'] = ', '.join(specializes_list) if specializes_list else ''
                    except:
                        company_dict['specializes_in'] = company_dict['specializes_in']  # Keep as is if parsing fails
            elif company_dict.get('specializes_in') is None or company_dict.get('specializes_in') == []:
                company_dict['specializes_in'] = ''
            
            # Remove SQLAlchemy internal attributes
            company_dict.pop('_sa_instance_state', None)
            formatted_insurance.append(company_dict)
        
        # Calculate total pages
        total_pages = math.ceil(total / limit)
        
        return {
            "insurance": formatted_insurance,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching insurance: {str(e)}")

@router.get("/{insurance_id}")
async def get_insurance_company(insurance_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific insurance company"""
    try:
        insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
        if not insurance:
            raise HTTPException(status_code=404, detail="Insurance company not found")
        
        # Get analytics if available
        analytics = db.query(InsuranceAnalytics).filter(InsuranceAnalytics.insurance_id == insurance_id).first()
        case_stats = db.query(InsuranceCaseStatistics).filter(InsuranceCaseStatistics.insurance_id == insurance_id).first()
        
        # Convert insurance data for API response
        insurance_dict = insurance.__dict__.copy()
        
        # Convert JSON arrays to comma-separated strings
        if insurance_dict.get('previous_names') and isinstance(insurance_dict['previous_names'], list):
            insurance_dict['previous_names'] = ', '.join(insurance_dict['previous_names']) if insurance_dict['previous_names'] else ''
        elif insurance_dict.get('previous_names') is None or insurance_dict.get('previous_names') == []:
            insurance_dict['previous_names'] = ''
            
        if insurance_dict.get('services'):
            if isinstance(insurance_dict['services'], list):
                insurance_dict['services'] = ', '.join(insurance_dict['services']) if insurance_dict['services'] else ''
            elif isinstance(insurance_dict['services'], str) and insurance_dict['services'].startswith('['):
                # Handle JSON string format
                import json
                try:
                    services_list = json.loads(insurance_dict['services'])
                    insurance_dict['services'] = ', '.join(services_list) if services_list else ''
                except:
                    insurance_dict['services'] = insurance_dict['services']  # Keep as is if parsing fails
        elif insurance_dict.get('services') is None or insurance_dict.get('services') == []:
            insurance_dict['services'] = ''
            
        if insurance_dict.get('coverage_areas'):
            if isinstance(insurance_dict['coverage_areas'], list):
                insurance_dict['coverage_areas'] = ', '.join(insurance_dict['coverage_areas']) if insurance_dict['coverage_areas'] else ''
            elif isinstance(insurance_dict['coverage_areas'], str) and insurance_dict['coverage_areas'].startswith('['):
                # Handle JSON string format
                import json
                try:
                    areas_list = json.loads(insurance_dict['coverage_areas'])
                    insurance_dict['coverage_areas'] = ', '.join(areas_list) if areas_list else ''
                except:
                    insurance_dict['coverage_areas'] = insurance_dict['coverage_areas']  # Keep as is if parsing fails
        elif insurance_dict.get('coverage_areas') is None or insurance_dict.get('coverage_areas') == []:
            insurance_dict['coverage_areas'] = ''
            
        if insurance_dict.get('specializes_in'):
            if isinstance(insurance_dict['specializes_in'], list):
                insurance_dict['specializes_in'] = ', '.join(insurance_dict['specializes_in']) if insurance_dict['specializes_in'] else ''
            elif isinstance(insurance_dict['specializes_in'], str) and insurance_dict['specializes_in'].startswith('['):
                # Handle JSON string format
                import json
                try:
                    specializes_list = json.loads(insurance_dict['specializes_in'])
                    insurance_dict['specializes_in'] = ', '.join(specializes_list) if specializes_list else ''
                except:
                    insurance_dict['specializes_in'] = insurance_dict['specializes_in']  # Keep as is if parsing fails
        elif insurance_dict.get('specializes_in') is None or insurance_dict.get('specializes_in') == []:
            insurance_dict['specializes_in'] = ''
        
        # Remove SQLAlchemy internal attributes
        insurance_dict.pop('_sa_instance_state', None)
        
        return {
            "insurance": insurance_dict,
            "analytics": analytics,
            "case_statistics": case_stats
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching insurance: {str(e)}")

@router.post("/")
async def create_insurance(insurance_data: InsuranceCreateRequest, db: Session = Depends(get_db)):
    """Create a new insurance company"""
    try:
        # Convert comma-separated strings to JSON arrays for storage
        insurance_dict = insurance_data.dict()
        
        # Convert string fields to JSON arrays
        if insurance_dict.get('previous_names'):
            insurance_dict['previous_names'] = [name.strip() for name in insurance_dict['previous_names'].split(',') if name.strip()]
        else:
            insurance_dict['previous_names'] = []
            
        if insurance_dict.get('services'):
            insurance_dict['services'] = [service.strip() for service in insurance_dict['services'].split(',') if service.strip()]
        else:
            insurance_dict['services'] = []
            
        if insurance_dict.get('coverage_areas'):
            insurance_dict['coverage_areas'] = [area.strip() for area in insurance_dict['coverage_areas'].split(',') if area.strip()]
        else:
            insurance_dict['coverage_areas'] = []
            
        if insurance_dict.get('specializes_in'):
            insurance_dict['specializes_in'] = [specialty.strip() for specialty in insurance_dict['specializes_in'].split(',') if specialty.strip()]
        else:
            insurance_dict['specializes_in'] = []
        
        # Create the insurance company
        insurance = Insurance(**insurance_dict)
        db.add(insurance)
        db.commit()
        db.refresh(insurance)
        
        return {"message": "Insurance company created successfully", "insurance_id": insurance.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating insurance company: {str(e)}")

@router.put("/{insurance_id}")
async def update_insurance(insurance_id: int, insurance_data: InsuranceUpdateRequest, db: Session = Depends(get_db)):
    """Update an existing insurance company"""
    try:
        insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
        if not insurance:
            raise HTTPException(status_code=404, detail="Insurance company not found")
        
        # Convert comma-separated strings to JSON arrays for storage
        update_data = insurance_data.dict(exclude_unset=True)
        
        # Convert string fields to JSON arrays
        if 'previous_names' in update_data and update_data['previous_names']:
            update_data['previous_names'] = [name.strip() for name in update_data['previous_names'].split(',') if name.strip()]
        elif 'previous_names' in update_data and not update_data['previous_names']:
            update_data['previous_names'] = []
            
        if 'services' in update_data and update_data['services']:
            update_data['services'] = [service.strip() for service in update_data['services'].split(',') if service.strip()]
        elif 'services' in update_data and not update_data['services']:
            update_data['services'] = []
            
        if 'coverage_areas' in update_data and update_data['coverage_areas']:
            update_data['coverage_areas'] = [area.strip() for area in update_data['coverage_areas'].split(',') if area.strip()]
        elif 'coverage_areas' in update_data and not update_data['coverage_areas']:
            update_data['coverage_areas'] = []
            
        if 'specializes_in' in update_data and update_data['specializes_in']:
            update_data['specializes_in'] = [specialty.strip() for specialty in update_data['specializes_in'].split(',') if specialty.strip()]
        elif 'specializes_in' in update_data and not update_data['specializes_in']:
            update_data['specializes_in'] = []
        
        # Update the insurance company
        for field, value in update_data.items():
            setattr(insurance, field, value)
        
        db.commit()
        db.refresh(insurance)
        
        return {"message": "Insurance company updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating insurance company: {str(e)}")

@router.delete("/{insurance_id}")
async def delete_insurance(insurance_id: int, db: Session = Depends(get_db)):
    """Delete an insurance company and all associated data"""
    try:
        insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
        if not insurance:
            raise HTTPException(status_code=404, detail="Insurance company not found")
        
        # Delete associated analytics and statistics
        db.query(InsuranceAnalytics).filter(InsuranceAnalytics.insurance_id == insurance_id).delete()
        db.query(InsuranceCaseStatistics).filter(InsuranceCaseStatistics.insurance_id == insurance_id).delete()
        
        # Delete the insurance company
        db.delete(insurance)
        db.commit()
        
        return {"message": "Insurance company deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting insurance: {str(e)}")
