from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from openai import OpenAI
from datetime import datetime
import json
import re
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="EU AI Act Compliance Checker API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NVIDIA API Configuration
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

# Initialize NVIDIA client
client = OpenAI(
    base_url=NVIDIA_BASE_URL,
    api_key=NVIDIA_API_KEY
)

# EU AI Act Risk Categories and Requirements
RISK_CATEGORIES = {
    "UNACCEPTABLE": {
        "description": "Prohibited AI systems",
        "examples": [
            "Social scoring by governments",
            "Real-time biometric identification in public spaces (with exceptions)",
            "Subliminal manipulation causing harm",
            "Exploitation of vulnerabilities"
        ]
    },
    "HIGH": {
        "description": "High-risk AI systems requiring strict compliance",
        "examples": [
            "Critical infrastructure management",
            "Educational/vocational training systems",
            "Employment and worker management",
            "Essential services (credit scoring, emergency response)",
            "Law enforcement",
            "Migration and border control",
            "Justice and democratic processes",
            "Biometric identification and categorization"
        ],
        "requirements": [
            "Risk management system",
            "Data governance and management",
            "Technical documentation",
            "Record keeping and logging",
            "Transparency and user information",
            "Human oversight",
            "Accuracy, robustness and cybersecurity",
            "Quality management system",
            "Conformity assessment",
            "Registration in EU database"
        ]
    },
    "LIMITED": {
        "description": "Limited-risk AI systems with transparency obligations",
        "examples": [
            "Chatbots and conversational agents",
            "Emotion recognition systems",
            "Biometric categorization systems",
            "AI-generated content (deepfakes)"
        ],
        "requirements": [
            "Transparency obligations",
            "User awareness requirements",
            "Disclosure of AI interaction"
        ]
    },
    "MINIMAL": {
        "description": "Minimal-risk AI systems with no specific obligations",
        "examples": [
            "AI-enabled video games",
            "Spam filters",
            "Recommendation systems (non-critical)"
        ]
    }
}

# Pydantic Models
class AISystemInput(BaseModel):
    system_name: str
    description: str
    application_domain: str
    data_sources: List[str]
    user_impact: str
    deployment_context: str
    additional_info: Optional[str] = ""

class ComplianceRequirement(BaseModel):
    requirement: str
    status: str
    details: str
    recommendations: List[str]

class ComplianceAssessment(BaseModel):
    system_name: str
    risk_category: str
    risk_level_justification: str
    compliance_requirements: List[ComplianceRequirement]
    overall_compliance_score: float
    critical_gaps: List[str]
    next_steps: List[str]
    timestamp: str

