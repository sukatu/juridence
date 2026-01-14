from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Dict, Optional, Tuple
import re
from datetime import datetime

from models.reported_cases import ReportedCases
from models.legal_history import LegalHistory, CaseMention, LegalSearchIndex
from models.people import People
from models.banks import Banks
from models.insurance import Insurance

class LegalHistoryService:
    def __init__(self, db: Session):
        self.db = db

    def search_entity_in_cases(self, entity_name: str, entity_type: str, entity_id: int) -> Dict:
        """Search for entity mentions in all reported cases"""
        
        # Clean and prepare search terms
        search_terms = self._prepare_search_terms(entity_name)
        
        # Search in case titles
        title_matches = self._search_in_titles(search_terms)
        
        # Search in antagonist/protagonist fields
        party_matches = self._search_in_parties(search_terms)
        
        # Search in case content (judgement, decision, etc.)
        content_matches = self._search_in_content(search_terms)
        
        # Combine and deduplicate results
        all_cases = self._combine_search_results(title_matches, party_matches, content_matches)
        
        # Create legal history entries
        legal_history_entries = []
        case_mentions = []
        
        for case in all_cases:
            # Create legal history entry
            legal_history = LegalHistory(
                entity_type=entity_type,
                entity_id=entity_id,
                entity_name=entity_name,
                case_id=case.id,
                mention_type=self._determine_mention_type(case, search_terms),
                mention_context=self._extract_context(case, search_terms),
                mention_count=self._count_mentions(case, search_terms),
                relevance_score=self._calculate_relevance_score(case, search_terms)
            )
            legal_history_entries.append(legal_history)
            
            # Create case mention entry
            case_mention = CaseMention(
                case_id=case.id,
                entity_type=entity_type,
                entity_id=entity_id,
                entity_name=entity_name,
                mention_in_title=self._is_mentioned_in_title(case, search_terms),
                mention_in_antagonist=self._is_mentioned_in_antagonist(case, search_terms),
                mention_in_protagonist=self._is_mentioned_in_protagonist(case, search_terms),
                mention_in_content=self._is_mentioned_in_content(case, search_terms),
                mention_in_judgement=self._is_mentioned_in_judgement(case, search_terms),
                mention_in_decision=self._is_mentioned_in_decision(case, search_terms),
                total_mentions=self._count_mentions(case, search_terms)
            )
            case_mentions.append(case_mention)
        
        return {
            'cases': all_cases,
            'legal_history_entries': legal_history_entries,
            'case_mentions': case_mentions,
            'search_terms': search_terms
        }

    def _prepare_search_terms(self, entity_name: str) -> List[str]:
        """Prepare search terms from entity name"""
        # Clean the name
        clean_name = re.sub(r'[^\w\s]', '', entity_name.lower().strip())
        
        # Split into words
        words = clean_name.split()
        
        # Create search variations
        search_terms = []
        
        # Full name
        search_terms.append(clean_name)
        
        # Individual words (for partial matches)
        search_terms.extend(words)
        
        # Common abbreviations and variations
        if len(words) > 1:
            # First name + last name
            search_terms.append(f"{words[0]} {words[-1]}")
            
            # Last name only
            search_terms.append(words[-1])
            
            # First name only
            search_terms.append(words[0])
        
        # Remove duplicates and empty strings
        search_terms = list(set([term for term in search_terms if term.strip()]))
        
        return search_terms

    def _search_in_titles(self, search_terms: List[str]) -> List[ReportedCases]:
        """Search for entity mentions in case titles"""
        conditions = []
        for term in search_terms:
            conditions.append(ReportedCases.title.ilike(f"%{term}%"))
        
        return self.db.query(ReportedCases).filter(or_(*conditions)).all()

    def _search_in_parties(self, search_terms: List[str]) -> List[ReportedCases]:
        """Search for entity mentions in antagonist/protagonist fields"""
        conditions = []
        for term in search_terms:
            conditions.extend([
                ReportedCases.antagonist.ilike(f"%{term}%"),
                ReportedCases.protagonist.ilike(f"%{term}%")
            ])
        
        return self.db.query(ReportedCases).filter(or_(*conditions)).all()

    def _search_in_content(self, search_terms: List[str]) -> List[ReportedCases]:
        """Search for entity mentions in case content"""
        conditions = []
        for term in search_terms:
            conditions.extend([
                ReportedCases.judgement.ilike(f"%{term}%"),
                ReportedCases.decision.ilike(f"%{term}%"),
                ReportedCases.case_summary.ilike(f"%{term}%"),
                ReportedCases.keywords_phrases.ilike(f"%{term}%")
            ])
        
        return self.db.query(ReportedCases).filter(or_(*conditions)).all()

    def _combine_search_results(self, *result_sets) -> List[ReportedCases]:
        """Combine and deduplicate search results"""
        all_cases = []
        seen_ids = set()
        
        for result_set in result_sets:
            for case in result_set:
                if case.id not in seen_ids:
                    all_cases.append(case)
                    seen_ids.add(case.id)
        
        return all_cases

    def _determine_mention_type(self, case: ReportedCases, search_terms: List[str]) -> str:
        """Determine where the entity was mentioned"""
        if self._is_mentioned_in_title(case, search_terms):
            return "title"
        elif self._is_mentioned_in_antagonist(case, search_terms) or self._is_mentioned_in_protagonist(case, search_terms):
            return "party"
        else:
            return "content"

    def _is_mentioned_in_title(self, case: ReportedCases, search_terms: List[str]) -> bool:
        """Check if entity is mentioned in case title"""
        if not case.title:
            return False
        title_lower = case.title.lower()
        return any(term in title_lower for term in search_terms)

    def _is_mentioned_in_antagonist(self, case: ReportedCases, search_terms: List[str]) -> bool:
        """Check if entity is mentioned in antagonist field"""
        if not case.antagonist:
            return False
        antagonist_lower = case.antagonist.lower()
        return any(term in antagonist_lower for term in search_terms)

    def _is_mentioned_in_protagonist(self, case: ReportedCases, search_terms: List[str]) -> bool:
        """Check if entity is mentioned in protagonist field"""
        if not case.protagonist:
            return False
        protagonist_lower = case.protagonist.lower()
        return any(term in protagonist_lower for term in search_terms)

    def _is_mentioned_in_content(self, case: ReportedCases, search_terms: List[str]) -> bool:
        """Check if entity is mentioned in case content"""
        content_fields = [case.judgement, case.decision, case.case_summary, case.keywords_phrases]
        for field in content_fields:
            if field:
                field_lower = field.lower()
                if any(term in field_lower for term in search_terms):
                    return True
        return False

    def _is_mentioned_in_judgement(self, case: ReportedCases, search_terms: List[str]) -> bool:
        """Check if entity is mentioned in judgement"""
        if not case.judgement:
            return False
        judgement_lower = case.judgement.lower()
        return any(term in judgement_lower for term in search_terms)

    def _is_mentioned_in_decision(self, case: ReportedCases, search_terms: List[str]) -> bool:
        """Check if entity is mentioned in decision"""
        if not case.decision:
            return False
        decision_lower = case.decision.lower()
        return any(term in decision_lower for term in search_terms)

    def _extract_context(self, case: ReportedCases, search_terms: List[str]) -> str:
        """Extract context around the mention"""
        # This is a simplified version - in production, you'd want more sophisticated context extraction
        context_fields = [case.title, case.antagonist, case.protagonist, case.case_summary]
        for field in context_fields:
            if field:
                for term in search_terms:
                    if term in field.lower():
                        return field[:200] + "..." if len(field) > 200 else field
        return ""

    def _count_mentions(self, case: ReportedCases, search_terms: List[str]) -> int:
        """Count total mentions of entity in case"""
        count = 0
        text_fields = [case.title, case.antagonist, case.protagonist, case.judgement, case.decision, case.case_summary]
        
        for field in text_fields:
            if field:
                field_lower = field.lower()
                for term in search_terms:
                    count += field_lower.count(term)
        
        return count

    def _calculate_relevance_score(self, case: ReportedCases, search_terms: List[str]) -> float:
        """Calculate relevance score for the case"""
        score = 0.0
        
        # Title mentions are most relevant
        if self._is_mentioned_in_title(case, search_terms):
            score += 1.0
        
        # Party mentions are highly relevant
        if self._is_mentioned_in_antagonist(case, search_terms) or self._is_mentioned_in_protagonist(case, search_terms):
            score += 0.8
        
        # Content mentions are moderately relevant
        if self._is_mentioned_in_content(case, search_terms):
            score += 0.5
        
        # Recent cases get slight boost
        if case.year and case.year.isdigit():
            year = int(case.year)
            if year >= 2020:
                score += 0.2
            elif year >= 2010:
                score += 0.1
        
        return min(score, 2.0)  # Cap at 2.0

    def get_entity_legal_summary(self, entity_type: str, entity_id: int, entity_name: str) -> Dict:
        """Get comprehensive legal summary for an entity"""
        
        # Get all legal history entries for this entity
        legal_history = self.db.query(LegalHistory).filter(
            and_(
                LegalHistory.entity_type == entity_type,
                LegalHistory.entity_id == entity_id
            )
        ).all()
        
        # Get all case mentions
        case_mentions = self.db.query(CaseMention).filter(
            and_(
                CaseMention.entity_type == entity_type,
                CaseMention.entity_id == entity_id
            )
        ).all()
        
        # Get case details
        case_ids = [entry.case_id for entry in legal_history]
        cases = self.db.query(ReportedCases).filter(ReportedCases.id.in_(case_ids)).all()
        
        # Calculate statistics
        total_cases = len(cases)
        total_mentions = sum(entry.mention_count for entry in legal_history)
        
        # Group by mention type
        mention_types = {}
        for entry in legal_history:
            mention_type = entry.mention_type
            if mention_type not in mention_types:
                mention_types[mention_type] = 0
            mention_types[mention_type] += entry.mention_count
        
        # Court distribution
        court_distribution = {}
        for case in cases:
            court_type = case.court_type or "Unknown"
            court_distribution[court_type] = court_distribution.get(court_type, 0) + 1
        
        # Year distribution
        year_distribution = {}
        for case in cases:
            year = case.year or "Unknown"
            year_distribution[year] = year_distribution.get(year, 0) + 1
        
        return {
            'entity_name': entity_name,
            'entity_type': entity_type,
            'total_cases': total_cases,
            'total_mentions': total_mentions,
            'mention_types': mention_types,
            'court_distribution': court_distribution,
            'year_distribution': year_distribution,
            'recent_cases': cases[:10],  # Most recent 10 cases
            'legal_history': legal_history,
            'case_mentions': case_mentions
        }
