import { NextResponse } from 'next/server';
import { validateTransition, TaskAction } from '../../../core/stateMachine';
import { UserRole, TaskState } from '../../../core/constants';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as UserRole;
    const state = searchParams.get('state') as TaskState;
    const action = searchParams.get('action') as TaskAction;

    if (!role || !state || !action) {
        return NextResponse.json({
            error: 'Missing parameters. Required: role, state, action',
            enums: {
                UserRole: Object.values(UserRole),
                TaskState: Object.values(TaskState),
                TaskAction: Object.values(TaskAction)
            }
        }, { status: 400 });
    }

    const result = validateTransition(role, state, action);
    return NextResponse.json(result);
}
