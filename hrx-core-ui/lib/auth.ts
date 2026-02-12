export const loginWithGoogle = async (tokenId: string) => {
    try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/auth/google", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: tokenId }),
        });

        if (!res.ok) {
            throw new Error("Login failed");
        }

        const data = await res.json();
        // Store Token
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify({
            id: data.user_id,
            role: data.role
        }));

        return data;
    } catch (error) {
        console.error("Auth Error:", error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
};

export const getUser = () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
};

export const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
};
