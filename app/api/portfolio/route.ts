import { NextResponse } from 'next/server';
import { store } from '../../../lib/store';
import { TaskState } from '../../../core/constants';

export async function GET() {
  const allTasks = store.getAllTasks();
  const approvedTasks = allTasks.filter(t => t.status === TaskState.APPROVED);
  return NextResponse.json(approvedTasks);
}
