"use client";
import { useOptimistic } from "react";
import Likes from "./likes";

export default function Posts({ posts }: { posts: any[] }) {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl shadow-lg p-7 flex flex-col gap-5 border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <a
              href={`/profile/${post.author.username}`}
              className="focus:outline-none group/avatar"
            >
              {post.author.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name || "User avatar"}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm group-hover/avatar:ring-2 group-hover/avatar:ring-blue-400 transition"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg group-hover/avatar:ring-2 group-hover/avatar:ring-blue-400 transition">
                  {post.author.name?.[0] ?? "?"}
                </div>
              )}
            </a>
            <div>
              <a
                href={`/profile/${post.author.username}`}
                className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                {post.author.name}
              </a>
              <div className="text-zinc-500 text-sm">
                @{post.author.username}
              </div>
            </div>
          </div>
          <div className="text-zinc-800 dark:text-zinc-200 text-lg break-words">
            {post.title}
          </div>
          <div className="flex items-center gap-2">
            <Likes post={post} />
          </div>
        </div>
      ))}
    </div>
  );
}
