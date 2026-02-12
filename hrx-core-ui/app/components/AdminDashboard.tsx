"use client";

import { useState, useEffect } from "react";
import { User, Intervention } from "@/app/types";
import { getInterventions, createIntervention, createStage } from "@/lib/api";

interface AdminDashboardProps {
    user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [newInterventionName, setNewInterventionName] = useState("");
    const [loading, setLoading] = useState(false);

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

    const handleCreateIntervention = async () => {
        if (!newInterventionName) return;
        setLoading(true);
        try {
            const newInt = await createIntervention({ name: newInterventionName, status: "active" });

            // Auto-create 5 HRX Execution System stages
            const stages = ["Discover", "Quantify", "Diagnose", "Execute", "Sustain"];
            for (let i = 0; i < stages.length; i++) {
                await createStage(newInt.id, { name: stages[i], order: i + 1, status: "locked" });
            }

            setNewInterventionName("");
            loadInterventions();
        } catch (error) {
            console.error("Failed to create intervention", error);
            alert("Failed to create intervention");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

            <div className="mb-8 p-4 border rounded bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Create New Intervention</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newInterventionName}
                        onChange={(e) => setNewInterventionName(e.target.value)}
                        placeholder="Intervention Name"
                        className="border p-2 rounded flex-1"
                    />
                    <button
                        onClick={handleCreateIntervention}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Existing Interventions</h3>
                <div className="space-y-4">
                    {interventions.map((int) => (
                        <div key={int.id} className="border p-4 rounded shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-lg">{int.name}</span>
                                <span className="text-sm px-2 py-1 bg-gray-200 rounded">{int.status}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                Stages: {int.stages?.length || 0} |
                                Practitioner: {int.assigned_practitioner_id || "Unassigned"} |
                                Mentor: {int.assigned_mentor_id || "Unassigned"}
                            </div>
                        </div>
                    ))}
                    {interventions.length === 0 && <p className="text-gray-500">No interventions found.</p>}
                </div>
            </div>
        </div>
    );
}
