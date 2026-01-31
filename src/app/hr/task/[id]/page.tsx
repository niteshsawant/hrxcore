'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Task } from '@/core/types';
import { TaskState } from '@/core/constants';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function HRTaskDetail() {
    const params = useParams();
    const [task, setTask] = useState<Task | null>(null);
    const [evidenceLink, setEvidenceLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetch('/api/hr/tasks')
            .then(res => res.json())
            .then((data: Task[]) => {
                const found = data.find(t => t.id === params.id);
                if (found) {
                    setTask(found);
                    setEvidenceLink(found.evidenceLink || '');
                }
                setLoading(false);
            });
    }, [params.id]);

    const handleSubmit = async () => {
        if (!task) return;

        // Guardrails
        if (task.status !== TaskState.IN_PROGRESS && task.status !== TaskState.REVISION_REQUIRED) {
            setError('Task is not in a submittable state.');
            return;
        }

        if (!evidenceLink.trim()) {
            setError('Evidence link is mandatory.');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/hr/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: task.id, evidenceLink })
            });
            const data = await res.json();
            if (data.success) {
                setTask(data.task);
                setSuccess('Evidence submitted successfully! Task moved to Under Review.');
            } else {
                setError(data.error || 'Submission failed');
            }
        } catch (e) {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <DashboardLayout><div className="p-8 text-center text-text-secondary">Loading details...</div></DashboardLayout>;
    if (!task) return <DashboardLayout><div className="p-8 text-center text-error">Task not found</div></DashboardLayout>;

    const isEditable = task.status === TaskState.IN_PROGRESS || task.status === TaskState.REVISION_REQUIRED;
    const showFeedback = task.status === TaskState.APPROVED || task.status === TaskState.REVISION_REQUIRED;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text mb-2">{task.title}</h1>
                <div className="flex items-center gap-2">
                    <span className="text-text-secondary">{task.interventionTitle}</span>
                    <span className="text-slate-300">•</span>
                    <Badge status={task.status} />
                </div>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {showFeedback && task.feedback && (
                    <div className={`p-4 rounded-lg border ${task.status === TaskState.APPROVED ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
                        }`}>
                        <h4 className="font-semibold text-sm mb-2 opacity-80 uppercase tracking-wider">Mentor Feedback</h4>
                        <p className="text-base whitespace-pre-wrap">{task.feedback}</p>
                    </div>
                )}

                <Card>
                    <h3 className="text-lg font-semibold text-text mb-4">Evidence Submission</h3>

                    <div className="mb-6">
                        {isEditable ? (
                            <Input
                                label="Evidence Link"
                                placeholder="https://docs.google.com/..."
                                value={evidenceLink}
                                onChange={e => {
                                    setEvidenceLink(e.target.value);
                                    setError('');
                                }}
                                error={error}
                            />
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Link</label>
                                <a
                                    href={task.evidenceLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary hover:underline break-all block p-2 bg-slate-50 rounded border border-slate-100"
                                >
                                    {task.evidenceLink || 'No link provided'}
                                </a>
                            </div>
                        )}
                    </div>

                    {success && (
                        <div className="mb-4 text-sm text-success bg-green-50 p-2 rounded border border-green-100">
                            {success}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                        <div>
                            {!isEditable && task.status === TaskState.UNDER_REVIEW && (
                                <p className="text-sm text-text-secondary italic">Waiting for mentor review...</p>
                            )}
                        </div>

                        {isEditable && (
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                variant={task.status === TaskState.REVISION_REQUIRED ? "danger" : "primary"}
                            >
                                {submitting ? 'Submitting...' : task.status === TaskState.REVISION_REQUIRED ? 'Resubmit Evidence' : 'Submit Evidence'}
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
