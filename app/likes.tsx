"use client";
import React from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function Likes({ post, addOptimisticPost }: any) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const handleLikes = async () => {
    if (loading) return;
    setLoading(true);
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
    setLoading(false);
  };
  return (
    <button
      onClick={handleLikes}
      disabled={loading}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-pink-50 dark:hover:bg-pink-900 transition-colors text-zinc-700 dark:text-zinc-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400/40 ${
        loading ? "opacity-60 pointer-events-none" : ""
      }`}
      aria-label="Like post"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={post.user_has_liked_post ? "#ec4899" : "none"}
        viewBox="0 0 20 20"
        strokeWidth={1.5}
        stroke="#ec4899"
        className="w-5 h-5 mr-1 drop-shadow-sm"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 17.5l-1.45-1.32C4.4 12.36 2 10.28 2 7.5 2 5.5 3.5 4 5.5 4c1.54 0 3.04 1.04 3.57 2.36h1.87C11.46 5.04 12.96 4 14.5 4 16.5 4 18 5.5 18 7.5c0 2.78-2.4 4.86-6.55 8.68L10 17.5z"
        />
      </svg>
      <span className="ml-0.5 text-base font-semibold tracking-tight">
        {post.likes}
      </span>
    </button>
  );
}
