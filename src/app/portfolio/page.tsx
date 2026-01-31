'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '../../core/types';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

export default function PortfolioPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/portfolio')
            .then(res => res.json())
            .then(data => {
                setTasks(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text">My Portfolio</h1>
                    <p className="text-text-secondary mt-1">Showcase of completed and approved interventions.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8 text-text-secondary">Loading portfolio...</div>
            ) : tasks.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-text-secondary text-lg">No approved tasks yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Complete tasks and get mentor approval to fill your portfolio.</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {tasks.map(task => (
                        <Card key={task.id} className="hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-text mb-1">{task.title}</h3>
                                    <p className="text-text-secondary text-sm mb-3">{task.interventionTitle}</p>
                                    <Badge status={task.status} />
                                </div>
                                {task.approvedAt && (
                                    <div className="text-right text-xs text-text-secondary">
                                        <span className="block mb-1">Approved on</span>
                                        <span className="font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                            {new Date(task.approvedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {task.feedback && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Mentor Feedback</h4>
                                    <p className="text-sm text-text italic bg-green-50/50 p-3 rounded-lg border border-green-100/50">
                                        "{task.feedback}"
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                                <span>Task {task.taskNumber}.{task.subTaskNumber}</span>
                                {task.evidenceLink && (
                                    <a href={task.evidenceLink} target="_blank" rel="noreferrer" className="hover:text-primary underline">
                                        View Evidence
                                    </a>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
