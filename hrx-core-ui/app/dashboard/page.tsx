"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getUsers } from "@/lib/api";
import { User } from "@/app/types";
import AdminDashboard from "@/app/components/AdminDashboard";
import PractitionerDashboard from "@/app/components/PractitionerDashboard";
import MentorDashboard from "@/app/components/MentorDashboard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth");
        return;
      }
      setSessionUser(data.user);

      // Fetch app user by email
      try {
        const users = await getUsers();
        const match = users.find(u => u.email === data.user.email);
        if (match) {
          setAppUser(match);
        } else {
          console.warn("User login successful but no matching app user found for email:", data.user.email);
        }
      } catch (error) {
        console.error("Failed to fetch app users", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!appUser) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>No account found for {sessionUser?.email}. Please contact an administrator.</p>
        <button onClick={logout} className="mt-4 bg-gray-800 text-white px-4 py-2 rounded">Logout</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">HRX CORE</h1>
            <p className="text-gray-600">Logged in as {appUser.name} ({appUser.role})</p>
          </div>
          <button
            onClick={logout}
            className="text-sm border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded text-red-600"
          >
            Sign Out
          </button>
        </div>

        {appUser.role === 'admin' && <AdminDashboard user={appUser} />}
        {appUser.role === 'practitioner' && <PractitionerDashboard user={appUser} />}
        {appUser.role === 'mentor' && <MentorDashboard user={appUser} />}

      </div>
    </div>
  );
}
