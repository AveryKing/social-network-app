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

  if (!session) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("posts")
    .select("*, author: profiles(*), likes(*)");

  const posts =
    data?.map((post) => ({
      ...post,
      user_has_liked_post: !!post.likes.find(
        (like: any) => like.user_id === session.user.id
      ),
      likes: post.likes.length,
    })) ?? [];
  return (
    <>
      <AuthButtonServer />
      <NewPost />
      {posts?.map((post) => (
        <div key={post.id}>
          <p>
            {post.author.name} {post.author.username}
          </p>
          <p>{post.title}</p>
          <Likes post={post} />
        </div>
      ))}
    </>
  );
}
