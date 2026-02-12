"use client";

import { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle, getUser, logout } from "@/lib/auth"; // Assuming getUser checks localStorage
import AdminDashboard from "./components/AdminDashboard";
import PractitionerDashboard from "./components/PractitionerDashboard";
import MentorDashboard from "./components/MentorDashboard";
import { User } from "./types";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID_HERE";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLoginSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const data = await loginWithGoogle(credentialResponse.credential);
        setUser({ id: data.user_id, role: data.role, email: "", name: "" } as User);
        window.location.reload();
      } catch (error) {
        alert("Login Failed");
      }
    }
  };

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <h1 className="text-4xl font-bold mb-8 text-blue-900">HRX CORE</h1>
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-xl mb-6">Sign In to Continue</h2>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => {
                console.log('Login Failed');
              }}
              useOneTap
            />
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8 bg-white p-4 shadow-sm rounded">
        <h1 className="text-3xl font-bold text-gray-800">HRX CORE</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {user.role}
          </span>
          <button
            onClick={() => logout()}
            className="text-red-500 text-sm hover:underline font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      {user.role === 'admin' && <AdminDashboard user={user} />}
      {user.role === 'practitioner' && <PractitionerDashboard user={user} />}
      {user.role === 'mentor' && <MentorDashboard user={user} />}
    </main>
  );
}
