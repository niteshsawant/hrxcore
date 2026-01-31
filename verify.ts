import { TaskState, UserRole } from './src/core/constants';
import { TaskAction, validateTransition } from './src/core/stateMachine';

console.log('Verifying State Machine Logic...');

const scenarios = [
    // 1. HR Pro can submit evidence only when task is IN_PROGRESS
    {
        desc: 'HR Pro submits evidence when IN_PROGRESS -> Should succeed',
        role: UserRole.HR_PRO,
        state: TaskState.IN_PROGRESS,
        action: TaskAction.SUBMIT_EVIDENCE,
        expectedValid: true,
        expectedState: TaskState.UNDER_REVIEW,
    },
    {
        desc: 'HR Pro submits evidence when NOT_STARTED -> Should fail',
        role: UserRole.HR_PRO,
        state: TaskState.NOT_STARTED,
        action: TaskAction.SUBMIT_EVIDENCE,
        expectedValid: false,
    },
    {
        desc: 'Mentor submits evidence -> Should fail',
        role: UserRole.MENTOR,
        state: TaskState.IN_PROGRESS,
        action: TaskAction.SUBMIT_EVIDENCE,
        expectedValid: false,
    },

    // 2. Mentor can only act on UNDER_REVIEW tasks
    {
        desc: 'Mentor approves IN_PROGRESS -> Should fail',
        role: UserRole.MENTOR,
        state: TaskState.IN_PROGRESS,
        action: TaskAction.APPROVE,
        expectedValid: false,
    },
    {
        desc: 'Mentor approves UNDER_REVIEW -> Should succeed',
        role: UserRole.MENTOR,
        state: TaskState.UNDER_REVIEW,
        action: TaskAction.APPROVE,
        expectedValid: true,
        expectedState: TaskState.APPROVED,
    },

    // 3. Mentor rejection moves task to REVISION_REQUIRED
    {
        desc: 'Mentor rejects UNDER_REVIEW -> Should succeed (REVISION_REQUIRED)',
        role: UserRole.MENTOR,
        state: TaskState.UNDER_REVIEW,
        action: TaskAction.REJECT,
        expectedValid: true,
        expectedState: TaskState.REVISION_REQUIRED,
    },
];

let errors = 0;
for (const s of scenarios) {
    const result = validateTransition(s.role, s.state, s.action);
    if (result.isValid !== s.expectedValid) {
        console.error(`[FAIL] ${s.desc}: Expected valid=${s.expectedValid}, got ${result.isValid}. Error: ${result.error}`);
        errors++;
    } else if (result.isValid && result.newState !== s.expectedState) {
        console.error(`[FAIL] ${s.desc}: Expected state=${s.expectedState}, got ${result.newState}`);
        errors++;
    } else {
        console.log(`[PASS] ${s.desc}`);
    }
}

if (errors === 0) {
    console.log('\nAll checks passed!');
} else {
    console.error(`\n${errors} checks failed.`);
    process.exit(1);
}
