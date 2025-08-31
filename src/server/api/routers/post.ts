import { z } from "zod";
import { eq, and, count } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts, likes } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const allPosts = await ctx.db.query.posts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        likes: {
          columns: {
            userId: true,
          },
        },
      },
    });

    // Transform posts to include like counts and user's like status
    const postsWithLikes = allPosts.map((post) => ({
      ...post,
      likeCount: post.likes.length,
      isLikedByUser: 
        ctx.session?.user?.id
          ? post.likes.some((like) => like.userId === ctx.session!.user.id)
          : false,
      likes: undefined, // Remove the likes array from response
    }));

    return postsWithLikes;
  }),

  getUserPosts: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userPosts = await ctx.db.query.posts.findMany({
        where: (posts, { eq }) => eq(posts.createdById, input.userId),
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          likes: {
            columns: {
              userId: true,
            },
          },
        },
      });

      // Transform posts to include like counts and user's like status
      const postsWithLikes = userPosts.map((post) => ({
        ...post,
        likeCount: post.likes.length,
        isLikedByUser: 
          ctx.session?.user?.id
            ? post.likes.some((like) => like.userId === ctx.session!.user.id)
            : false,
        likes: undefined, // Remove the likes array from response
      }));

      return postsWithLikes;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the post
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { eq, and }) =>
          and(
            eq(posts.id, input.id),
            eq(posts.createdById, ctx.session.user.id),
          ),
      });

      if (!post) {
        throw new Error(
          "Post not found or you don't have permission to edit it",
        );
      }

      await ctx.db
        .update(posts)
        .set({ name: input.name })
        .where(eq(posts.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the post
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { eq, and }) =>
          and(
            eq(posts.id, input.id),
            eq(posts.createdById, ctx.session.user.id),
          ),
      });

      if (!post) {
        throw new Error(
          "Post not found or you don't have permission to delete it",
        );
      }

      await ctx.db.delete(posts).where(eq(posts.id, input.id));
    }),

  like: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if post exists
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, input.postId),
      });

      if (!post) {
        throw new Error("Post not found");
      }

      // Check if user already liked this post
      const existingLike = await ctx.db.query.likes.findFirst({
        where: (likes, { eq, and }) =>
          and(
            eq(likes.postId, input.postId),
            eq(likes.userId, ctx.session.user.id),
          ),
      });

      if (existingLike) {
        throw new Error("You have already liked this post");
      }

      // Add the like
      await ctx.db.insert(likes).values({
        postId: input.postId,
        userId: ctx.session.user.id,
      });
    }),

  unlike: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Remove the like
      await ctx.db
        .delete(likes)
        .where(
          and(
            eq(likes.postId, input.postId),
            eq(likes.userId, ctx.session.user.id),
          ),
        );
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
