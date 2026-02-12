export interface User {
    id: number;
    email: string;
    name?: string;
    role: string;
}

export interface ExecutionStep {
    id: number;
    stage_id: number;
    title: string;
    guidance_text?: string;
    is_required: boolean;
    is_enabled: boolean;
    order: number;
}

export interface Stage {
    id: number;
    intervention_id: number;
    name: string;
    order: number;
    status: "locked" | "in_progress" | "submitted" | "approved" | "rework";
    evidence_links: string[];
    rating?: number;
    mentor_feedback?: string;
    reviewed_by?: number;
    approved_at?: string;
    execution_steps: ExecutionStep[];
}

export interface Intervention {
    id: number;
    name: string;
    objective?: string;
    status: string;
    assigned_practitioner_id?: number;
    assigned_mentor_id?: number;
    stages: Stage[];
}

export interface Portfolio {
    id: number;
    practitioner_id: number;
    intervention_id: number;
    pdf_url?: string;
    public_link?: string;
}
