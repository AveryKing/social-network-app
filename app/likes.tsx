"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Likes({ post }: any) {
  const [likesCount, setLikesCount] = useState(post.likes.length);

  const handleLikes = async () => {
    const supabase = createClientComponentClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("likes")
        .insert([{ user_id: user?.id, post_id: post.id }]);
      if (!error) {
        setLikesCount((c) => c + 1);
      }
    }
  };
  return <button onClick={handleLikes}>{likesCount} Likes</button>;
}
