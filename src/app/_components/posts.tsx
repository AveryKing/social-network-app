"use client";

import { Container, VStack, Box, Text, Skeleton, SkeletonText } from "@chakra-ui/react";
import { useEffect, useState } from "react";
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
      <Box>
        {/* Author name skeleton */}
        <Skeleton height="20px" width="120px" mb={2} />
        
        {/* Date skeleton */}
        <Skeleton height="14px" width="80px" mb={3} />
        
        {/* Content skeleton */}
        <SkeletonText 
          mt={4} 
          noOfLines={3}
        />
      </Box>
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
      <Box display="flex" gap={4}>
        {/* Avatar skeleton */}
        <Skeleton 
          borderRadius="full" 
          width="48px" 
          height="48px" 
        />
        {/* Input skeleton */}
        <Box flex={1}>
          <Skeleton 
            height="16px" 
            width="200px" 
            borderRadius="lg"
          />
        </Box>
      </Box>
    </Box>
  );
}

function PostItem({ post }: { post: Post }) {
  // Use useState to avoid hydration mismatch with date formatting
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setFormattedDate(new Date(post.createdAt).toLocaleDateString());
  }, [post.createdAt]);

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
          {formattedDate || "Loading..."}
        </Text>
        <Text color="white" lineHeight="tall">
          {post.name}
        </Text>
      </Box>
    </Box>
  );
}

export default function Posts({ user }: { user: User | null }) {
  const [isClient, setIsClient] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { data: posts, refetch, isLoading, isFetching, isSuccess } = api.post.getAll.useQuery(undefined, {
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
