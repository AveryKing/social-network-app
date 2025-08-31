import { z } from "zod";
import { and, eq, or } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { friendRequests, friendships, users } from "~/server/db/schema";

export const friendRouter = createTRPCRouter({
  // Send a friend request
  sendRequest: protectedProcedure
    .input(z.object({ receiverId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { receiverId } = input;
      const senderId = ctx.session.user.id;

      // Check if users are already friends
      const existingFriendship = await ctx.db.query.friendships.findFirst({
        where: or(
          and(
            eq(friendships.user1Id, senderId),
            eq(friendships.user2Id, receiverId),
          ),
          and(
            eq(friendships.user1Id, receiverId),
            eq(friendships.user2Id, senderId),
          ),
        ),
      });

      if (existingFriendship) {
        throw new Error("Users are already friends");
      }

      // Check if request already exists
      const existingRequest = await ctx.db.query.friendRequests.findFirst({
        where: and(
          eq(friendRequests.senderId, senderId),
          eq(friendRequests.receiverId, receiverId),
          eq(friendRequests.status, "pending"),
        ),
      });

      if (existingRequest) {
        throw new Error("Friend request already sent");
      }

      // Create friend request
      return ctx.db.insert(friendRequests).values({
        senderId,
        receiverId,
        status: "pending",
      });
    }),

  // Accept a friend request
  acceptRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { requestId } = input;
      const userId = ctx.session.user.id;

      // Get the friend request
      const request = await ctx.db.query.friendRequests.findFirst({
        where: and(
          eq(friendRequests.id, requestId),
          eq(friendRequests.receiverId, userId),
          eq(friendRequests.status, "pending"),
        ),
      });

      if (!request) {
        throw new Error("Friend request not found");
      }

      // Update request status
      await ctx.db
        .update(friendRequests)
        .set({ status: "accepted" })
        .where(eq(friendRequests.id, requestId));

      // Create friendship (always put smaller user ID first for consistency)
      const user1Id = request.senderId < userId ? request.senderId : userId;
      const user2Id = request.senderId < userId ? userId : request.senderId;

      return ctx.db.insert(friendships).values({
        user1Id,
        user2Id,
      });
    }),

  // Decline a friend request
  declineRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { requestId } = input;
      const userId = ctx.session.user.id;

      return ctx.db
        .update(friendRequests)
        .set({ status: "declined" })
        .where(
          and(
            eq(friendRequests.id, requestId),
            eq(friendRequests.receiverId, userId),
            eq(friendRequests.status, "pending"),
          ),
        );
    }),

  // Remove a friend
  removeFriend: protectedProcedure
    .input(z.object({ friendId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { friendId } = input;
      const userId = ctx.session.user.id;

      return ctx.db
        .delete(friendships)
        .where(
          or(
            and(
              eq(friendships.user1Id, userId),
              eq(friendships.user2Id, friendId),
            ),
            and(
              eq(friendships.user1Id, friendId),
              eq(friendships.user2Id, userId),
            ),
          ),
        );
    }),

  // Get pending friend requests (received)
  getPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.query.friendRequests.findMany({
      where: and(
        eq(friendRequests.receiverId, userId),
        eq(friendRequests.status, "pending"),
      ),
      with: {
        sender: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: (friendRequests, { desc }) => [desc(friendRequests.createdAt)],
    });
  }),

  // Get sent friend requests
  getSentRequests: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.query.friendRequests.findMany({
      where: and(
        eq(friendRequests.senderId, userId),
        eq(friendRequests.status, "pending"),
      ),
      with: {
        receiver: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: (friendRequests, { desc }) => [desc(friendRequests.createdAt)],
    });
  }),

  // Get friends list
  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const friendships = await ctx.db.query.friendships.findMany({
      where: or(
        eq(friendships.user1Id, userId),
        eq(friendships.user2Id, userId),
      ),
      with: {
        user1: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        user2: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: (friendships, { desc }) => [desc(friendships.createdAt)],
    });

    // Map to return the friend (not the current user)
    return friendships.map((friendship) => {
      const friend =
        friendship.user1Id === userId ? friendship.user2 : friendship.user1;
      return {
        ...friend,
        friendshipCreatedAt: friendship.createdAt,
      };
    });
  }),

  // Check friendship status with a user
  getFriendshipStatus: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId: targetUserId } = input;
      const currentUserId = ctx.session.user.id;

      if (currentUserId === targetUserId) {
        return { status: "self" };
      }

      // Check if they are friends
      const friendship = await ctx.db.query.friendships.findFirst({
        where: or(
          and(
            eq(friendships.user1Id, currentUserId),
            eq(friendships.user2Id, targetUserId),
          ),
          and(
            eq(friendships.user1Id, targetUserId),
            eq(friendships.user2Id, currentUserId),
          ),
        ),
      });

      if (friendship) {
        return { status: "friends", friendshipId: friendship.id };
      }

      // Check for pending request sent by current user
      const sentRequest = await ctx.db.query.friendRequests.findFirst({
        where: and(
          eq(friendRequests.senderId, currentUserId),
          eq(friendRequests.receiverId, targetUserId),
          eq(friendRequests.status, "pending"),
        ),
      });

      if (sentRequest) {
        return { status: "request_sent", requestId: sentRequest.id };
      }

      // Check for pending request received from target user
      const receivedRequest = await ctx.db.query.friendRequests.findFirst({
        where: and(
          eq(friendRequests.senderId, targetUserId),
          eq(friendRequests.receiverId, currentUserId),
          eq(friendRequests.status, "pending"),
        ),
      });

      if (receivedRequest) {
        return { status: "request_received", requestId: receivedRequest.id };
      }

      return { status: "none" };
    }),

  // Search for users to add as friends
  searchUsers: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { query } = input;
      const currentUserId = ctx.session.user.id;

      // Search users by name or email
      const searchResults = await ctx.db.query.users.findMany({
        where: or(eq(users.name, query), eq(users.email, query)),
        columns: {
          id: true,
          name: true,
          image: true,
          email: true,
        },
        limit: 10,
      });

      // Filter out current user
      return searchResults.filter((user) => user.id !== currentUserId);
    }),
});
