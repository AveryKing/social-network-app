import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AvatarDropdownClient from "./avatar-dropdown-client";

export default async function AvatarDropdownServer() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let avatarUrl = null;
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", session.user.id)
      .single();
    avatarUrl = profile?.avatar_url || null;
  }

  return <AvatarDropdownClient avatarUrl={avatarUrl} session={session} />;
}
