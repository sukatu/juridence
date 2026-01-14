from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.banks import Banks
from models.bank_analytics import BankAnalytics
from models.bank_case_statistics import BankCaseStatistics
from models.bank_directors import BankDirector
from models.bank_secretaries import BankSecretary
from models.bank_auditors import BankAuditor
from models.bank_shareholders import BankShareholder
from models.bank_beneficial_owners import BankBeneficialOwner
from models.bank_contact_details import BankContactDetails
from models.bank_phone_numbers import BankPhoneNumber
from models.bank_rulings_judgements import BankRulingsJudgements
from models.reported_cases import ReportedCases
from schemas.admin import BankCreateRequest, BankUpdateRequest
from typing import List, Optional
import math
import json

router = APIRouter()

@router.get("/stats")
async def get_banks_stats(db: Session = Depends(get_db)):
    """Get comprehensive bank statistics for admin dashboard"""
    try:
        # Basic counts
        total_banks = db.query(Banks).count()
        
        # Financial analysis
        total_assets = db.query(Banks.total_assets).filter(Banks.total_assets.isnot(None)).all()
        total_assets = sum([assets[0] for assets in total_assets]) if total_assets else 0
        
        total_branches = db.query(Banks.branches_count).filter(Banks.branches_count.isnot(None)).all()
        total_branches = sum([branches[0] for branches in total_branches]) if total_branches else 0
        
        # Average rating
        avg_rating = db.query(Banks.rating).filter(Banks.rating.isnot(None)).all()
        avg_rating = sum([rating[0] for rating in avg_rating]) / len(avg_rating) if avg_rating else 0
        
        # Active banks
        active_banks = db.query(Banks).filter(Banks.is_active == True).count()
        
        return {
            "total_banks": total_banks,
            "total_assets": total_assets,
            "total_branches": total_branches,
            "avg_rating": avg_rating,
            "active_banks": active_banks,
            "last_updated": db.query(Banks.updated_at).order_by(Banks.updated_at.desc()).first()[0].isoformat() if db.query(Banks.updated_at).first() else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching banks stats: {str(e)}")

@router.get("/")
async def get_banks(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    bank_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of banks with optional filtering"""
    try:
        query = db.query(Banks)
        
        # Apply search filter
        if search:
            query = query.filter(
                Banks.name.ilike(f"%{search}%") |
                Banks.short_name.ilike(f"%{search}%") |
                Banks.email.ilike(f"%{search}%")
            )
        
        # Apply bank type filter
        if bank_type:
            query = query.filter(Banks.bank_type == bank_type)
        
        # Get total count
        total = query.count()
        
        # Apply sorting - ensure Bank of Ghana (BOG) appears first
        # Sort by bank_code first (BOG has '000'), then by name
        from sqlalchemy import func
        query = query.order_by(
            func.coalesce(Banks.bank_code, 'ZZZ').asc(),  # '000' will sort before other codes
            Banks.name.asc()
        )
        
        # Apply pagination
        offset = (page - 1) * limit
        banks = query.offset(offset).limit(limit).all()
        
        # Convert JSON arrays to strings for API response
        formatted_banks = []
        for bank in banks:
            bank_dict = bank.__dict__.copy()
            
            # Convert JSON arrays to comma-separated strings
            if bank_dict.get('previous_names') and isinstance(bank_dict['previous_names'], list):
                bank_dict['previous_names'] = ', '.join(bank_dict['previous_names']) if bank_dict['previous_names'] else ''
            elif bank_dict.get('previous_names') is None or bank_dict.get('previous_names') == []:
                bank_dict['previous_names'] = ''
                
            if bank_dict.get('services'):
                if isinstance(bank_dict['services'], list):
                    bank_dict['services'] = ', '.join(bank_dict['services']) if bank_dict['services'] else ''
                elif isinstance(bank_dict['services'], str) and bank_dict['services'].startswith('['):
                    # Handle JSON string format
                    import json
                    try:
                        services_list = json.loads(bank_dict['services'])
                        bank_dict['services'] = ', '.join(services_list) if services_list else ''
                    except:
                        bank_dict['services'] = bank_dict['services']  # Keep as is if parsing fails
            elif bank_dict.get('services') is None or bank_dict.get('services') == []:
                bank_dict['services'] = ''
            
            # Remove SQLAlchemy internal attributes
            bank_dict.pop('_sa_instance_state', None)
            formatted_banks.append(bank_dict)
        
        # Calculate total pages
        total_pages = math.ceil(total / limit)
        
        return {
            "banks": formatted_banks,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching banks: {str(e)}")

@router.get("/{bank_id}")
async def get_bank(bank_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific bank"""
    try:
        bank = db.query(Banks).filter(Banks.id == bank_id).first()
        if not bank:
            raise HTTPException(status_code=404, detail="Bank not found")
        
        # Get analytics if available
        analytics = db.query(BankAnalytics).filter(BankAnalytics.bank_id == bank_id).first()
        case_stats = db.query(BankCaseStatistics).filter(BankCaseStatistics.bank_id == bank_id).first()
        
        # Get related data
        directors = db.query(BankDirector).filter(BankDirector.bank_id == bank_id).all()
        secretaries = db.query(BankSecretary).filter(BankSecretary.bank_id == bank_id).all()
        auditors = db.query(BankAuditor).filter(BankAuditor.bank_id == bank_id).all()
        shareholders = db.query(BankShareholder).filter(BankShareholder.bank_id == bank_id).all()
        beneficial_owners = db.query(BankBeneficialOwner).filter(BankBeneficialOwner.bank_id == bank_id).all()
        contact_details = db.query(BankContactDetails).filter(BankContactDetails.bank_id == bank_id).first()
        phone_numbers = db.query(BankPhoneNumber).filter(BankPhoneNumber.bank_id == bank_id).all()
        
        # Get rulings/judgements (cases linked to bank)
        rulings_judgements_links = db.query(BankRulingsJudgements).filter(BankRulingsJudgements.bank_id == bank_id).all()
        case_ids = [link.case_id for link in rulings_judgements_links]
        related_cases = db.query(ReportedCases).filter(ReportedCases.id.in_(case_ids)).all() if case_ids else []
        
        # Convert bank data for API response
        bank_dict = bank.__dict__.copy()
        
        # Keep directors as array for detailed view (don't convert to string)
        print(f"\n[GET] Fetching bank {bank_id}")
        if bank_dict.get('directors'):
            if isinstance(bank_dict['directors'], str):
                try:
                    parsed = json.loads(bank_dict['directors'])
                    bank_dict['directors'] = parsed if isinstance(parsed, list) else []
                    print(f"[GET] Parsed directors from JSON string: {len(bank_dict['directors'])} items")
                except Exception as e:
                    print(f"[GET] Error parsing directors JSON: {e}, raw value: {bank_dict['directors'][:100]}")
                    bank_dict['directors'] = []
            elif isinstance(bank_dict['directors'], list):
                print(f"[GET] Directors already a list: {len(bank_dict['directors'])} items")
            else:
                print(f"[GET] Directors is not a list or string, converting to empty list. Type: {type(bank_dict['directors'])}")
                bank_dict['directors'] = []
        else:
            print(f"[GET] No directors field in bank data")
            bank_dict['directors'] = []
            
        # Keep board_of_directors as array for detailed view
        if bank_dict.get('board_of_directors'):
            if isinstance(bank_dict['board_of_directors'], str):
                try:
                    parsed = json.loads(bank_dict['board_of_directors'])
                    bank_dict['board_of_directors'] = parsed if isinstance(parsed, list) else []
                    print(f"[GET] Parsed board_of_directors from JSON string: {len(bank_dict['board_of_directors'])} items")
                except Exception as e:
                    print(f"[GET] Error parsing board_of_directors JSON: {e}, raw value: {bank_dict['board_of_directors'][:100]}")
                    bank_dict['board_of_directors'] = []
            elif isinstance(bank_dict['board_of_directors'], list):
                print(f"[GET] Board_of_directors already a list: {len(bank_dict['board_of_directors'])} items")
            else:
                print(f"[GET] Board_of_directors is not a list or string, converting to empty list. Type: {type(bank_dict['board_of_directors'])}")
                bank_dict['board_of_directors'] = []
        else:
            print(f"[GET] No board_of_directors field in bank data")
            bank_dict['board_of_directors'] = []
            
        # Log final directors count
        directors_count = len(bank_dict.get('directors', []))
        board_count = len(bank_dict.get('board_of_directors', []))
        print(f"[GET] Final directors count: {directors_count}, board_of_directors count: {board_count}")
            
        # Keep secretary as object for detailed view
        if bank_dict.get('secretary'):
            if isinstance(bank_dict['secretary'], str):
                try:
                    bank_dict['secretary'] = json.loads(bank_dict['secretary'])
                except:
                    bank_dict['secretary'] = {}
            elif not isinstance(bank_dict['secretary'], dict):
                bank_dict['secretary'] = {}
        else:
            bank_dict['secretary'] = {}
            
        # Keep key_personnel as array for detailed view
        if bank_dict.get('key_personnel'):
            if isinstance(bank_dict['key_personnel'], str):
                try:
                    bank_dict['key_personnel'] = json.loads(bank_dict['key_personnel'])
                except:
                    bank_dict['key_personnel'] = []
            elif not isinstance(bank_dict['key_personnel'], list):
                bank_dict['key_personnel'] = []
        else:
            bank_dict['key_personnel'] = []
        
        # Convert JSON arrays to comma-separated strings for other fields
        if bank_dict.get('previous_names') and isinstance(bank_dict['previous_names'], list):
            bank_dict['previous_names'] = ', '.join(bank_dict['previous_names']) if bank_dict['previous_names'] else ''
        elif bank_dict.get('previous_names') is None or bank_dict.get('previous_names') == []:
            bank_dict['previous_names'] = ''
            
        if bank_dict.get('services'):
            if isinstance(bank_dict['services'], list):
                bank_dict['services'] = ', '.join(bank_dict['services']) if bank_dict['services'] else ''
            elif isinstance(bank_dict['services'], str) and bank_dict['services'].startswith('['):
                # Handle JSON string format
                try:
                    services_list = json.loads(bank_dict['services'])
                    bank_dict['services'] = ', '.join(services_list) if services_list else ''
                except:
                    bank_dict['services'] = bank_dict['services']  # Keep as is if parsing fails
        elif bank_dict.get('services') is None or bank_dict.get('services') == []:
            bank_dict['services'] = ''
        
        # Remove SQLAlchemy internal attributes
        bank_dict.pop('_sa_instance_state', None)
        
        # Convert related data to dictionaries
        directors_list = [{
            'id': d.id,
            'full_name': d.full_name,
            'first_name': d.first_name,
            'last_name': d.last_name,
            'middle_name': d.middle_name,
            'title': d.title,
            'position': d.position,
            'appointment_date': d.appointment_date.isoformat() if d.appointment_date else None,
            'resignation_date': d.resignation_date.isoformat() if d.resignation_date else None,
            'is_current': d.is_current,
            'phone': d.phone,
            'email': d.email,
            'address': d.address,
            'city': d.city,
            'region': d.region,
            'nationality': d.nationality,
            'date_of_birth': d.date_of_birth.isoformat() if d.date_of_birth else None,
            'id_number': d.id_number,
            'occupation': d.occupation
        } for d in directors]
        
        secretaries_list = [{
            'id': s.id,
            'name': s.name,
            'is_individual': s.is_individual,
            'first_name': s.first_name,
            'last_name': s.last_name,
            'appointment_date': s.appointment_date.isoformat() if s.appointment_date else None,
            'resignation_date': s.resignation_date.isoformat() if s.resignation_date else None,
            'is_current': s.is_current,
            'phone': s.phone,
            'email': s.email,
            'address': s.address,
            'city': s.city,
            'region': s.region,
            'company_registration_number': s.company_registration_number
        } for s in secretaries]
        
        auditors_list = [{
            'id': a.id,
            'name': a.name,
            'is_individual': a.is_individual,
            'appointment_date': a.appointment_date.isoformat() if a.appointment_date else None,
            'resignation_date': a.resignation_date.isoformat() if a.resignation_date else None,
            'is_current': a.is_current,
            'phone': a.phone,
            'email': a.email,
            'address': a.address,
            'city': a.city,
            'region': a.region,
            'professional_qualification': a.professional_qualification,
            'firm_registration_number': a.firm_registration_number,
            'firm_type': a.firm_type
        } for a in auditors]
        
        shareholders_list = [{
            'id': sh.id,
            'name': sh.name,
            'is_individual': sh.is_individual,
            'number_of_shares': sh.number_of_shares,
            'percentage_holding': float(sh.percentage_holding) if sh.percentage_holding else None,
            'share_value': float(sh.share_value) if sh.share_value else None,
            'share_class': sh.share_class,
            'acquisition_date': sh.acquisition_date.isoformat() if sh.acquisition_date else None,
            'is_current': sh.is_current,
            'phone': sh.phone,
            'email': sh.email,
            'address': sh.address,
            'company_registration_number': sh.company_registration_number
        } for sh in shareholders]
        
        beneficial_owners_list = [{
            'id': bo.id,
            'full_name': bo.full_name,
            'percentage_ownership': float(bo.percentage_ownership) if bo.percentage_ownership else None,
            'ownership_type': bo.ownership_type,
            'number_of_shares': bo.number_of_shares,
            'identification_date': bo.identification_date.isoformat() if bo.identification_date else None,
            'risk_level': bo.risk_level,
            'is_pep': bo.is_pep,
            'nationality': bo.nationality,
            'date_of_birth': bo.date_of_birth.isoformat() if bo.date_of_birth else None
        } for bo in beneficial_owners]
        
        rulings_judgements_list = [{
            'id': rj.id,
            'case_id': rj.case_id,
            'matched_bank_name': rj.matched_bank_name,
            'match_confidence': rj.match_confidence,
            'case': {
                'id': case.id,
                'title': case.title,
                'suit_reference_number': case.suit_reference_number,
                'date': case.date.isoformat() if case.date else None,
                'court_type': case.court_type,
                'area_of_law': case.area_of_law,
                'protagonist': case.protagonist,
                'antagonist': case.antagonist,
                'presiding_judge': case.presiding_judge,
                'status': case.status
            } if case else None
        } for rj, case in zip(rulings_judgements_links, related_cases)]
        
        # Convert analytics and case_stats to dicts if they exist
        analytics_dict = None
        if analytics:
            analytics_dict = analytics.__dict__.copy()
            analytics_dict.pop('_sa_instance_state', None)
        
        case_stats_dict = None
        if case_stats:
            case_stats_dict = case_stats.__dict__.copy()
            case_stats_dict.pop('_sa_instance_state', None)
        
        # Convert contact details to dictionary
        contact_details_dict = None
        if contact_details:
            contact_details_dict = {
                'id': contact_details.id,
                'bank_id': contact_details.bank_id,
                'phone': contact_details.phone,
                'email': contact_details.email,
                'website': contact_details.website,
                'fax': contact_details.fax,
                'ghana_digital_address': contact_details.ghana_digital_address,
                'house_building_flat_number': contact_details.house_building_flat_number,
                'street_name_landmark': contact_details.street_name_landmark,
                'city': contact_details.city,
                'region': contact_details.region,
                'district': contact_details.district,
                'country': contact_details.country,
                'postal_address_type': contact_details.postal_address_type,
                'postal_address': contact_details.postal_address,
                'postal_code': contact_details.postal_code,
                'latitude': contact_details.latitude,
                'longitude': contact_details.longitude,
                'customer_service_phone': contact_details.customer_service_phone,
                'customer_service_email': contact_details.customer_service_email,
                'head_office_address': contact_details.head_office_address,
                'created_at': contact_details.created_at.isoformat() if contact_details.created_at else None,
                'updated_at': contact_details.updated_at.isoformat() if contact_details.updated_at else None,
                'is_active': contact_details.is_active
            }
        
        phone_numbers_list = [{
            'id': pn.id,
            'phone_number': pn.phone_number,
            'phone_type': pn.phone_type,
            'label': pn.label,
            'is_active': pn.is_active
        } for pn in phone_numbers]
        
        return {
            "bank": bank_dict,
            "analytics": analytics_dict,
            "case_statistics": case_stats_dict,
            "directors": directors_list,
            "secretaries": secretaries_list,
            "auditors": auditors_list,
            "shareholders": shareholders_list,
            "beneficial_owners": beneficial_owners_list,
            "contact_details": contact_details_dict,
            "phone_numbers": phone_numbers_list,
            "rulings_judgements": rulings_judgements_list,
            "related_cases": [{
                'id': case.id,
                'title': case.title,
                'suit_reference_number': case.suit_reference_number,
                'date': case.date.isoformat() if case.date else None,
                'court_type': case.court_type,
                'area_of_law': case.area_of_law,
                'protagonist': case.protagonist,
                'antagonist': case.antagonist,
                'presiding_judge': case.presiding_judge,
                'status': case.status
            } for case in related_cases]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bank: {str(e)}")

@router.post("/")
async def create_bank(bank_data: BankCreateRequest, db: Session = Depends(get_db)):
    """Create a new bank"""
    try:
        # Convert comma-separated strings to JSON arrays for storage
        bank_dict = bank_data.dict()
        
        # Convert string fields to JSON arrays
        if bank_dict.get('previous_names'):
            bank_dict['previous_names'] = [name.strip() for name in bank_dict['previous_names'].split(',') if name.strip()]
        else:
            bank_dict['previous_names'] = []
            
        if bank_dict.get('services'):
            bank_dict['services'] = [service.strip() for service in bank_dict['services'].split(',') if service.strip()]
        else:
            bank_dict['services'] = []
        
        # Create the bank
        bank = Banks(**bank_dict)
        db.add(bank)
        db.commit()
        db.refresh(bank)
        
        return {"message": "Bank created successfully", "bank_id": bank.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating bank: {str(e)}")

@router.put("/{bank_id}")
async def update_bank(bank_id: int, bank_data: BankUpdateRequest, db: Session = Depends(get_db)):
    """Update an existing bank"""
    try:
        bank = db.query(Banks).filter(Banks.id == bank_id).first()
        if not bank:
            raise HTTPException(status_code=404, detail="Bank not found")
        
        # Convert comma-separated strings to JSON arrays for storage
        update_data = bank_data.dict(exclude_unset=True)
        
        # Convert string fields to JSON arrays
        if 'previous_names' in update_data and update_data['previous_names']:
            update_data['previous_names'] = [name.strip() for name in update_data['previous_names'].split(',') if name.strip()]
        elif 'previous_names' in update_data and not update_data['previous_names']:
            update_data['previous_names'] = []
            
        if 'services' in update_data and update_data['services']:
            update_data['services'] = [service.strip() for service in update_data['services'].split(',') if service.strip()]
        elif 'services' in update_data and not update_data['services']:
            update_data['services'] = []
        
        # Handle directors (same logic as companies)
        if 'directors' in update_data and update_data['directors']:
            if isinstance(update_data['directors'], str):
                try:
                    parsed = json.loads(update_data['directors'])
                    if isinstance(parsed, list):
                        update_data['directors'] = parsed
                    else:
                        director_names = [name.strip() for name in update_data['directors'].split(',') if name.strip()]
                        update_data['directors'] = [{'name': name, 'id_number': f'P{str(i).zfill(9)}'} for i, name in enumerate(director_names, 1)]
                except (json.JSONDecodeError, TypeError):
                    director_names = [name.strip() for name in update_data['directors'].split(',') if name.strip()]
                    update_data['directors'] = [{'name': name, 'id_number': f'P{str(i).zfill(9)}'} for i, name in enumerate(director_names, 1)]
            elif isinstance(update_data['directors'], list):
                pass
            else:
                update_data['directors'] = []
        elif 'directors' in update_data and not update_data['directors']:
            update_data['directors'] = []
            
        if 'board_of_directors' in update_data and update_data['board_of_directors']:
            if isinstance(update_data['board_of_directors'], str):
                try:
                    parsed = json.loads(update_data['board_of_directors'])
                    if isinstance(parsed, list):
                        update_data['board_of_directors'] = parsed
                    else:
                        update_data['board_of_directors'] = []
                except (json.JSONDecodeError, TypeError):
                    update_data['board_of_directors'] = []
            elif isinstance(update_data['board_of_directors'], list):
                pass
            else:
                update_data['board_of_directors'] = []
        elif 'board_of_directors' in update_data and not update_data['board_of_directors']:
            update_data['board_of_directors'] = []
            
        if 'secretary' in update_data and update_data['secretary']:
            if isinstance(update_data['secretary'], str):
                try:
                    parsed = json.loads(update_data['secretary'])
                    if isinstance(parsed, dict):
                        update_data['secretary'] = parsed
                    else:
                        update_data['secretary'] = {'name': update_data['secretary'], 'id_number': f'P{str(1).zfill(9)}'}
                except (json.JSONDecodeError, TypeError):
                    update_data['secretary'] = {'name': update_data['secretary'], 'id_number': f'P{str(1).zfill(9)}'}
            elif isinstance(update_data['secretary'], dict):
                pass
            else:
                update_data['secretary'] = {}
        elif 'secretary' in update_data and not update_data['secretary']:
            update_data['secretary'] = {}
            
        if 'key_personnel' in update_data and update_data['key_personnel']:
            if isinstance(update_data['key_personnel'], str):
                try:
                    parsed = json.loads(update_data['key_personnel'])
                    if isinstance(parsed, list):
                        update_data['key_personnel'] = parsed
                    else:
                        update_data['key_personnel'] = []
                except (json.JSONDecodeError, TypeError):
                    update_data['key_personnel'] = []
            elif isinstance(update_data['key_personnel'], list):
                pass
            else:
                update_data['key_personnel'] = []
        elif 'key_personnel' in update_data and not update_data['key_personnel']:
            update_data['key_personnel'] = []
        
        # Update the bank
        print(f"\n[UPDATE] Updating bank {bank_id}")
        for field, value in update_data.items():
            setattr(bank, field, value)
            if field in ['directors', 'board_of_directors', 'secretary', 'key_personnel']:
                print(f"[UPDATE] Setting bank {field} = {type(value).__name__} (length: {len(value) if isinstance(value, (list, dict)) else 'N/A'})")
            else:
                print(f"[UPDATE] Setting bank {field} = {value} (type: {type(value).__name__})")
        
        db.commit()
        db.refresh(bank)
        
        # Log the updated values to verify they were saved
        print(f"[UPDATE] Bank {bank_id} updated successfully")
        if 'directors' in update_data:
            directors_value = bank.directors
            if isinstance(directors_value, list):
                print(f"[UPDATE] Directors after update: {len(directors_value)} items")
                for idx, dir in enumerate(directors_value[:3]):  # Show first 3
                    print(f"  [{idx}] {dir.get('name', 'No name') if isinstance(dir, dict) else dir}")
            else:
                print(f"[UPDATE] Directors after update: {type(directors_value).__name__} = {directors_value}")
        if 'board_of_directors' in update_data:
            board_value = bank.board_of_directors
            if isinstance(board_value, list):
                print(f"[UPDATE] Board of directors after update: {len(board_value)} items")
            else:
                print(f"[UPDATE] Board of directors after update: {type(board_value).__name__}")
        
        return {"message": "Bank updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating bank: {str(e)}")

@router.get("/{bank_id}/rulings")
async def get_bank_rulings(
    bank_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    court_type: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    area_of_law: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated bank rulings/judgements with search and filters"""
    try:
        # Check if bank exists
        bank = db.query(Banks).filter(Banks.id == bank_id).first()
        if not bank:
            raise HTTPException(status_code=404, detail="Bank not found")
        
        # Get rulings/judgements links
        query = db.query(BankRulingsJudgements, ReportedCases).join(
            ReportedCases, BankRulingsJudgements.case_id == ReportedCases.id
        ).filter(BankRulingsJudgements.bank_id == bank_id)
        
        # Apply search filter
        if search:
            search_filter = (
                ReportedCases.title.ilike(f"%{search}%") |
                ReportedCases.suit_reference_number.ilike(f"%{search}%") |
                ReportedCases.protagonist.ilike(f"%{search}%") |
                ReportedCases.antagonist.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Apply filters
        if court_type:
            query = query.filter(ReportedCases.court_type == court_type)
        if status:
            query = query.filter(ReportedCases.status == status)
        if area_of_law:
            query = query.filter(ReportedCases.area_of_law.ilike(f"%{area_of_law}%"))
        if year:
            query = query.filter(extract('year', ReportedCases.date) == year)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering (newest first)
        offset = (page - 1) * limit
        results = query.order_by(ReportedCases.date.desc() if ReportedCases.date else ReportedCases.id.desc()).offset(offset).limit(limit).all()
        
        # Format results
        rulings_list = []
        for ruling_link, case in results:
            rulings_list.append({
                'id': ruling_link.id,
                'case_id': ruling_link.case_id,
                'matched_bank_name': ruling_link.matched_bank_name,
                'match_confidence': ruling_link.match_confidence,
                'match_method': ruling_link.match_method,
                'case': {
                    'id': case.id,
                    'title': case.title,
                    'suit_reference_number': case.suit_reference_number,
                    'date': case.date.isoformat() if case.date else None,
                    'court_type': case.court_type,
                    'area_of_law': case.area_of_law,
                    'protagonist': case.protagonist,
                    'antagonist': case.antagonist,
                    'presiding_judge': case.presiding_judge,
                    'status': case.status
                }
            })
        
        # Calculate total pages
        total_pages = math.ceil(total / limit) if total > 0 else 0
        
        return {
            "rulings": rulings_list,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bank rulings: {str(e)}")

@router.delete("/{bank_id}")
async def delete_bank(bank_id: int, db: Session = Depends(get_db)):
    """Delete a bank and all associated data"""
    try:
        bank = db.query(Banks).filter(Banks.id == bank_id).first()
        if not bank:
            raise HTTPException(status_code=404, detail="Bank not found")
        
        # Delete associated analytics and statistics
        db.query(BankAnalytics).filter(BankAnalytics.bank_id == bank_id).delete()
        db.query(BankCaseStatistics).filter(BankCaseStatistics.bank_id == bank_id).delete()
        
        # Delete the bank
        db.delete(bank)
        db.commit()
        
        return {"message": "Bank deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting bank: {str(e)}")
