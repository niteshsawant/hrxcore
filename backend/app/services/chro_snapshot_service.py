from datetime import datetime, timezone
from backend.app.core.chro_framework import CHRO_QUESTIONS

def generate_chro_snapshot(org_id: str):
    return {
        "org_id": org_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "chro_lens": "Business & Execution Risk",
        "questions_chro_is_asking": CHRO_QUESTIONS,
        "initial_signal": {
            "message": "Early warning: Attrition may impact execution capability if unmanaged.",
            "confidence": "LOW (needs deeper signals)"
        }
    }
