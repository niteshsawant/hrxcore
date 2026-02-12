import google.generativeai as genai
import os
from sqlalchemy.orm import Session
from backend.app.models.intervention import ExecutionStep
from backend.app.models.ai_interaction import AIInteraction

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_gemini_model():
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not set")
    return genai.GenerativeModel('gemini-pro')

def get_step_guidance(db: Session, execution_step: ExecutionStep, user_id: int) -> str:
    try:
        model = get_gemini_model()
        prompt = f"""
        Act as an expert Lean Six Sigma/Continuous Improvement coach.
        
        Step Title: {execution_step.title}
        Guidance Provided: {execution_step.guidance_text}
        
        Please provide detailed guidance on how to execute this step effectively. Include:
        1. The Purpose of this step.
        2. How to execute it (step-by-step).
        3. Best practices.
        4. Common mistakes to avoid.
        5. An example of what a good output looks like.
        
        Keep the tone professional yet encouraging.
        """
        
        response = model.generate_content(prompt)
        output_text = response.text
        
        # Log interaction
        log_interaction(db, user_id, execution_step.id, "guidance", None, output_text)
        
        return output_text
    except Exception as e:
        print(f"Error generating guidance: {e}")
        return "Sorry, I am unable to provide guidance at this time. Please try again later."

def get_step_feedback(db: Session, execution_step: ExecutionStep, user_notes: str, user_id: int) -> str:
    try:
        model = get_gemini_model()
        prompt = f"""
        Act as an expert Lean Six Sigma/Continuous Improvement coach.
        
        Step Title: {execution_step.title}
        User Notes/Input: "{user_notes}"
        
        Please review the user's notes for this step.
        1. Evaluate the quality of the input.
        2. Suggest specific improvements.
        3. Identify any missing elements based on standard LSS practices for this step.
        4. Rate the clarity of the input on a scale of 1-5.
        
        Keep the tone constructive and helpful.
        """
        
        response = model.generate_content(prompt)
        output_text = response.text
        
        # Log interaction
        log_interaction(db, user_id, execution_step.id, "feedback", user_notes, output_text)
        
        return output_text
    except Exception as e:
        print(f"Error generating feedback: {e}")
        return "Sorry, I am unable to provide feedback at this time. Please try again later."

def log_interaction(db: Session, user_id: int, execution_step_id: int, prompt_type: str, input_text: str, output_text: str):
    interaction = AIInteraction(
        user_id=user_id,
        execution_step_id=execution_step_id,
        prompt_type=prompt_type,
        input_text=input_text,
        output_text=output_text
    )
    db.add(interaction)
    db.commit()
