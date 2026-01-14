"""
API routes for fetching all person relationships including:
- Bank directors, secretaries, auditors, shareholders, beneficial owners
- Marriage officers
- Change of name records
- Corrections of place/date of birth
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.people import People
from models.bank_directors import BankDirector
from models.bank_secretaries import BankSecretary
from models.bank_auditors import BankAuditor
from models.bank_shareholders import BankShareholder
from models.bank_beneficial_owners import BankBeneficialOwner
from models.marriage_officer import MarriageOfficer
from models.change_of_name import ChangeOfName
from models.correction_of_place_of_birth import CorrectionOfPlaceOfBirth
from models.correction_of_date_of_birth import CorrectionOfDateOfBirth
from models.banks import Banks
from typing import Dict, List, Any, Optional

router = APIRouter(prefix="/api/people", tags=["person-all-relationships"])


@router.get("/{person_id}/all-relationships")
async def get_all_person_relationships(
    person_id: int,
    db: Session = Depends(get_db)
):
    """Get all relationships for a person including banks, companies, name changes, etc."""
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    relationships = {
        "banks": {
            "directors": [],
            "secretaries": [],
            "auditors": [],
            "shareholders": [],
            "beneficial_owners": []
        },
        "marriage_officers": [],
        "change_of_name": [],
        "correction_of_place_of_birth": [],
        "correction_of_date_of_birth": []
    }
    
    # Fetch bank directors
    bank_directors = db.query(BankDirector).filter(BankDirector.person_id == person_id).all()
    for director in bank_directors:
        bank = db.query(Banks).filter(Banks.id == director.bank_id).first()
        relationships["banks"]["directors"].append({
            "id": director.id,
            "bank_id": director.bank_id,
            "bank_name": bank.name if bank else "Unknown Bank",
            "position": director.position,
            "appointment_date": director.appointment_date.isoformat() if director.appointment_date else None,
            "is_current": director.is_current,
            "full_name": director.full_name
        })
    
    # Fetch bank secretaries
    bank_secretaries = db.query(BankSecretary).filter(BankSecretary.person_id == person_id).all()
    for secretary in bank_secretaries:
        bank = db.query(Banks).filter(Banks.id == secretary.bank_id).first()
        relationships["banks"]["secretaries"].append({
            "id": secretary.id,
            "bank_id": secretary.bank_id,
            "bank_name": bank.name if bank else "Unknown Bank",
            "appointment_date": secretary.appointment_date.isoformat() if secretary.appointment_date else None,
            "is_current": secretary.is_current,
            "name": secretary.name
        })
    
    # Fetch bank auditors
    bank_auditors = db.query(BankAuditor).filter(BankAuditor.person_id == person_id).all()
    for auditor in bank_auditors:
        bank = db.query(Banks).filter(Banks.id == auditor.bank_id).first()
        relationships["banks"]["auditors"].append({
            "id": auditor.id,
            "bank_id": auditor.bank_id,
            "bank_name": bank.name if bank else "Unknown Bank",
            "appointment_date": auditor.appointment_date.isoformat() if auditor.appointment_date else None,
            "is_current": auditor.is_current,
            "name": auditor.name
        })
    
    # Fetch bank shareholders
    bank_shareholders = db.query(BankShareholder).filter(BankShareholder.person_id == person_id).all()
    for shareholder in bank_shareholders:
        bank = db.query(Banks).filter(Banks.id == shareholder.bank_id).first()
        relationships["banks"]["shareholders"].append({
            "id": shareholder.id,
            "bank_id": shareholder.bank_id,
            "bank_name": bank.name if bank else "Unknown Bank",
            "number_of_shares": float(shareholder.number_of_shares) if shareholder.number_of_shares else None,
            "acquisition_date": shareholder.acquisition_date.isoformat() if shareholder.acquisition_date else None,
            "is_current": shareholder.is_current,
            "name": shareholder.name
        })
    
    # Fetch bank beneficial owners
    bank_beneficial_owners = db.query(BankBeneficialOwner).filter(BankBeneficialOwner.person_id == person_id).all()
    for owner in bank_beneficial_owners:
        bank = db.query(Banks).filter(Banks.id == owner.bank_id).first()
        relationships["banks"]["beneficial_owners"].append({
            "id": owner.id,
            "bank_id": owner.bank_id,
            "bank_name": bank.name if bank else "Unknown Bank",
            "percentage_ownership": float(owner.percentage_ownership) if owner.percentage_ownership else None,
            "identification_date": owner.identification_date.isoformat() if owner.identification_date else None,
            "full_name": owner.full_name
        })
    
    # Fetch marriage officers
    marriage_officers = db.query(MarriageOfficer).filter(MarriageOfficer.person_id == person_id).all()
    for officer in marriage_officers:
        relationships["marriage_officers"].append({
            "id": officer.id,
            "officer_name": officer.officer_name,
            "church": officer.church,
            "location": officer.location,
            "region": officer.region,
            "appointment_date": officer.appointment_date.isoformat() if officer.appointment_date else None,
            "gazette_number": officer.gazette_number,
            "gazette_date": officer.gazette_date.isoformat() if officer.gazette_date else None
        })
    
    # Fetch change of name records
    change_of_name_records = db.query(ChangeOfName).filter(ChangeOfName.person_id == person_id).all()
    for record in change_of_name_records:
        relationships["change_of_name"].append({
            "id": record.id,
            "old_name": record.old_name,
            "new_name": record.new_name,
            "alias_name": record.alias_name,
            "effective_date": record.effective_date.isoformat() if record.effective_date else None,
            "gazette_number": record.gazette_number,
            "gazette_date": record.gazette_date.isoformat() if record.gazette_date else None,
            "source": record.source
        })
    
    # Fetch correction of place of birth records
    correction_pob_records = db.query(CorrectionOfPlaceOfBirth).filter(CorrectionOfPlaceOfBirth.person_id == person_id).all()
    for record in correction_pob_records:
        relationships["correction_of_place_of_birth"].append({
            "id": record.id,
            "person_name": record.person_name,
            "old_place_of_birth": record.old_place_of_birth,
            "new_place_of_birth": record.new_place_of_birth,
            "effective_date": record.effective_date.isoformat() if record.effective_date else None,
            "gazette_number": record.gazette_number,
            "gazette_date": record.gazette_date.isoformat() if record.gazette_date else None
        })
    
    # Fetch correction of date of birth records
    correction_dob_records = db.query(CorrectionOfDateOfBirth).filter(CorrectionOfDateOfBirth.person_id == person_id).all()
    for record in correction_dob_records:
        relationships["correction_of_date_of_birth"].append({
            "id": record.id,
            "person_name": record.person_name,
            "old_date_of_birth": record.old_date_of_birth.isoformat() if record.old_date_of_birth else None,
            "new_date_of_birth": record.new_date_of_birth.isoformat() if record.new_date_of_birth else None,
            "effective_date": record.effective_date.isoformat() if record.effective_date else None,
            "gazette_number": record.gazette_number,
            "gazette_date": record.gazette_date.isoformat() if record.gazette_date else None
        })
    
    return relationships
