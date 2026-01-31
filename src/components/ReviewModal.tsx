'use client';

import React, { useState } from 'react';
import { Task } from '../core/types';
import { TaskAction } from '../core/stateMachine';
import { Button } from './Button';
import { Textarea } from './Input';
import { Badge } from './Badge';

interface ReviewModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onReviewSubmit: (taskId: string, action: TaskAction, feedback: string) => Promise<void>;
}

export function ReviewModal({ task, isOpen, onClose, onReviewSubmit }: ReviewModalProps) {
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (action: TaskAction) => {
        setError('');

        // Guardrail: Feedback Mandatory
        if (!feedback.trim()) {
            setError('Feedback is mandatory for both approval and rejection.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onReviewSubmit(task.id, action, feedback);
            setFeedback(''); // Clear on success
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-text">Review Submission</h2>
                        <p className="text-sm text-text-secondary mt-1">{task.interventionTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                    <h3 className="text-sm font-semibold text-text mb-1">{task.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-text-secondary">Status:</span>
                        <Badge status={task.status} />
                    </div>

                    <div className="text-sm">
                        <span className="font-medium text-text-secondary block mb-1">Evidence:</span>
                        {task.evidenceLink ? (
                            <a
                                href={task.evidenceLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline break-all"
                            >
                                {task.evidenceLink}
                            </a>
                        ) : (
                            <span className="text-gray-400 italic">No link provided</span>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <Textarea
                        label="Mentor Feedback (Mandatory)"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide constructive feedback for the HR Professional..."
                        rows={4}
                        error={error}
                    />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => handleSubmit(TaskAction.REJECT)}
                        disabled={isSubmitting}
                    >
                        Request Revision
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => handleSubmit(TaskAction.APPROVE)}
                        disabled={isSubmitting}
                    >
                        Approve
                    </Button>
                </div>
            </div>
        </div>
    );
}
