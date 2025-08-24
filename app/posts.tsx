"use client";
import { useOptimistic } from "react";
import Likes from "./likes";

export default function Posts({ posts }: { posts: any[] }) {
  return (
    <>
      {posts.map((post) => (
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
