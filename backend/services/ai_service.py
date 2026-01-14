from openai import OpenAI
import os
from typing import Dict, Any, Optional
import json
import re
from sqlalchemy.orm import Session
from models.settings import Settings

# Initialize OpenAI client with error handling
def get_openai_client(db: Session = None):
    # First try to get from database
    if db:
        try:
            setting = db.query(Settings).filter(Settings.key == "openai_api_key").first()
            if setting and setting.value:
                return OpenAI(api_key=setting.value)
        except Exception as e:
            print(f"Error fetching API key from database: {e}")
    
    # Fallback to environment variable
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OpenAI API key not found in database or environment variables. Please set it via admin panel or OPENAI_API_KEY environment variable.")
    return OpenAI(api_key=api_key)

class AIService:
    @staticmethod
    def generate_case_summary(case_data: Dict[str, Any], db: Session = None) -> Dict[str, Any]:
        """
        Generate AI-powered case summary and analysis
        """
        try:
            # Extract key information from case data
            title = case_data.get('title', '')
            suit_reference = case_data.get('suit_reference_number', '')
            protagonist = case_data.get('protagonist', '')
            antagonist = case_data.get('antagonist', '')
            court_type = case_data.get('court_type', '')
            region = case_data.get('region', '')
            year = case_data.get('year', '')
            judgement = case_data.get('judgement', '')
            case_summary = case_data.get('case_summary', '')
            area_of_law = case_data.get('area_of_law', '')
            keywords_phrases = case_data.get('keywords_phrases', '')
            
            # Create context for AI
            context = f"""
            Case Title: {title}
            Suit Reference: {suit_reference}
            Plaintiff: {protagonist}
            Defendant: {antagonist}
            Court: {court_type}
            Region: {region}
            Year: {year}
            Judgement: {judgement}
            Existing Summary: {case_summary}
            Area of Law: {area_of_law}
            Keywords: {keywords_phrases}
            """
            
            # Generate comprehensive case analysis
            prompt = f"""
            As a legal AI assistant, analyze the following case information and provide a comprehensive analysis:

            {context}

            Please provide:
            1. A detailed case outcome analysis
            2. Specific court orders and directives
            3. Financial impact assessment
            4. A comprehensive detailed outcome summary

            Format your response as JSON with the following structure:
            {{
                "ai_case_outcome": "Detailed analysis of the case outcome and its implications",
                "ai_court_orders": "Specific court orders, directives, and legal requirements",
                "ai_financial_impact": "Assessment of financial implications for parties involved",
                "ai_detailed_outcome": "Comprehensive summary of the case resolution and its broader legal significance"
            }}

            Make the analysis professional, detailed, and legally relevant.
            """
            
            client = get_openai_client(db)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a legal AI assistant specializing in case analysis and legal document summarization."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.3
            )
            
            # Parse the AI response
            ai_content = response.choices[0].message.content.strip()
            
            # Try to extract JSON from the response
            try:
                # Look for JSON in the response
                json_match = re.search(r'\{.*\}', ai_content, re.DOTALL)
                if json_match:
                    ai_data = json.loads(json_match.group())
                else:
                    # If no JSON found, create structured response
                    ai_data = {
                        "ai_case_outcome": ai_content,
                        "ai_court_orders": "Court orders analysis not available",
                        "ai_financial_impact": "Financial impact analysis not available",
                        "ai_detailed_outcome": ai_content
                    }
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                ai_data = {
                    "ai_case_outcome": ai_content,
                    "ai_court_orders": "Court orders analysis not available",
                    "ai_financial_impact": "Financial impact analysis not available",
                    "ai_detailed_outcome": ai_content
                }
            
            return ai_data
            
        except Exception as e:
            print(f"Error generating AI summary: {str(e)}")
            return {
                "ai_case_outcome": "AI analysis unavailable",
                "ai_court_orders": "AI analysis unavailable",
                "ai_financial_impact": "AI analysis unavailable",
                "ai_detailed_outcome": "AI analysis unavailable"
            }
    
    @staticmethod
    def extract_entities_from_case(case_data: Dict[str, Any], db: Session = None) -> Dict[str, Any]:
        """
        Extract entities (people, companies, banks, insurance) from case data
        """
        try:
            # Combine relevant text fields
            text_content = f"""
            {case_data.get('title', '')}
            {case_data.get('protagonist', '')}
            {case_data.get('antagonist', '')}
            {case_data.get('lawyers', '')}
            {case_data.get('presiding_judge', '')}
            {case_data.get('judgement_by', '')}
            {case_data.get('opinion_by', '')}
            {case_data.get('case_summary', '')}
            {case_data.get('commentary', '')}
            {case_data.get('headnotes', '')}
            """
            
            prompt = f"""
            Extract the following entities from the legal case text:

            Text: {text_content}

            Please identify and extract:
            1. People (plaintiffs, defendants, lawyers, judges, witnesses)
            2. Companies/Corporations (business entities, organizations)
            3. Banks (financial institutions)
            4. Insurance companies

            Format as JSON:
            {{
                "people": ["list of people names"],
                "companies": ["list of company names"],
                "banks": ["list of bank names"],
                "insurance": ["list of insurance company names"]
            }}

            Only include clearly identifiable entities. If none found, use empty arrays.
            """
            
            client = get_openai_client(db)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in extracting legal entities from case documents."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.2
            )
            
            ai_content = response.choices[0].message.content.strip()
            
            try:
                json_match = re.search(r'\{.*\}', ai_content, re.DOTALL)
                if json_match:
                    entities = json.loads(json_match.group())
                else:
                    entities = {
                        "people": [],
                        "companies": [],
                        "banks": [],
                        "insurance": []
                    }
            except json.JSONDecodeError:
                entities = {
                    "people": [],
                    "companies": [],
                    "banks": [],
                    "insurance": []
                }
            
            return entities
            
        except Exception as e:
            print(f"Error extracting entities: {str(e)}")
            return {
                "people": [],
                "companies": [],
                "banks": [],
                "insurance": []
            }
    
    @staticmethod
    def generate_text(prompt: str, db: Session = None) -> str:
        """
        Generate text using OpenAI GPT
        """
        try:
            client = get_openai_client(db)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a legal AI assistant specialized in analyzing legal documents and extracting structured information."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating text: {e}")
            return ""

    @staticmethod
    def generate_legal_keywords(case_data: Dict[str, Any], db: Session = None) -> str:
        """
        Generate relevant legal keywords and phrases for the case
        """
        try:
            context = f"""
            Case Title: {case_data.get('title', '')}
            Area of Law: {case_data.get('area_of_law', '')}
            Court Type: {case_data.get('court_type', '')}
            Case Summary: {case_data.get('case_summary', '')}
            Judgement: {case_data.get('judgement', '')}
            """
            
            prompt = f"""
            Generate relevant legal keywords and phrases for this case:

            {context}

            Provide a comma-separated list of:
            - Legal concepts
            - Relevant statutes
            - Court procedures
            - Legal principles
            - Case types
            - Jurisdictional terms

            Focus on terms that would be useful for legal research and case categorization.
            """
            
            client = get_openai_client(db)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a legal research assistant specializing in keyword generation for case law."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            keywords = response.choices[0].message.content.strip()
            return keywords
            
        except Exception as e:
            print(f"Error generating keywords: {str(e)}")
            return case_data.get('keywords_phrases', '')
