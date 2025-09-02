"use client";

import { useState } from "react";
import {
  Box,
  Textarea,
  Button,
  HStack,
  Avatar,
  VStack,
  Text,
} from "@chakra-ui/react";
import { api } from "~/trpc/react";

type User = {
  name: string | null;
  image: string | null;
  id: string;
  email: string;
  emailVerified: Date | null;
  onboardingComplete: boolean;
};

export default function CreatePost({
  user,
  onPostCreated,
  onPostSuccess,
}: {
  user: User;
  onPostCreated: (content?: string) => void;
  onPostSuccess?: () => void;
}) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const createPost = api.post.create.useMutation({
    onMutate: async (newPost) => {
      onPostCreated(newPost.name);
    },

    onSuccess: () => {
      setContent("");
      setIsFocused(false);
      onPostSuccess?.();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createPost.mutateAsync({ name: content.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Box
      bg="whiteAlpha.50"
      borderRadius="xl"
      p={6}
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
    >
      <form onSubmit={handleSubmit}>
        <HStack align="start" gap={3}>
          <Avatar.Root size="md">
            <Avatar.Image
              src={user.image ?? undefined}
              alt={user.name ?? "You"}
            />
            <Avatar.Fallback>{(user.name ?? "Y").charAt(0)}</Avatar.Fallback>
          </Avatar.Root>

          <VStack flex={1} align="stretch" gap={3}>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              resize="none"
              minH={isFocused ? "120px" : "50px"}
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.300"
              color="white"
              _placeholder={{ color: "whiteAlpha.600" }}
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
              }}
              transition="all 0.2s"
            />

            {isFocused && (
              <HStack justify="space-between">
                <Text
                  fontSize="sm"
                  color={isOverLimit ? "red.400" : "whiteAlpha.600"}
                >
                  {characterCount}/{maxCharacters}
                </Text>

                <HStack gap={2}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setContent("");
                      setIsFocused(false);
                    }}
                    color="whiteAlpha.700"
                    _hover={{ color: "white", bg: "whiteAlpha.200" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    colorScheme="blue"
                    loading={createPost.isPending}
                    loadingText="Posting..."
                    disabled={!content.trim() || isOverLimit}
                  >
                    Post
                  </Button>
                </HStack>
              </HStack>
            )}
          </VStack>
        </HStack>
      </form>
    </Box>
  );
}
