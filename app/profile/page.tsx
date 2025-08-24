import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white/95 dark:bg-zinc-900/95 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-6">
      <img
        src={profile?.avatar_url || "/default-avatar.png"}
        alt={profile?.name || "User avatar"}
        className="w-28 h-28 rounded-full object-cover border-4 border-blue-400 shadow-md mb-2"
      />
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {profile?.name}
      </div>
      <div className="text-zinc-500 text-lg">@{profile?.username}</div>
      <div className="text-zinc-700 dark:text-zinc-300 text-center mt-2">
        {profile?.bio || "No bio yet."}
      </div>
    </div>
  );
}
