import { users, follows } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, ctx.session.user.id),
    });
    return user ?? null;
  }),

  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, ctx.session.user.id),
    });
    return user ?? null;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input.id),
      });

      if (!user) return null;

      // Get follower and following counts
      const [followerCount, followingCount, isFollowing] = await Promise.all([
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followingId, input.id)),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followerId, input.id)),
        ctx.session?.user
          ? ctx.db.query.follows.findFirst({
              where: and(
                eq(follows.followerId, ctx.session.user.id),
                eq(follows.followingId, input.id),
              ),
            })
          : null,
      ]);

      return {
        ...user,
        followerCount: followerCount[0]?.count ?? 0,
        followingCount: followingCount[0]?.count ?? 0,
        isFollowing: !!isFollowing,
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().nullable().optional(),
        bio: z.string().nullable().optional(),
        location: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          name: input.name,
          bio: input.bio,
          location: input.location,
        })
        .where(eq(users.id, ctx.session.user.id));

      const updatedUser = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ctx.session.user.id),
      });

      return updatedUser;
    }),
  finishOnboarding: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        email: z.string().email(),
        location: z.string().optional(),
        photoUrl: z.string().url().optional(),
        bio: z.string().max(160).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // ✅ Update user record
      await ctx.db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          location: input.location,
          image: input.photoUrl,
          bio: input.bio,
          onboardingComplete: true, // mark onboarding done
        })
        .where(eq(users.id, ctx.session.user.id));

      // return updated user
      const updatedUser = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ctx.session.user.id),
      });

      return updatedUser;
    }),
  updateProfilePhoto: protectedProcedure
    .input(z.object({ photoUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          image: input.photoUrl,
        })
        .where(eq(users.id, ctx.session.user.id));
    }),

  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Prevent following yourself
      if (input.userId === ctx.session.user.id) {
        throw new Error("You cannot follow yourself");
      }

      // Check if already following
      const existingFollow = await ctx.db.query.follows.findFirst({
        where: and(
          eq(follows.followerId, ctx.session.user.id),
          eq(follows.followingId, input.userId),
        ),
      });

      if (existingFollow) {
        throw new Error("Already following this user");
      }

      // Create follow relationship
      await ctx.db.insert(follows).values({
        followerId: ctx.session.user.id,
        followingId: input.userId,
      });

      return { success: true };
    }),

  unfollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, ctx.session.user.id),
            eq(follows.followingId, input.userId),
          ),
        );

      return { success: true };
    }),

  getFollowers: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const followers = await ctx.db.query.follows.findMany({
        where: eq(follows.followingId, input.userId),
        with: {
          follower: true,
        },
      });

      return followers.map((follow) => follow.follower);
    }),

  getFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const following = await ctx.db.query.follows.findMany({
        where: eq(follows.followerId, input.userId),
        with: {
          following: true,
        },
      });

      return following.map((follow) => follow.following);
    }),
});
