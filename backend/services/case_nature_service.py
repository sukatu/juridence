import openai
import re
from typing import Optional, Dict, Any
from config import settings

class CaseNatureService:
    def __init__(self):
        # Set up OpenAI API key
        openai.api_key = settings.openai_api_key
        
        # Common case nature patterns and keywords
        self.nature_keywords = {
            'Contract Dispute': [
                'contract', 'agreement', 'breach', 'terms', 'obligation', 'performance',
                'payment', 'delivery', 'service', 'employment', 'lease', 'rental'
            ],
            'Property Dispute': [
                'property', 'land', 'real estate', 'ownership', 'title', 'deed',
                'boundary', 'possession', 'eviction', 'tenancy', 'landlord', 'tenant'
            ],
            'Fraud': [
                'fraud', 'fraudulent', 'deception', 'misrepresentation', 'false',
                'forgery', 'embezzlement', 'theft', 'stealing', 'dishonest'
            ],
            'Family Law': [
                'divorce', 'custody', 'maintenance', 'alimony', 'child support',
                'marriage', 'adoption', 'guardianship', 'domestic violence'
            ],
            'Criminal': [
                'criminal', 'offence', 'crime', 'assault', 'robbery', 'burglary',
                'murder', 'manslaughter', 'drug', 'trafficking', 'possession'
            ],
            'Commercial': [
                'commercial', 'business', 'company', 'corporate', 'partnership',
                'shareholder', 'director', 'liquidation', 'bankruptcy', 'insolvency'
            ],
            'Employment': [
                'employment', 'workplace', 'dismissal', 'termination', 'unfair',
                'discrimination', 'harassment', 'wages', 'salary', 'benefits'
            ],
            'Tort': [
                'negligence', 'tort', 'damages', 'injury', 'accident', 'liability',
                'compensation', 'personal injury', 'medical malpractice'
            ],
            'Constitutional': [
                'constitutional', 'fundamental', 'rights', 'freedom', 'liberty',
                'equality', 'discrimination', 'human rights', 'civil rights'
            ],
            'Administrative': [
                'administrative', 'government', 'public', 'licensing', 'permit',
                'regulation', 'compliance', 'authority', 'decision', 'appeal'
            ]
        }

    def generate_case_nature(self, case_data: Dict[str, Any]) -> str:
        """
        Generate case nature based on case data using AI and keyword analysis
        """
        try:
            # Extract relevant text from case data
            text_content = self._extract_text_content(case_data)
            
            if not text_content:
                return "General Legal Matter"
            
            # First try keyword-based classification
            keyword_nature = self._classify_by_keywords(text_content)
            if keyword_nature and keyword_nature != "General Legal Matter":
                return keyword_nature
            
            # If keyword classification fails, use AI
            ai_nature = self._classify_with_ai(text_content)
            return ai_nature or "General Legal Matter"
            
        except Exception as e:
            print(f"Error generating case nature: {e}")
            return "General Legal Matter"

    def _extract_text_content(self, case_data: Dict[str, Any]) -> str:
        """Extract and combine relevant text fields from case data"""
        text_parts = []
        
        # Priority order for text extraction
        fields = [
            'title',
            'area_of_law', 
            'case_summary',
            'keywords_phrases',
            'decision',
            'judgement',
            'conclusion',
            'headnotes',
            'commentary'
        ]
        
        for field in fields:
            value = case_data.get(field)
            if value and isinstance(value, str) and value.strip():
                text_parts.append(value.strip())
        
        return ' '.join(text_parts)

    def _classify_by_keywords(self, text: str) -> Optional[str]:
        """Classify case nature using keyword matching"""
        text_lower = text.lower()
        
        # Score each nature category
        nature_scores = {}
        for nature, keywords in self.nature_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
            nature_scores[nature] = score
        
        # Return the nature with highest score if it's above threshold
        if nature_scores:
            best_nature = max(nature_scores, key=nature_scores.get)
            if nature_scores[best_nature] > 0:
                return best_nature
        
        return None

    def _classify_with_ai(self, text: str) -> Optional[str]:
        """Classify case nature using OpenAI API"""
        try:
            # Truncate text if too long
            if len(text) > 3000:
                text = text[:3000] + "..."
            
            prompt = f"""
            Analyze the following legal case text and determine the most appropriate nature/category of the case.
            
            Case Text: {text}
            
            Please classify this case into one of these categories:
            - Contract Dispute
            - Property Dispute  
            - Fraud
            - Family Law
            - Criminal
            - Commercial
            - Employment
            - Tort
            - Constitutional
            - Administrative
            - General Legal Matter
            
            Respond with only the category name, nothing else.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a legal expert specializing in case classification."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,
                temperature=0.1
            )
            
            nature = response.choices[0].message.content.strip()
            
            # Validate the response
            valid_natures = list(self.nature_keywords.keys()) + ["General Legal Matter"]
            if nature in valid_natures:
                return nature
            else:
                return "General Legal Matter"
                
        except Exception as e:
            print(f"AI classification error: {e}")
            return None

    def batch_generate_natures(self, cases: list) -> Dict[int, str]:
        """Generate natures for multiple cases efficiently"""
        results = {}
        
        for case in cases:
            case_id = case.get('id')
            if case_id:
                nature = self.generate_case_nature(case)
                results[case_id] = nature
        
        return results

# Example usage and testing
if __name__ == "__main__":
    # Test the service
    service = CaseNatureService()
    
    test_case = {
        'title': 'John Doe vs. ABC Bank - Breach of Contract',
        'area_of_law': 'Contract Law',
        'case_summary': 'Plaintiff alleges breach of loan agreement terms',
        'keywords_phrases': 'contract, breach, loan, agreement, damages'
    }
    
    nature = service.generate_case_nature(test_case)
    print(f"Generated nature: {nature}")
