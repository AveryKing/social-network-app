"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function Likes({ post }: any) {
  const router = useRouter();
  const handleLikes = async () => {
    const supabase = createClientComponentClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      if (post.user_has_liked_post) {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", post.id);
        router.refresh();
      } else {
        await supabase
          .from("likes")
          .insert([{ user_id: user.id, post_id: post.id }]);
        router.refresh();
      }
    }
  };
  return <button onClick={handleLikes}>{post.likes} Likes</button>;
}
