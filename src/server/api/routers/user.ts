import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
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
});
