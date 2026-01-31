import React from 'react';
import { TaskState } from '../core/constants';

const statusColors: Record<TaskState, string> = {
    [TaskState.NOT_STARTED]: 'bg-gray-100 text-gray-800',
    [TaskState.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [TaskState.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [TaskState.APPROVED]: 'bg-green-100 text-green-800',
    [TaskState.REVISION_REQUIRED]: 'bg-red-100 text-red-800',
};

export function Badge({ status }: { status: TaskState }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
