from sqlalchemy.orm import Session
from models.reported_cases import ReportedCases
from models.people import People
from models.banks import Banks
from models.insurance import Insurance
from models.companies import Companies
from models.case_metadata import CaseMetadata, CaseSearchIndex
from services.ai_service import AIService
from typing import Dict, Any, List
import json
from datetime import datetime

class CaseMetadataService:
    
    @staticmethod
    def process_case_metadata(case_id: int, db: Session) -> Dict[str, Any]:
        """
        Process case metadata and create related records
        """
        try:
            # Get the case
            case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
            if not case:
                return {"error": "Case not found"}
            
            # Convert case to dict for AI processing
            case_data = {
                'id': case.id,
                'title': case.title,
                'suit_reference_number': case.suit_reference_number,
                'protagonist': case.protagonist,
                'antagonist': case.antagonist,
                'lawyers': case.lawyers,
                'presiding_judge': case.presiding_judge,
                'judgement_by': case.judgement_by,
                'opinion_by': case.opinion_by,
                'case_summary': case.case_summary,
                'commentary': case.commentary,
                'headnotes': case.headnotes,
                'court_type': case.court_type,
                'region': case.region,
                'year': case.year,
                'area_of_law': case.area_of_law,
                'keywords_phrases': case.keywords_phrases,
                'judgement': case.judgement
            }
            
            # Generate AI summaries
            ai_data = AIService.generate_case_summary(case_data, db)
            
            # Extract entities
            entities = AIService.extract_entities_from_case(case_data, db)
            
            # Generate keywords
            keywords = AIService.generate_legal_keywords(case_data, db)
            
            # Update case with AI data
            case.ai_case_outcome = ai_data.get('ai_case_outcome', '')
            case.ai_court_orders = ai_data.get('ai_court_orders', '')
            case.ai_financial_impact = ai_data.get('ai_financial_impact', '')
            case.ai_detailed_outcome = ai_data.get('ai_detailed_outcome', '')
            case.ai_summary_generated_at = datetime.now()
            case.ai_summary_version = "1.0"
            case.keywords_phrases = keywords
            
            # Create or update case metadata
            case_metadata = db.query(CaseMetadata).filter(CaseMetadata.case_id == case_id).first()
            
            if not case_metadata:
                case_metadata = CaseMetadata(
                    case_id=case_id,
                    case_summary=case_data.get('case_summary', ''),
                    area_of_law=case_data.get('area_of_law', ''),
                    keywords=keywords.split(', ') if keywords else [],
                    related_people=entities.get('people', []),
                    organizations=entities.get('companies', []),
                    banks_involved=entities.get('banks', []),
                    insurance_involved=entities.get('insurance', []),
                    protagonist=case_data.get('protagonist', ''),
                    antagonist=case_data.get('antagonist', ''),
                    judges=[case_data.get('presiding_judge', '')] if case_data.get('presiding_judge') else [],
                    lawyers=[case_data.get('lawyers', '')] if case_data.get('lawyers') else [],
                    court_type=case_data.get('court_type', ''),
                    is_processed=True,
                    processed_at=datetime.now()
                )
                db.add(case_metadata)
            else:
                # Update existing metadata
                case_metadata.case_summary = case_data.get('case_summary', '')
                case_metadata.area_of_law = case_data.get('area_of_law', '')
                case_metadata.keywords = keywords.split(', ') if keywords else []
                case_metadata.related_people = entities.get('people', [])
                case_metadata.organizations = entities.get('companies', [])
                case_metadata.banks_involved = entities.get('banks', [])
                case_metadata.insurance_involved = entities.get('insurance', [])
                case_metadata.protagonist = case_data.get('protagonist', '')
                case_metadata.antagonist = case_data.get('antagonist', '')
                case_metadata.judges = [case_data.get('presiding_judge', '')] if case_data.get('presiding_judge') else []
                case_metadata.lawyers = [case_data.get('lawyers', '')] if case_data.get('lawyers') else []
                case_metadata.court_type = case_data.get('court_type', '')
                case_metadata.is_processed = True
                case_metadata.processed_at = datetime.now()
                case_metadata.updated_at = datetime.now()
            
            # Create or update search index
            search_index = db.query(CaseSearchIndex).filter(CaseSearchIndex.case_id == case_id).first()
            
            if not search_index:
                # Create searchable text
                searchable_text = f"{case_data.get('title', '')} {case_data.get('case_summary', '')} {case_data.get('protagonist', '')} {case_data.get('antagonist', '')} {case_data.get('lawyers', '')} {case_data.get('presiding_judge', '')}"
                
                search_index = CaseSearchIndex(
                    case_id=case_id,
                    searchable_text=searchable_text,
                    person_names=entities.get('people', []),
                    organization_names=entities.get('companies', []) + entities.get('banks', []) + entities.get('insurance', []),
                    keywords=keywords.split(', ') if keywords else [],
                    word_count=len(searchable_text.split()),
                    last_indexed=datetime.now()
                )
                db.add(search_index)
            else:
                # Update existing search index
                searchable_text = f"{case_data.get('title', '')} {case_data.get('case_summary', '')} {case_data.get('protagonist', '')} {case_data.get('antagonist', '')} {case_data.get('lawyers', '')} {case_data.get('presiding_judge', '')}"
                
                search_index.searchable_text = searchable_text
                search_index.person_names = entities.get('people', [])
                search_index.organization_names = entities.get('companies', []) + entities.get('banks', []) + entities.get('insurance', [])
                search_index.keywords = keywords.split(', ') if keywords else []
                search_index.word_count = len(searchable_text.split())
                search_index.last_indexed = datetime.now()
            
            # Commit all changes
            db.commit()
            
            return {
                "success": True,
                "case_id": case_id,
                "ai_summary_generated": True,
                "metadata_created": True,
                "search_index_created": True,
                "people_found": len(entities.get('people', [])),
                "companies_found": len(entities.get('companies', [])),
                "banks_found": len(entities.get('banks', [])),
                "insurance_found": len(entities.get('insurance', [])),
                "keywords_generated": keywords
            }
            
        except Exception as e:
            db.rollback()
            return {"error": f"Error processing case metadata: {str(e)}"}
    
    
    @staticmethod
    def reprocess_all_cases(db: Session) -> Dict[str, Any]:
        """
        Reprocess all cases to generate metadata
        """
        try:
            cases = db.query(ReportedCases).all()
            processed_count = 0
            errors = []
            
            for case in cases:
                try:
                    result = CaseMetadataService.process_case_metadata(case.id, db)
                    if result.get("success"):
                        processed_count += 1
                    else:
                        errors.append(f"Case {case.id}: {result.get('error', 'Unknown error')}")
                except Exception as e:
                    errors.append(f"Case {case.id}: {str(e)}")
            
            return {
                "success": True,
                "total_cases": len(cases),
                "processed_count": processed_count,
                "errors": errors
            }
            
        except Exception as e:
            return {"error": f"Error reprocessing cases: {str(e)}"}
