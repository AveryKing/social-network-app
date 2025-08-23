import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthButtonServer from "./auth-button-server";
import { redirect } from "next/navigation";
import NewPost from "./new-post";
import Likes from "./likes";

export default async function Home() {
  const supabase = createServerComponentClient<any>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(*), likes(*)");

  if (!session) {
    redirect("/login");
  }
  return (
    <>
      <AuthButtonServer />
      <NewPost />
      {posts?.map((post) => (
        <div key={post.id}>
          <p>
            {post.profiles.name} {post.profiles.username}
          </p>
          <p>{post.title}</p>
          <Likes post={post} />
        </div>
      ))}
    </>
  );
}
