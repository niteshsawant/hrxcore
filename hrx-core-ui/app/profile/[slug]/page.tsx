"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface PortfolioIntervention {
    id: int;
    name: string;
    cost_saved: number;
    productivity_gain: number;
}

interface MasterPortfolio {
    practitioner_name: string;
    public_slug: string;
    total_interventions: number;
    avg_rating: number;
    total_cost_saved: number;
    total_productivity_gain: number;
    last_updated: string;
    pdf_url: string | null;
    interventions: PortfolioIntervention[];
}

export default function ProfilePage() { // Removed { params } as using useParams hook is safer in client components usually, but Next.js app dir passes params. Let's use params prop if server component, but this is "use client" so let's use unwrapped params if possible or hook.
    // Actually in Next.js 13+ App Router, page props have params.
    // adhering to standard pattern for "client" component simplicity -> useParams?
    // Let's rely on standard Next.js page props for simplicity if I knew the version.
    // Assuming standard "use client" generic.
    const params = useParams();
    const slug = params?.slug as string;

    const [portfolio, setPortfolio] = useState<MasterPortfolio | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            loadPortfolio(slug);
        }
    }, [slug]);

    const loadPortfolio = async (slug: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/v1/profile/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setPortfolio(data);
            } else {
                console.error("Failed to load portfolio");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading Profile...</div>;
    if (!portfolio) return <div className="p-8">Portfolio not found.</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 font-sans">
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900">{portfolio.practitioner_name}</h1>
                <p className="text-gray-600">Master HRX Portfolio</p>
                <div className="mt-2 text-xs text-gray-400">Last Verified: {new Date(portfolio.last_updated).toLocaleString()}</div>
            </header>

            {/* Impact Summary */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded text-center border border-blue-100">
                    <div className="text-2xl font-bold text-blue-700">{portfolio.total_interventions}</div>
                    <div className="text-sm text-blue-600">Interventions</div>
                </div>
                <div className="bg-green-50 p-4 rounded text-center border border-green-100">
                    <div className="text-2xl font-bold text-green-700">${portfolio.total_cost_saved.toLocaleString()}</div>
                    <div className="text-sm text-green-600">Cost Saved</div>
                </div>
                <div className="bg-purple-50 p-4 rounded text-center border border-purple-100">
                    <div className="text-2xl font-bold text-purple-700">{portfolio.total_productivity_gain}hrs</div>
                    <div className="text-sm text-purple-600">Prod. Gain</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded text-center border border-yellow-100">
                    <div className="text-2xl font-bold text-yellow-700">{portfolio.avg_rating} / 5.0</div>
                    <div className="text-sm text-yellow-600">Avg Rating</div>
                </div>
            </section>

            {/* Verified Interventions List */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Verified Interventions</h2>
                <div className="bg-white shadow rounded overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-medium">Intervention</th>
                                <th className="p-4 font-medium">Cost Saved</th>
                                <th className="p-4 font-medium">Prod. Gain</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolio.interventions.map((int) => (
                                <tr key={int.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4">{int.name}</td>
                                    <td className="p-4 text-green-600 font-medium">${int.cost_saved.toLocaleString()}</td>
                                    <td className="p-4 text-purple-600">{int.productivity_gain} hrs</td>
                                </tr>
                            ))}
                            {portfolio.interventions.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">No completed interventions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Download PDF */}
            <div className="text-center">
                {portfolio.pdf_url ? (
                    <a
                        href={portfolio.pdf_url}
                        target="_blank"
                        className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                    >
                        Download Official Master Portfolio (PDF)
                    </a>
                ) : (
                    <button disabled className="bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed">
                        PDF Generating...
                    </button>
                )}
            </div>
        </div>
    );
}
