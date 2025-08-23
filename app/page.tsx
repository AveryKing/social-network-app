import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthButtonServer from "./auth-button-server";
import { redirect } from "next/navigation";
import NewPost from "./new-post";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data: posts } = await supabase.from("posts").select("*, profiles(*)");

  if (!session) {
    redirect("/login");
  }
  return (
    <>
      <AuthButtonServer />
      <NewPost />
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </>
  );
}
