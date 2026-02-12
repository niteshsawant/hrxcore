CHRO_QUESTIONS = [
    {
        "id": "execution_risk",
        "question": "What critical business execution is at risk due to people issues?",
        "why_it_matters": "CHROs think in execution continuity, not attrition %."
    },
    {
        "id": "capability_gap",
        "question": "Which organizational capability is weakening?",
        "why_it_matters": "Attrition is a symptom; capability loss is the disease."
    },
    {
        "id": "leadership_exposure",
        "question": "Where is leadership credibility or bench strength exposed?",
        "why_it_matters": "Boards worry about leadership failure, not HR metrics."
    },
    {
        "id": "time_horizon",
        "question": "If no action is taken, what breaks in 3–6 months?",
        "why_it_matters": "CHROs think forward, not backward."
    },
    {
        "id": "decision_required",
        "question": "What hard decision must leadership make now?",
        "why_it_matters": "CHROs are decision partners, not data providers."
    }
]

# backend/app/core/chro_framework.py

from typing import Dict

def evaluate_attrition_risk(snapshot_answers: Dict[str, str]) -> Dict[str, str]:
    """
    Converts HR answers into CHRO-level risk interpretation
    """

    impact_area = snapshot_answers.get("primary_business_impact")
    time_horizon = snapshot_answers.get("time_to_impact")
    critical_role = snapshot_answers.get("critical_role")
    failure_mode = snapshot_answers.get("failure_mode")

    risk_level = "LOW"
    narrative = []

    # Core CHRO logic
    if impact_area in ["Revenue", "Project Delivery"]:
        risk_level = "HIGH"
        narrative.append("Attrition is directly impacting business execution.")

    if time_horizon in ["Immediate", "3 months"]:
        risk_level = "HIGH"
        narrative.append("Impact window is too short for HR-only interventions.")

    if critical_role in ["Engineers", "SDE", "Client-facing roles"]:
        narrative.append("Loss of critical capability threatens continuity.")

    if failure_mode in ["Business failure", "Revenue volatility"]:
        risk_level = "CRITICAL"
        narrative.append("This is an enterprise-level risk, not an HR issue.")

    return {
        "risk_level": risk_level,
        "chro_view": " ".join(narrative)
    }
