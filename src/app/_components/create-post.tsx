"use client";

import { useState } from "react";
import { Box, Flex, Avatar, Textarea, Button, Text } from "@chakra-ui/react";
import { api } from "~/trpc/react";

type User = {
  name: string | null;
  image: string | null;
  id: string;
  email: string;
  emailVerified: Date | null;
  onboardingComplete: boolean;
};

interface CreatePostProps {
  user: User;
  onPostCreated?: () => void;
}

export default function CreatePost({ user, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      setContent("");
      setIsExpanded(false);
      onPostCreated?.();
    },
  });

  const handleSubmit = async () => {
    if (content.trim()) {
      await createPost.mutateAsync({ content: content.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
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
          <Avatar.Image
            src={
              user.image ??
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
            }
            alt={user.name ?? "User avatar"}
          />
          <Avatar.Fallback>{user.name?.[0] ?? "U"}</Avatar.Fallback>
        </Avatar.Root>
        <Box flex={1}>
          {!isExpanded ? (
            <Box
              bg="whiteAlpha.100"
              borderRadius="lg"
              p={4}
              cursor="pointer"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => setIsExpanded(true)}
            >
              <Text color="whiteAlpha.600">What&apos;s on your mind?</Text>
            </Box>
          ) : (
            <Box>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind?"
                resize="none"
                minH="100px"
                maxLength={280}
                bg="whiteAlpha.100"
                border="none"
                _focus={{ bg: "whiteAlpha.200", outline: "none" }}
                color="white"
                autoFocus
              />
              <Flex justify="space-between" align="center" mt={3}>
                <Text fontSize="sm" color="whiteAlpha.600">
                  {content.length}/280
                </Text>
                <Flex gap={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setContent("");
                      setIsExpanded(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleSubmit}
                    loading={createPost.isPending}
                    disabled={!content.trim() || content.length > 280}
                  >
                    Post
                  </Button>
                </Flex>
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
