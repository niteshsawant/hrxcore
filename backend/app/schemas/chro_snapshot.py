from pydantic import BaseModel
from typing import List


class BusinessExposure(BaseModel):
    primary_impact: str
    secondary_impact: str
    exposure_level: str


class TimeToFailure(BaseModel):
    window: str
    risk_classification: str


class CapabilityRisk(BaseModel):
    role: str
    failure_mode: str


class OrgSignals(BaseModel):
    observed: List[str]
    organisation_state: str


class DecisionGuidance(BaseModel):
    recommended_action: str
    decision_tradeoff: str
    confidence_statement: str


class CHROSnapshotResponse(BaseModel):
    business_exposure: BusinessExposure
    time_to_failure: TimeToFailure
    capability_risk: CapabilityRisk
    org_signals: OrgSignals
    decision_guidance: DecisionGuidance
