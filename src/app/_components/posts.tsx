"use client";

import { Container, VStack, Box, Text } from "@chakra-ui/react";
import { api } from "~/trpc/react";
import CreatePost from "./create-post";
import PostSkeletons from "./post-skeletons";

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
  createdById: string;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

interface PostsProps {
  user: User | null;
  initialPosts?: Post[] | null;
}

function PostItem({ post }: { post: Post }) {
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
      <Box>
        <Text fontWeight="bold" color="white">
          {post.createdBy.name ?? "Anonymous"}
        </Text>
        <Text color="whiteAlpha.700" fontSize="sm" mb={3}>
          {new Date(post.createdAt).toLocaleDateString()}
        </Text>
        <Text color="white" lineHeight="tall">
          {post.name}
        </Text>
      </Box>
    </Box>
  );
}

export default function Posts({ user, initialPosts }: PostsProps) {
  const { data: posts, refetch, isLoading } = api.post.getAll.useQuery(undefined, {
    ...(initialPosts && { initialData: initialPosts }),
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
  });

  if (!user) {
    return null;
  }

  // Show skeletons only when loading and no initial data
  if (isLoading && !initialPosts) {
    return <PostSkeletons />;
  }

  return (
    <Container maxW="3xl" py={8}>
      <VStack align="stretch" gap={4}>
        <CreatePost user={user} onPostCreated={() => refetch()} />

        {/* Feed */}
        {posts?.length ? (
          posts.map((post) => <PostItem key={post.id} post={post} />)
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
