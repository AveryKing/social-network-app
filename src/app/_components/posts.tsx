import { Container, VStack, Box, Flex, Avatar, Text } from "@chakra-ui/react";
import PostCard from "./post-card";

type User = {
  name: string | null;
  image: string | null;
  id: string;
  email: string;
  emailVerified: Date | null;
  onboardingComplete: boolean;
};

// Sample posts data
const placeholderPosts = [
  {
    id: 1,
    author: {
      name: "Jane Cooper",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      username: "@janecooper",
    },
    content:
      "Just shipped my latest project! 🚀 Building with #T3Stack has been an amazing experience. The type safety and developer experience is unmatched.",
    likes: 42,
    comments: 12,
    timestamp: "2h ago",
  },
  {
    id: 2,
    author: {
      name: "Alex Morgan",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      username: "@amorgan",
    },
    content:
      "Who else is excited about the new React Server Components? The future of web development is looking bright! ✨",
    likes: 28,
    comments: 8,
    timestamp: "4h ago",
  },
];

export default function Posts({ user }: { user: User | null }) {
  if (!user) {
    return null;
  }

  return (
    <Container maxW="3xl" py={8}>
      <VStack align="stretch">
        {/* New post input box */}
        <Box
          bg="whiteAlpha.50"
          borderRadius="xl"
          p={6}
          backdropFilter="blur(10px)"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
        >
          <Flex gap={4}>
            <Avatar.Root size="md">
              <Avatar.Image src={user.image ?? ""} alt="User avatar" />
              <Avatar.Fallback>{user.name ?? "User"}</Avatar.Fallback>
            </Avatar.Root>
            <Box
              flex={1}
              bg="whiteAlpha.100"
              borderRadius="lg"
              p={4}
              cursor="pointer"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <Text color="whiteAlpha.600">What&apos;s on your mind?</Text>
            </Box>
          </Flex>
        </Box>

        {/* Feed */}
        {placeholderPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </VStack>
    </Container>
  );
}