# Assessment Logic
def assess_with_nemotron(system_info: AISystemInput) -> ComplianceAssessment:
    """Use NVIDIA Nemotron to assess EU AI Act compliance"""
    
    prompt = f"""You are an EU AI Act compliance expert. Analyze the following AI system and provide a detailed compliance assessment.

AI SYSTEM INFORMATION:
- Name: {system_info.system_name}
- Description: {system_info.description}
- Application Domain: {system_info.application_domain}
- Data Sources: {', '.join(system_info.data_sources)}
- User Impact: {system_info.user_impact}
- Deployment Context: {system_info.deployment_context}
- Additional Information: {system_info.additional_info}

EU AI ACT RISK CATEGORIES:
{json.dumps(RISK_CATEGORIES, indent=2)}

ASSESSMENT REQUIRED:
1. Determine the risk category (UNACCEPTABLE, HIGH, LIMITED, or MINIMAL)
2. Provide detailed justification for the risk level
3. For HIGH-risk systems, assess compliance with ALL 10 requirements
4. For LIMITED-risk systems, assess transparency obligations
5. Identify critical compliance gaps
6. Provide actionable next steps

Respond in the following JSON format:
{{
    "risk_category": "HIGH|LIMITED|MINIMAL|UNACCEPTABLE",
    "risk_level_justification": "detailed explanation...",
    "compliance_requirements": [
        {{
            "requirement": "requirement name",
            "status": "compliant|non-compliant|partial|unknown",
            "details": "assessment details...",
            "recommendations": ["recommendation 1", "recommendation 2"]
        }}
    ],
    "overall_compliance_score": 0-100,
    "critical_gaps": ["gap 1", "gap 2"],
    "next_steps": ["step 1", "step 2"]
}}"""

    try:
        completion = client.chat.completions.create(
            model="nvidia/llama-3.3-nemotron-super-49b-v1",
            messages=[
                {"role": "system", "content": "You are an expert EU AI Act compliance assessor. Provide thorough, accurate assessments in valid JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=4000
        )
        
        response_text = completion.choices[0].message.content
        
        # Extract JSON from response
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
        
        # Clean control characters from response (FIX for JSON parsing errors)
        response_text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', response_text)
        
        assessment_data = json.loads(response_text)
        
        # Build ComplianceAssessment object
        compliance_reqs = [
            ComplianceRequirement(**req) for req in assessment_data.get("compliance_requirements", [])
        ]
        
        return ComplianceAssessment(
            system_name=system_info.system_name,
            risk_category=assessment_data["risk_category"],
            risk_level_justification=assessment_data["risk_level_justification"],
            compliance_requirements=compliance_reqs,
            overall_compliance_score=assessment_data["overall_compliance_score"],
            critical_gaps=assessment_data.get("critical_gaps", []),
            next_steps=assessment_data.get("next_steps", []),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "EU AI Act Compliance Checker API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    api_key_configured = bool(NVIDIA_API_KEY)
    return {
        "status": "healthy",
        "api_key_configured": api_key_configured,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/risk-categories")
async def get_risk_categories():
    """Get EU AI Act risk categories information"""
    return RISK_CATEGORIES

@app.post("/assess", response_model=ComplianceAssessment)
async def assess_compliance(system_input: AISystemInput):
    """Assess AI system compliance with EU AI Act"""
    
    if not NVIDIA_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="NVIDIA API key not configured. Please set NVIDIA_API_KEY environment variable."
        )
    
    try:
        assessment = assess_with_nemotron(system_input)
        return assessment
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/examples")
async def get_examples():
    """Get example AI systems for testing"""
    return {
        "examples": [
            {
                "id": 1,
                "system_name": "SmartRecruit Pro",
                "description": "AI-powered recruitment system for screening job candidates",
                "application_domain": "Employment and HR",
                "data_sources": ["Resume databases", "LinkedIn profiles", "Assessment scores"],
                "user_impact": "Direct impact on employment decisions",
                "deployment_context": "Used by Fortune 500 companies for initial candidate screening"
            },
            {
                "id": 2,
                "system_name": "ChatBot Helper",
                "description": "Customer service chatbot for e-commerce website",
                "application_domain": "Customer Service",
                "data_sources": ["Customer inquiries", "Product catalog", "FAQ database"],
                "user_impact": "Assists customers with product questions and order tracking",
                "deployment_context": "Deployed on company website and mobile app"
            },
            {
                "id": 3,
                "system_name": "CreditScore AI",
                "description": "Machine learning model for consumer credit risk assessment",
                "application_domain": "Financial Services",
                "data_sources": ["Credit history", "Transaction data", "Income verification", "Employment records"],
                "user_impact": "Determines loan approval and interest rates",
                "deployment_context": "Used by banks for consumer loan decisions"
            },
            {
                "id": 4,
                "system_name": "ContentModerator",
                "description": "AI system for detecting and filtering harmful content on social media",
                "application_domain": "Social Media Platform",
                "data_sources": ["User posts", "Images", "Comments", "User reports"],
                "user_impact": "Removes or flags potentially harmful content",
                "deployment_context": "Running 24/7 on major social media platform"
            },
            {
                "id": 5,
                "system_name": "Workplace Emotion Surveillance",
                "description": "Real-time emotion recognition system using biometric categorization to continuously monitor and assess employee emotional states and stress levels in the workplace",
                "application_domain": "Workplace Monitoring and Biometric Categorization",
                "data_sources": ["Office surveillance cameras", "Real-time facial emotion recognition", "Biometric emotion data", "Voice stress analysis"],
                "user_impact": "Continuously categorizes employees by emotional and psychological state for performance evaluation",
                "deployment_context": "Deployed in office environment for real-time continuous employee emotional monitoring"
            },
            {
                "id": 6,
                "system_name": "Email Spam Filter",
                "description": "Simple AI-powered email spam detection system using basic keyword matching",
                "application_domain": "Email Services",
                "data_sources": ["Email headers", "Subject lines", "Sender domains"],
                "user_impact": "Filters unwanted emails to spam folder",
                "deployment_context": "Standard feature in email client application"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
