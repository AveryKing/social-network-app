"use client";

import {
  Container,
  VStack,
  Box,
  Text,
  Skeleton,
  SkeletonText,
  HStack,
  Avatar,
  IconButton,
  Button,
  Textarea,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { FaEdit, FaTrash, FaHeart } from "react-icons/fa";
import CreatePost from "./create-post";
import Link from "next/link";

type User = {
  name: string | null;
  image: string | null;
  id: string;
  email: string;
  emailVerified: Date | null;
  onboardingComplete: boolean;
};

type Post = {
  id: number;
  name: string | null;
  createdAt: Date;
  likeCount: number;
  isLikedByUser: boolean;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

// Skeleton loading component using Chakra UI
function PostSkeleton() {
  return (
    <Box
      bg="whiteAlpha.50"
      borderRadius="xl"
      p={6}
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
    >
      <HStack gap={3}>
        {/* Avatar skeleton */}
        <Skeleton borderRadius="full" width="40px" height="40px" />

        <Box flex={1}>
          {/* Author name skeleton */}
          <Skeleton height="20px" width="120px" mb={2} />

          {/* Date skeleton */}
          <Skeleton height="14px" width="80px" mb={3} />

          {/* Content skeleton */}
          <SkeletonText mt={4} noOfLines={3} />
        </Box>
      </HStack>
    </Box>
  );
}

// Skeleton for create post area
function CreatePostSkeleton() {
  return (
    <Box
      bg="whiteAlpha.50"
      borderRadius="xl"
      p={6}
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
    >
      <HStack gap={3}>
        {/* Avatar skeleton */}
        <Skeleton borderRadius="full" width="48px" height="48px" />
        {/* Input skeleton */}
        <Box flex={1}>
          <Skeleton height="50px" borderRadius="lg" />
        </Box>
      </HStack>
    </Box>
  );
}

function PostItem({
  post,
  currentUserId,
  onPostUpdated,
}: {
  post: Post;
  currentUserId: string | null;
  onPostUpdated: () => void;
}) {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.name ?? "");
  const [isFollowing, setIsFollowing] = useState(false);

  const updatePost = api.post.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      onPostUpdated();
    },
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      onPostUpdated();
    },
  });

  const likePost = api.post.like.useMutation({
    onSuccess: () => {
      onPostUpdated();
    },
  });

  const unlikePost = api.post.unlike.useMutation({
    onSuccess: () => {
      onPostUpdated();
    },
  });

  const followUser = api.user.follow.useMutation({
    onSuccess: () => {
      setIsFollowing(true);
    },
  });

  const unfollowUser = api.user.unfollow.useMutation({
    onSuccess: () => {
      setIsFollowing(false);
    },
  });

  // Check if user is following this post author
  const { data: userData } = api.user.getById.useQuery(
    { id: post.createdBy.id },
    {
      enabled: !!currentUserId && post.createdBy.id !== currentUserId,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (userData?.isFollowing !== undefined) {
      setIsFollowing(userData.isFollowing);
    }
  }, [userData?.isFollowing]);

  useEffect(() => {
    setFormattedDate(new Date(post.createdAt).toLocaleDateString());
  }, [post.createdAt]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(post.name ?? "");
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await updatePost.mutateAsync({
      id: post.id,
      name: editContent.trim(),
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost.mutateAsync({ id: post.id });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.name ?? "");
  };

  const handleLike = async () => {
    if (!currentUserId) return;

    if (post.isLikedByUser) {
      await unlikePost.mutateAsync({ postId: post.id });
    } else {
      await likePost.mutateAsync({ postId: post.id });
    }
  };

  const isOwner = currentUserId === post.createdBy.id;

  return (
    <Box
      bg="whiteAlpha.50"
      borderRadius="xl"
      p={6}
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
    >
      <HStack gap={3} align="start">
        <Avatar.Root size="md">
          <Avatar.Image
            src={post.createdBy.image ?? undefined}
            alt={post.createdBy.name ?? "Anonymous"}
          />
          <Avatar.Fallback>
            {(post.createdBy.name ?? "A").charAt(0)}
          </Avatar.Fallback>
        </Avatar.Root>
        <Box flex={1}>
          <HStack justify="space-between" align="start">
            <Box flex={1}>
              <HStack align="center" gap={2}>
                <Link href={`/user/${post.createdBy.id}`}>
                  <Text
                    fontWeight="bold"
                    color="white"
                    _hover={{ color: "blue.300", cursor: "pointer" }}
                    transition="color 0.2s"
                  >
                    {post.createdBy.name ?? "Anonymous"}
                  </Text>
                </Link>
                {currentUserId && post.createdBy.id !== currentUserId && (
                  <Button
                    size="xs"
                    variant={isFollowing ? "outline" : "solid"}
                    colorScheme={isFollowing ? "gray" : "blue"}
                    onClick={async () => {
                      if (isFollowing) {
                        await unfollowUser.mutateAsync({
                          userId: post.createdBy.id,
                        });
                      } else {
                        await followUser.mutateAsync({
                          userId: post.createdBy.id,
                        });
                      }
                    }}
                    loading={followUser.isPending || unfollowUser.isPending}
                    px={2}
                    py={1}
                    fontSize="xs"
                    h="auto"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </HStack>
              <Text color="whiteAlpha.700" fontSize="sm" mb={3}>
                {formattedDate || "Loading..."}
              </Text>
            </Box>

            {isOwner && (
              <HStack gap={1}>
                <IconButton
                  aria-label="Edit post"
                  size="sm"
                  variant="ghost"
                  color="whiteAlpha.600"
                  _hover={{ color: "white", bg: "whiteAlpha.200" }}
                  onClick={handleEdit}
                  disabled={isEditing}
                >
                  <FaEdit />
                </IconButton>
                <IconButton
                  aria-label="Delete post"
                  size="sm"
                  variant="ghost"
                  color="whiteAlpha.600"
                  _hover={{ color: "red.400", bg: "whiteAlpha.200" }}
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                >
                  <FaTrash />
                </IconButton>
              </HStack>
            )}
          </HStack>

          {isEditing ? (
            <VStack align="stretch" gap={3}>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                bg="whiteAlpha.100"
                border="1px solid"
                borderColor="whiteAlpha.300"
                color="white"
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                }}
                maxLength={280}
              />
              <HStack justify="space-between">
                <Text fontSize="sm" color="whiteAlpha.600">
                  {editContent.length}/280
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    color="whiteAlpha.700"
                    _hover={{ color: "white", bg: "whiteAlpha.200" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleSaveEdit}
                    disabled={
                      updatePost.isPending ||
                      !editContent.trim() ||
                      editContent.length > 280
                    }
                  >
                    Save
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          ) : (
            <Text color="white" lineHeight="tall">
              {post.name}
            </Text>
          )}

          {/* Like button section */}
          <HStack mt={4} justify="space-between" align="center">
            <HStack gap={2}>
              <IconButton
                aria-label={post.isLikedByUser ? "Unlike post" : "Like post"}
                size="sm"
                variant="ghost"
                color={post.isLikedByUser ? "red.400" : "whiteAlpha.600"}
                _hover={{
                  color: post.isLikedByUser ? "red.500" : "red.400",
                  bg: "whiteAlpha.200",
                }}
                onClick={handleLike}
                disabled={
                  !currentUserId || likePost.isPending || unlikePost.isPending
                }
              >
                <FaHeart />
              </IconButton>
              <Text color="whiteAlpha.700" fontSize="sm">
                {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
              </Text>
            </HStack>
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
}

export default function Posts({ user }: { user: User | null }) {
  const [isClient, setIsClient] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const {
    data: posts,
    refetch,
    isLoading,
    isSuccess,
  } = api.post.getAll.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    staleTime: 0,
  });

  // Prevent hydration issues by only running client-side code after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show content with a slight delay to ensure smooth transition
  useEffect(() => {
    if (isSuccess && posts !== undefined) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, posts]);

  // Listen for cross-tab post updates only on client
  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "new-post-created") {
        void refetch();
        localStorage.removeItem("new-post-created");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refetch, isClient]);

  const handlePostCreated = () => {
    void refetch();
    // Only use localStorage on client
    if (isClient && typeof window !== "undefined") {
      localStorage.setItem("new-post-created", Date.now().toString());
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxW="3xl" py={8}>
      <VStack align="stretch" gap={4}>
        {/* Show CreatePost skeleton during initial load, then real component */}
        {!showContent ? (
          <CreatePostSkeleton />
        ) : (
          <CreatePost user={user} onPostCreated={handlePostCreated} />
        )}

        {/* Show skeleton while loading, then posts or empty state */}
        {!showContent || isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts?.length ? (
          posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserId={user?.id ?? null}
              onPostUpdated={handlePostCreated}
            />
          ))
        ) : (
          <Box bg="whiteAlpha.50" borderRadius="xl" p={6} textAlign="center">
            <Text color="whiteAlpha.600">
              No posts yet. Be the first to share something!
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
