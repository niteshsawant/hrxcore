"use client";

import { useState, useEffect } from "react";
import { User, Intervention } from "@/app/types";
import { getInterventions, reviewStage } from "@/lib/api";

interface MentorDashboardProps {
    user: User;
}

export default function MentorDashboard({ user }: MentorDashboardProps) {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ [key: number]: string }>({});
    const [rating, setRating] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        loadInterventions();
    }, []);

    const loadInterventions = async () => {
        try {
            const data = await getInterventions();
            setInterventions(data);
        } catch (error) {
            console.error("Failed to load interventions", error);
        }
    };

    const handleReview = async (stageId: number, action: "approve" | "rework") => {
        setLoading(true);
        try {
            await reviewStage(
                stageId,
                user.id,
                action,
                feedback[stageId],
                rating[stageId]
            );
            loadInterventions();
        } catch (error) {
            alert("Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    // derived state for stages needing review
    const stagesToReview = interventions.flatMap(int =>
        int.stages
            .filter(s => s.status === 'submitted')
            .map(s => ({ ...s, interventionName: int.name }))
    );

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Mentor Dashboard</h2>

            <div className="space-y-6">
                <h3 className="text-lg font-semibold">Stages Needing Review ({stagesToReview.length})</h3>

                {stagesToReview.map(stage => (
                    <div key={stage.id} className="border p-4 rounded shadow-sm bg-yellow-50 border-yellow-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg">{stage.name}</h4>
                                <p className="text-gray-600 text-sm">{stage.interventionName}</p>
                            </div>
                            <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded font-bold">SUBMITTED</span>
                        </div>

                        <div className="mb-4">
                            <p className="font-medium text-sm mb-2">Evidence:</p>
                            {stage.evidence_links && stage.evidence_links.length > 0 ? (
                                <ul className="list-disc pl-5">
                                    {stage.evidence_links.map((link, i) => (
                                        <li key={i}><a href={link} target="_blank" className="text-blue-600 underline text-sm">{link}</a></li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-red-500 text-sm">No evidence links provided!</p>
                            )}
                        </div>

                        <div className="bg-white p-4 rounded border space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                                <select
                                    className="border p-2 rounded w-20"
                                    value={rating[stage.id] || 5}
                                    onChange={(e) => setRating({ ...rating, [stage.id]: parseInt(e.target.value) })}
                                >
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Feedback</label>
                                <textarea
                                    className="border p-2 rounded w-full text-sm"
                                    rows={3}
                                    placeholder="Provide feedback..."
                                    value={feedback[stage.id] || ""}
                                    onChange={(e) => setFeedback({ ...feedback, [stage.id]: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => handleReview(stage.id, "approve")}
                                    disabled={loading}
                                    className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReview(stage.id, "rework")}
                                    disabled={loading}
                                    className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700"
                                >
                                    Request Rework
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {stagesToReview.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 border border-dashed rounded text-gray-400">
                        No stages pending review.
                    </div>
                )}
            </div>
        </div>
    );
}
