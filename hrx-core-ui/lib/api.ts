import axios from "axios";
import { User, Intervention, Stage } from "@/app/types";

const API_URL = "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get("/users/");
    return response.data;
};

export const getIntervention = async (id: number): Promise<Intervention> => {
    const response = await api.get(`/interventions/${id}`);
    return response.data;
};

export const getInterventions = async (): Promise<Intervention[]> => {
    const response = await api.get("/interventions/");
    return response.data;
};

export const createIntervention = async (data: Partial<Intervention>): Promise<Intervention> => {
    const response = await api.post("/interventions/", data);
    return response.data;
};

export const createStage = async (interventionId: number, data: Partial<Stage>): Promise<Stage> => {
    const response = await api.post(`/interventions/${interventionId}/stages`, data);
    return response.data;
};

export const startStage = async (stageId: number, userId: number): Promise<Stage> => {
    const response = await api.post(`/workflow/${stageId}/start`, { user_id: userId });
    return response.data;
};

export const addEvidence = async (stageId: number, link: string, userId: number): Promise<Stage> => {
    const response = await api.post(`/workflow/${stageId}/add-link`, { link, user_id: userId });
    return response.data;
};

export const submitStage = async (stageId: number, userId: number): Promise<Stage> => {
    const response = await api.post(`/workflow/${stageId}/submit`, { user_id: userId });
    return response.data;
};

export const reviewStage = async (
    stageId: number,
    mentorId: number,
    action: "approve" | "rework",
    feedback?: string,
    rating?: number
): Promise<Stage> => {
    const response = await api.post(`/workflow/${stageId}/review`, {
        mentor_id: mentorId,
        action,
        feedback,
        rating,
    });
    return response.data;
};
