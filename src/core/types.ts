import { TaskState } from './constants';

export interface Task {
    id: string;
    title: string;
    interventionTitle: string;
    evidenceLink?: string;
    status: TaskState;
    feedback?: string;
    assigneeId?: string;
    taskNumber: number; // Major number (1, 2, 3)
    subTaskNumber: number; // Minor number (1, 2) -> 1.1, 1.2
    approvedAt?: string; // ISO Date of approval
}
