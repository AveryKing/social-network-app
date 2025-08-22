import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import AuthButton from "./auth-button";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: posts } = await supabase.from("posts").select();

  const handleLogin = async () => {
    console.log("Login button clicked");
  };
  return (
    <>
      <AuthButton />
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </>
  );
}
