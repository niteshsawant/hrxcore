'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '../../../core/types';
import { ReviewModal } from '../../../components/ReviewModal';
import { TaskAction } from '../../../core/stateMachine';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { DashboardLayout } from '../../../components/DashboardLayout';

export default function MentorDashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/mentor/tasks');
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReview = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleReviewSubmit = async (taskId: string, action: TaskAction, feedback: string) => {
        try {
            const res = await fetch('/api/mentor/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, action, feedback }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error);
            }

            await fetchTasks();
        } catch (error) {
            console.error('Error submitting review', error);
            throw error; // Re-throw to be handled by Modal
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text">Mentor Dashboard</h1>
                    <p className="text-text-secondary mt-1">Review pending task submissions from HR Professionals.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8 text-text-secondary">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-text-secondary text-lg">No tasks pending review.</p>
                    <p className="text-sm text-gray-400 mt-2">Good job! You're all caught up.</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tasks.map(task => (
                        <Card key={task.id} className="flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-shadow">
                            <div className="mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-semibold text-lg text-text">{task.title}</h3>
                                    <Badge status={task.status} />
                                </div>
                                <p className="text-sm text-text-secondary">{task.interventionTitle}</p>
                            </div>
                            <Button
                                onClick={() => handleOpenReview(task)}
                                variant="primary"
                                size="sm"
                            >
                                Review Task
                            </Button>
                        </Card>
                    ))}
                </div>
            )}

            {selectedTask && (
                <ReviewModal
                    task={selectedTask}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onReviewSubmit={handleReviewSubmit}
                />
            )}
        </DashboardLayout>
    );
}
