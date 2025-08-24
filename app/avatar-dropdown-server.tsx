import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AvatarDropdown from "./avatar-dropdown";
import { Database } from "../lib/database.types";

export default async function AvatarDropdownServer() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  return <AvatarDropdown session={session} profile={profile} />;
}
