'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Task } from '../../../core/types';
import { TaskState } from '../../../core/constants';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

export default function HRDashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Intervention Details
    const intervention = {
        title: 'Turnover Reduction Program',
        description: 'Strategic initiative to reduce voluntary turnover by 15% within Q3.',
        mentor: 'Sarah Jenkins (Senior HR PbP)',
        startDate: 'Jan 15, 2024',
        endDate: 'Apr 30, 2024',
    };

    useEffect(() => {
        fetch('/api/hr/tasks')
            .then(res => res.json())
            .then(data => {
                setTasks(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // Calculate Progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === TaskState.APPROVED).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (loading) return (
        <DashboardLayout>
            <div className="flex justify-center items-center h-64 text-text-secondary">
                Loading dashboard...
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* 1. Header & Progress */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text tracking-tight">My Active Intervention</h1>
                            <p className="text-text-secondary mt-1 text-lg">{intervention.title}</p>
                        </div>
                        <div className="text-right" title="Progress advances after mentor approval">
                            <span className="text-2xl font-bold text-primary">{progress}%</span>
                            <span className="text-text-secondary text-sm ml-2">Completed</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* 2. Intervention Card */}
                <Card className="border-l-4 border-l-primary bg-white shadow-md">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-text">Project Overview</h2>
                            <p className="text-text-secondary">{intervention.description}</p>
                            <div className="flex items-center gap-2 mt-4 text-sm text-text-secondary">
                                <svg width="16" height="16" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span>Mentor: <span className="font-medium text-text">{intervention.mentor}</span></span>
                            </div>
                        </div>
                        <div className="flex flex-col md:items-end justify-center text-sm text-text-secondary space-y-1 bg-slate-50 p-4 rounded-lg border border-slate-100 min-w-[200px]">
                            <div className="flex justify-between w-full">
                                <span>Start Date:</span>
                                <span className="font-medium text-text">{intervention.startDate}</span>
                            </div>
                            <div className="flex justify-between w-full">
                                <span>Target End:</span>
                                <span className="font-medium text-text">{intervention.endDate}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-200 w-full flex justify-between">
                                <span>Status:</span>
                                <span className="text-green-600 font-medium bg-green-50 px-2 rounded text-xs py-0.5">Active</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 3. Task Timeline */}
                <div>
                    <h3 className="text-lg font-bold text-text mb-6">Action Plan</h3>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {tasks.map((task, index) => {
                            const isCompleted = task.status === TaskState.APPROVED;
                            const isActive = task.status === TaskState.IN_PROGRESS || task.status === TaskState.REVISION_REQUIRED;
                            const isLocked = task.status === TaskState.NOT_STARTED;
                            const isUnderReview = task.status === TaskState.UNDER_REVIEW;

                            return (
                                <div key={task.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isLocked ? 'opacity-60 grayscale' : ''}`}>

                                    {/* Timeline Icon */}
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow 
                          ${isCompleted ? 'bg-green-500 border-green-100 text-white' :
                                            isActive ? 'bg-white border-primary text-primary' :
                                                'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                        {isCompleted ? (
                                            <svg width="20" height="20" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <span className="text-sm font-bold">{task.taskNumber}.{task.subTaskNumber}</span>
                                        )}
                                    </div>

                                    {/* Card */}
                                    <Card className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-0 overflow-hidden transition-all hover:shadow-md ${isActive ? 'ring-1 ring-primary/20 shadow-lg' : ''}`}>

                                        {/* Section 1: Task Objective */}
                                        <div className="p-4 border-b border-slate-100 bg-white">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Task Objective</span>
                                                <Badge status={task.status} />
                                            </div>
                                            <h4 className={`text-lg font-bold mb-1 ${isCompleted ? 'text-text' : 'text-text'}`}>{task.title}</h4>
                                        </div>

                                        {/* Section 2: Execution Guidance */}
                                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 block">Execution Guidance (Not Reviewed)</span>
                                            <ul className="space-y-2">
                                                <li className="flex items-start text-sm text-text-secondary">
                                                    <span className="mr-2 text-slate-400">•</span>
                                                    Review historical data relevant to {task.interventionTitle}
                                                </li>
                                                <li className="flex items-start text-sm text-text-secondary">
                                                    <span className="mr-2 text-slate-400">•</span>
                                                    Consult with department heads on key metrics
                                                </li>
                                                <li className="flex items-start text-sm text-text-secondary">
                                                    <span className="mr-2 text-slate-400">•</span>
                                                    Draft initial findings document
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Section 3: Submission & Review */}
                                        <div className={`p-4 ${isActive ? 'bg-blue-50/30' : 'bg-white'}`}>
                                            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 block">Submission & Review</span>

                                            <div className="flex flex-col gap-3">

                                                {/* Evidence Link Display */}
                                                {task.evidenceLink ? (
                                                    <div className="text-xs text-text-secondary mb-1">
                                                        Evidence: <a href={task.evidenceLink} target="_blank" className="text-primary underline">View Document</a>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic mb-1">No evidence submitted yet</div>
                                                )}

                                                {/* Actions & Status Messages */}
                                                {isActive && (
                                                    <Link href={`/hr/task/${task.id}`} className="w-full">
                                                        <Button className="w-full" size="sm" variant={task.status === TaskState.REVISION_REQUIRED ? 'danger' : 'primary'}>
                                                            {task.status === TaskState.REVISION_REQUIRED ? 'Revise & Resubmit' : 'Continue Task &rarr;'}
                                                        </Button>
                                                    </Link>
                                                )}

                                                {isCompleted && (
                                                    <div className="rounded-lg bg-green-50 border border-green-100 p-3 flex items-center">
                                                        <svg width="20" height="20" className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        <div>
                                                            <p className="text-sm font-bold text-green-800">Gate Cleared</p>
                                                            <p className="text-xs text-green-700">Next Task Unlocked</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {isUnderReview && (
                                                    <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-3 flex items-center">
                                                        <svg width="20" height="20" className="w-5 h-5 text-yellow-600 mr-2 animate-pulse flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        <div>
                                                            <p className="text-sm font-bold text-yellow-800">Mentor Gate: Pending</p>
                                                            <p className="text-xs text-yellow-700">Approval required to proceed</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {isLocked && (
                                                    <div className="flex items-center text-slate-400 p-2">
                                                        <svg width="16" height="16" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                        <span className="text-sm">Locked</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
