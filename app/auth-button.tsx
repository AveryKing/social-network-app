"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthButton() {
  const supabase = createClientComponentClient();
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "github" });
  };
  return <button onClick={handleLogin}>Login</button>;
}
