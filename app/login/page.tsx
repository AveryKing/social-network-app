
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthButtonClient from "../auth-button-client";
import { Database } from "@/lib/database.types";

export default async function Login() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    redirect("/");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 border border-zinc-100 dark:border-zinc-800">
        <div className="text-3xl font-extrabold text-blue-600 mb-2">Sign In</div>
        <div className="text-zinc-600 dark:text-zinc-300 mb-4 text-center max-w-xs">
          Welcome! Sign in to your SocialNet account to continue.
        </div>
        <AuthButtonClient session={session} />
      </div>
    </div>
  );
}
