import { NextResponse } from 'next/server';
import { store } from '../../../../lib/store';
import { TaskState, UserRole } from '../../../../core/constants';
import { validateTransition, TaskAction } from '../../../../core/stateMachine';

export async function GET() {
    const tasks = store.getAllTasks();
    return NextResponse.json(tasks);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { taskId, evidenceLink } = body;

        if (!taskId || !evidenceLink) {
            return NextResponse.json({ error: 'Missing required fields: taskId, evidenceLink' }, { status: 400 });
        }

        const task = store.getTaskById(taskId);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Validate Transition
        // HR Pro Action: SUBMIT_EVIDENCE
        const result = validateTransition(UserRole.HR_PRO, task.status, TaskAction.SUBMIT_EVIDENCE);

        if (!result.isValid) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Update Task
        const updatedTask = store.updateTask(taskId, {
            status: result.newState,
            evidenceLink: evidenceLink
        });

        return NextResponse.json({ success: true, task: updatedTask });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
