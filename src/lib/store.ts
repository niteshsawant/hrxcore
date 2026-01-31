import { Task } from '../core/types';
import { TaskState } from '../core/constants';

// In-memory mock store
class MockStore {
    private tasks: Task[] = [
        {
            id: 'task-1',
            title: 'Complete Leadership Module 1 (1.0)',
            interventionTitle: 'Leadership Development Program',
            evidenceLink: 'https://docs.google.com/document/d/123',
            status: TaskState.UNDER_REVIEW,
            taskNumber: 1,
            subTaskNumber: 0,
        },
        {
            id: 'task-1-1',
            title: 'Analyze Root Cause (1.1)',
            interventionTitle: 'Turnover Reduction',
            status: TaskState.UNDER_REVIEW,
            evidenceLink: 'https://docs.google.com/analysis',
            taskNumber: 1,
            subTaskNumber: 1,
        },
        {
            id: 'task-1-2',
            title: 'Draft Intervention Plan (1.2)',
            interventionTitle: 'Turnover Reduction',
            status: TaskState.NOT_STARTED,
            taskNumber: 1,
            subTaskNumber: 2,
        },
        {
            id: 'task-2-1',
            title: 'Implement Retention Survey (2.1)',
            interventionTitle: 'Turnover Reduction',
            status: TaskState.NOT_STARTED,
            taskNumber: 2,
            subTaskNumber: 1,
        },
        {
            id: 'task-3',
            title: 'Evaluate Impact (3.1)',
            interventionTitle: 'Turnover Reduction',
            status: TaskState.NOT_STARTED,
            taskNumber: 3,
            subTaskNumber: 1,
        }
    ];

    getTasksByStatus(status: TaskState): Task[] {
        return this.tasks.filter(t => t.status === status);
    }

    getAllTasks(): Task[] {
        return this.tasks.sort((a, b) => {
            if (a.taskNumber !== b.taskNumber) return a.taskNumber - b.taskNumber;
            return a.subTaskNumber - b.subTaskNumber;
        });
    }

    getTaskById(id: string): Task | undefined {
        return this.tasks.find(t => t.id === id);
    }

    updateTask(id: string, updates: Partial<Task>): Task | undefined {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return undefined;

        this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
        return this.tasks[taskIndex];
    }

    unlockNextTask(currentTaskId: string): void {
        const currentTask = this.getTaskById(currentTaskId);
        if (!currentTask) return;

        const allTasks = this.getAllTasks(); // Already sorted
        const currentIndex = allTasks.findIndex(t => t.id === currentTaskId);

        if (currentIndex !== -1 && currentIndex < allTasks.length - 1) {
            const nextTask = allTasks[currentIndex + 1];
            if (nextTask.status === TaskState.NOT_STARTED) {
                this.tasks = this.tasks.map(t =>
                    t.id === nextTask.id ? { ...t, status: TaskState.IN_PROGRESS } : t
                );
            }
        }
    }
}

export const store = new MockStore();
