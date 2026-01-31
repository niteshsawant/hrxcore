import { NextResponse } from 'next/server';
import { store } from '../../../../lib/store';
import { TaskState, UserRole } from '../../../../core/constants';
import { validateTransition, TaskAction } from '../../../../core/stateMachine';

export async function GET() {
    // Simulate fetching tasks for Mentor (tasks UNDER_REVIEW)
    const tasks = store.getTasksByStatus(TaskState.UNDER_REVIEW);
    return NextResponse.json(tasks);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { taskId, action, feedback } = body;

        if (!taskId || !action || !feedback) {
            return NextResponse.json({ error: 'Missing required fields: taskId, action, feedback' }, { status: 400 });
        }

        const task = store.getTaskById(taskId);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const taskAction = action as TaskAction;

        // Validate Transition logic
        // Mentor actions: APPROVE, REJECT
        const result = validateTransition(UserRole.MENTOR, task.status, taskAction);

        if (!result.isValid) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Update Task
        const updatedTask = store.updateTask(taskId, {
            status: result.newState,
            feedback: feedback,
            approvedAt: result.newState === TaskState.APPROVED ? new Date().toISOString() : undefined
        });

        // Unlock next task if approved
        if (result.newState === TaskState.APPROVED) {
            store.unlockNextTask(taskId);
        }

        return NextResponse.json({ success: true, task: updatedTask });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
