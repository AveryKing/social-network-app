"use client";

import { Container, VStack, Box, Text } from "@chakra-ui/react";
import { api } from "~/trpc/react";
import CreatePost from "./create-post";

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
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

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

export default function Posts({ user }: { user: User | null }) {
  const { data: posts, refetch } = api.post.getAll.useQuery();

  if (!user) {
    return null;
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
