import { supabase } from "./supabase";

export function initAuthListener() {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
      console.log("User signed in:", session?.user.email);
      window.location.href = "/dashboard";
    }
  });
}
