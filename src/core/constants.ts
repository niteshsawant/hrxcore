export enum UserRole {
  ADMIN = 'ADMIN',
  HR_PRO = 'HR_PRO', // Executes tasks and submits evidence
  MENTOR = 'MENTOR', // Reviews evidence and approves/rejects
}

export enum TaskState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  UNDER_REVIEW = 'UNDER_REVIEW', // Evidence submitted
  APPROVED = 'APPROVED', // Unlocks next task
  REVISION_REQUIRED = 'REVISION_REQUIRED', // Rejected by mentor
}
