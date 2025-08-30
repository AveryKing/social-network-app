import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

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
      },
    });

    return allPosts;
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

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
