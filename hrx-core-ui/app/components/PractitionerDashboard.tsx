"use client";

import { useState, useEffect } from "react";
import { User, Intervention, ExecutionStep } from "@/app/types";
import { getInterventions, startStage, addEvidence, submitStage } from "@/lib/api";

interface PractitionerDashboardProps {
    user: User;
}

export default function PractitionerDashboard({ user }: PractitionerDashboardProps) {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(false);
    const [evidenceLinks, setEvidenceLinks] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        loadInterventions();
    }, []);

    const loadInterventions = async () => {
        try {
            // filtering by user would happen on backend ideally, doing client-side for now as per minimal UI
            const data = await getInterventions();
            // Filter for this practitioner
            // const myInterventions = data.filter(i => i.assigned_practitioner_id === user.id);
            // For demo purposes, show all or let them pick
            setInterventions(data);
        } catch (error) {
            console.error("Failed to load interventions", error);
        }
    };

    const handleStartStage = async (stageId: number) => {
        setLoading(true);
        try {
            await startStage(stageId, user.id);
            loadInterventions();
        } catch (error) {
            alert("Failed to start stage");
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvidence = async (stageId: number) => {
        const link = evidenceLinks[stageId];
        if (!link) return;

        setLoading(true);
        try {
            await addEvidence(stageId, link, user.id);
            setEvidenceLinks({ ...evidenceLinks, [stageId]: "" });
            loadInterventions();
        } catch (error) {
            // @ts-ignore
            alert("Failed to add evidence: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitStage = async (stageId: number) => {
        setLoading(true);
        try {
            await submitStage(stageId, user.id);
            loadInterventions();
        } catch (error) {
            // @ts-expect-error
            alert("Failed to submit stage: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Practitioner Dashboard</h2>
            <div className="mb-4">
                <button
                    onClick={async () => {
                        try {
                            const res = await fetch(`http://127.0.0.1:8000/api/v1/portfolio/master/my-portfolio?practitioner_id=${user.id}`);
                            const data = await res.json();
                            if (data.public_slug) {
                                window.open(`/profile/${data.public_slug}`, '_blank');
                            } else {
                                alert("Failed to load portfolio");
                            }
                        } catch (e) {
                            alert("Error loading portfolio");
                        }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
                >
                    View Master Portfolio
                </button>
            </div>

            <div className="space-y-8">
                {interventions.map((int) => (
                    <div key={int.id} className="border p-6 rounded shadow-md bg-white">
                        <h3 className="text-xl font-bold mb-4">{int.name}</h3>

                        <div className="space-y-6">
                            {int.stages?.sort((a, b) => a.order - b.order).map((stage) => (
                                <div key={stage.id} className={`p-4 border-l-4 rounded ${stage.status === 'approved' ? 'border-green-500 bg-green-50' :
                                    stage.status === 'in_progress' ? 'border-blue-500 bg-blue-50' :
                                        stage.status === 'submitted' ? 'border-yellow-500 bg-yellow-50' :
                                            stage.status === 'rework' ? 'border-red-500 bg-red-50' :
                                                'border-gray-300 bg-gray-50 text-gray-400'
                                    }`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-lg">{stage.order}. {stage.name}</h4>
                                        <span className="text-xs uppercase font-bold tracking-wider px-2 py-1 rounded bg-white border">
                                            {stage.status.replace("_", " ")}
                                        </span>
                                    </div>

                                    {/* Actions based on status */}
                                    {stage.status === 'locked' && int.stages.find(s => s.order === stage.order - 1)?.status === 'approved' && (
                                        <button onClick={() => handleStartStage(stage.id)} disabled={loading} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Start Stage</button>
                                    )}

                                    {(stage.status === 'in_progress' || stage.status === 'rework') && (
                                        <div className="mt-4 space-y-4">
                                            {/* Steps */}
                                            {stage.execution_steps?.length > 0 && (
                                                <div className="bg-white p-3 rounded border">
                                                    <p className="font-medium text-sm mb-2">Execution Steps:</p>
                                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                                        {stage.execution_steps.map(step => (
                                                            <li key={step.id}>
                                                                <span className="font-medium">{step.title}</span>
                                                                {step.guidance_text && <p className="text-gray-500 text-xs">{step.guidance_text}</p>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Evidence */}
                                            <div>
                                                <p className="font-medium text-sm mb-1">Evidence Links:</p>
                                                <ul className="text-sm list-decimal pl-5 mb-2">
                                                    {stage.evidence_links?.map((link, i) => (
                                                        <li key={i}><a href={link} target="_blank" className="text-blue-600 underline">{link}</a></li>
                                                    ))}
                                                </ul>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Paste Google Drive link..."
                                                        className="border p-1 text-sm flex-1 rounded"
                                                        value={evidenceLinks[stage.id] || ""}
                                                        onChange={(e) => setEvidenceLinks({ ...evidenceLinks, [stage.id]: e.target.value })}
                                                    />
                                                    <button onClick={() => handleAddEvidence(stage.id)} disabled={loading} className="bg-gray-800 text-white text-sm px-3 py-1 rounded">Add</button>
                                                </div>
                                            </div>

                                            {/* Submit */}
                                            <div className="pt-2">
                                                <button onClick={() => handleSubmitStage(stage.id)} disabled={loading} className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700">Submit for Review</button>
                                            </div>
                                        </div>
                                    )}

                                    {stage.status === 'rework' && stage.mentor_feedback && (
                                        <div className="mt-2 p-2 bg-red-100 text-red-800 text-sm rounded border border-red-200">
                                            <strong>Mentor Feedback:</strong> {stage.mentor_feedback}
                                        </div>
                                    )}

                                    {stage.status === 'approved' && (
                                        <div className="mt-2 p-2 bg-green-100 text-green-800 text-sm rounded border border-green-200">
                                            <strong>Rating:</strong> {stage.rating}/5 <br />
                                            {stage.mentor_feedback && <span><strong>Feedback:</strong> {stage.mentor_feedback}</span>}
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {interventions.length === 0 && <p>No interventions found.</p>}
            </div>
        </div>
    );
}
