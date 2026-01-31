import { TaskState, UserRole } from './constants';

export enum TaskAction {
    START = 'START',
    SUBMIT_EVIDENCE = 'SUBMIT_EVIDENCE',
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
}

/**
 * Rules:
 * 1. HR Pro can submit evidence only when task is IN_PROGRESS
 * 2. Evidence submission moves task to UNDER_REVIEW
 * 3. Mentor can only act on UNDER_REVIEW tasks
 * 4. Mentor approval moves task to APPROVED
 * 5. Mentor rejection moves task to REVISION_REQUIRED
 * 6. APPROVED task unlocks next task (if exists)
 */

interface TransitionResult {
    isValid: boolean;
    newState?: TaskState;
    error?: string;
}

export function validateTransition(
    role: UserRole,
    currentState: TaskState,
    action: TaskAction
): TransitionResult {
    switch (action) {
        case TaskAction.START:
            // Implicit rule: Only start if NOT_STARTED or REVISION_REQUIRED? 
            // Prompt doesn't explicitly restrict START, but implied flow is starts from NOT_STARTED.
            // Also maybe REVISION_REQUIRED -> IN_PROGRESS?
            // For now, let's assume commonly acceptable start states.
            if (currentState === TaskState.NOT_STARTED || currentState === TaskState.REVISION_REQUIRED) {
                // Who can start? imply HR_PRO or anyone? Usually HR_PRO executes.
                if (role === UserRole.HR_PRO) {
                    return { isValid: true, newState: TaskState.IN_PROGRESS };
                }
                return { isValid: false, error: 'Only HR Pro can start tasks.' };
            }
            return { isValid: false, error: 'Task can only be started from NOT_STARTED or REVISION_REQUIRED.' };

        case TaskAction.SUBMIT_EVIDENCE:
            // Rule 1: HR Pro can submit evidence only when task is IN_PROGRESS
            if (currentState !== TaskState.IN_PROGRESS) {
                return { isValid: false, error: 'Evidence can only be submitted when task is IN_PROGRESS.' };
            }
            if (role !== UserRole.HR_PRO) {
                return { isValid: false, error: 'Only HR Pro can submit evidence.' };
            }
            // Rule 2: Evidence submission moves task to UNDER_REVIEW
            return { isValid: true, newState: TaskState.UNDER_REVIEW };

        case TaskAction.APPROVE:
            // Rule 3: Mentor can only act on UNDER_REVIEW tasks
            if (currentState !== TaskState.UNDER_REVIEW) {
                return { isValid: false, error: 'Approval can only happen when task is UNDER_REVIEW.' };
            }
            if (role !== UserRole.MENTOR) {
                return { isValid: false, error: 'Only Mentor can approve tasks.' };
            }
            // Rule 4: Mentor approval moves task to APPROVED
            // Rule 6: APPROVED task unlocks next task (handled by caller logic usually, but state is correct)
            return { isValid: true, newState: TaskState.APPROVED };

        case TaskAction.REJECT:
            // Rule 3: Mentor can only act on UNDER_REVIEW tasks
            if (currentState !== TaskState.UNDER_REVIEW) {
                return { isValid: false, error: 'Rejection can only happen when task is UNDER_REVIEW.' };
            }
            if (role !== UserRole.MENTOR) {
                return { isValid: false, error: 'Only Mentor can reject tasks.' };
            }
            // Rule 5: Mentor rejection moves task to REVISION_REQUIRED
            return { isValid: true, newState: TaskState.REVISION_REQUIRED };

        default:
            return { isValid: false, error: 'Invalid action.' };
    }
}
