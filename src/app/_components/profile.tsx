"use client";

import {
  Container,
  VStack,
  Box,
  Text,
  Avatar,
  HStack,
  Button,
  Separator,
  Card,
  Badge,
  Skeleton,
  SkeletonText,
  Textarea,
  Input,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { api } from "~/trpc/react";
import Link from "next/link";

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  location: string | null;
  bio: string | null;
  onboardingComplete: boolean;
  emailVerified: Date | null;
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
        <Skeleton borderRadius="full" width="40px" height="40px" />
        <Box flex={1}>
          <Skeleton height="20px" width="120px" mb={2} />
          <Skeleton height="14px" width="80px" mb={3} />
          <SkeletonText mt={4} noOfLines={3} />
        </Box>
      </HStack>
    </Box>
  );
}

function UserPost({ post }: { post: Post }) {
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
      </HStack>
    </Box>
  );
}

export default function Profile({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name ?? "",
    bio: user.bio ?? "",
    location: user.location ?? "",
  });

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      window.location.reload();
    },
  });

  const { data: userPosts, isLoading: postsLoading } =
    api.post.getUserPosts.useQuery({
      userId: user.id,
    });

  const handleSaveProfile = async () => {
    await updateUser.mutateAsync({
      name: editForm.name.trim() || null,
      bio: editForm.bio.trim() || null,
      location: editForm.location.trim() || null,
    });
  };

  const postCount = userPosts?.length ?? 0;

  return (
    <Box minH="100vh" bg="rgb(61, 60, 60)" position="relative">
      {/* Profile Header Section */}
      <Container maxW="3xl" py={8} position="relative">
        <VStack align="stretch" gap={6}>
          {/* Back Button */}
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              color="whiteAlpha.700"
              _hover={{ color: "white", bg: "whiteAlpha.200" }}
            >
              <FaArrowLeft />
              <Box ml={2}>Back to Home</Box>
            </Button>
          </Link>

          {/* Profile Header Card */}
          <Box
            bg="whiteAlpha.50"
            borderRadius="xl"
            p={8}
            backdropFilter="blur(10px)"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            boxShadow="xl"
          >
            <VStack align="stretch" gap={6}>
              {/* Avatar and Basic Info */}
              <HStack gap={6} align="start">
                <Box position="relative">
                  <Avatar.Root size="2xl">
                    <Avatar.Image
                      src={user.image ?? undefined}
                      alt={user.name ?? "User"}
                    />
                    <Avatar.Fallback
                      fontSize="3xl"
                      bg="gradient(to-r, cyan.500, blue.500)"
                    >
                      {(user.name ?? "U").charAt(0)}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  {user.onboardingComplete && (
                    <Badge
                      position="absolute"
                      bottom="-2"
                      right="-2"
                      colorScheme="green"
                      variant="solid"
                      borderRadius="full"
                      px={2}
                      py={1}
                      fontSize="xs"
                    >
                      ✓
                    </Badge>
                  )}
                </Box>

                <VStack align="start" flex={1} gap={3}>
                  <HStack justify="space-between" width="100%">
                    <VStack align="start" gap={1}>
                      <Text fontSize="3xl" fontWeight="bold" color="white">
                        {user.name ?? "Anonymous User"}
                      </Text>
                      <Text color="whiteAlpha.700" fontSize="lg">
                        {user.email}
                      </Text>
                    </VStack>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      borderColor="blue.400"
                      color="blue.300"
                      _hover={{
                        bg: "blue.500",
                        color: "white",
                        borderColor: "blue.500",
                      }}
                    >
                      <FaEdit />
                      <Box ml={2}>{isEditing ? "Cancel" : "Edit Profile"}</Box>
                    </Button>
                  </HStack>

                  {/* Stats Row */}
                  <HStack gap={8} mt={4}>
                    <VStack align="center" gap={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="white">
                        {postCount}
                      </Text>
                      <Text
                        fontSize="sm"
                        color="whiteAlpha.700"
                        fontWeight="medium"
                      >
                        Posts
                      </Text>
                    </VStack>
                    <VStack align="center" gap={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="white">
                        0
                      </Text>
                      <Text
                        fontSize="sm"
                        color="whiteAlpha.700"
                        fontWeight="medium"
                      >
                        Following
                      </Text>
                    </VStack>
                    <VStack align="center" gap={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="white">
                        0
                      </Text>
                      <Text
                        fontSize="sm"
                        color="whiteAlpha.700"
                        fontWeight="medium"
                      >
                        Followers
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </HStack>

              <Separator borderColor="whiteAlpha.300" />

              {/* Bio and Location Section */}
              {isEditing ? (
                <VStack align="stretch" gap={5}>
                  <Box>
                    <Text
                      color="whiteAlpha.700"
                      fontSize="sm"
                      mb={2}
                      fontWeight="medium"
                    >
                      Display Name
                    </Text>
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      bg="whiteAlpha.100"
                      border="2px solid"
                      borderColor="whiteAlpha.300"
                      color="white"
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                        bg: "whiteAlpha.200",
                      }}
                      _placeholder={{ color: "whiteAlpha.500" }}
                      placeholder="Enter your display name"
                    />
                  </Box>

                  <Box>
                    <Text
                      color="whiteAlpha.700"
                      fontSize="sm"
                      mb={2}
                      fontWeight="medium"
                    >
                      Bio
                    </Text>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      bg="whiteAlpha.100"
                      border="2px solid"
                      borderColor="whiteAlpha.300"
                      color="white"
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                        bg: "whiteAlpha.200",
                      }}
                      _placeholder={{ color: "whiteAlpha.500" }}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={160}
                      resize="none"
                    />
                    <HStack justify="space-between" mt={2}>
                      <Text fontSize="xs" color="whiteAlpha.600">
                        Share your interests, profession, or anything you'd like
                        others to know
                      </Text>
                      <Text
                        fontSize="xs"
                        color={
                          editForm.bio.length > 150
                            ? "red.400"
                            : "whiteAlpha.600"
                        }
                      >
                        {editForm.bio.length}/160
                      </Text>
                    </HStack>
                  </Box>

                  <Box>
                    <Text
                      color="whiteAlpha.700"
                      fontSize="sm"
                      mb={2}
                      fontWeight="medium"
                    >
                      Location
                    </Text>
                    <Input
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      bg="whiteAlpha.100"
                      border="2px solid"
                      borderColor="whiteAlpha.300"
                      color="white"
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                        bg: "whiteAlpha.200",
                      }}
                      _placeholder={{ color: "whiteAlpha.500" }}
                      placeholder="Where are you based?"
                    />
                  </Box>

                  <HStack gap={3} pt={2}>
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                      color="whiteAlpha.700"
                      _hover={{ color: "white", bg: "whiteAlpha.200" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handleSaveProfile}
                      disabled={updateUser.isPending}
                      _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "lg",
                      }}
                    >
                      {updateUser.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <VStack align="start" gap={4}>
                  {user.bio && (
                    <Box>
                      <Text color="white" lineHeight="tall" fontSize="lg">
                        {user.bio}
                      </Text>
                    </Box>
                  )}

                  <HStack gap={6} color="whiteAlpha.700">
                    {user.location && (
                      <HStack gap={2}>
                        <FaMapMarkerAlt />
                        <Text fontSize="md" fontWeight="medium">
                          {user.location}
                        </Text>
                      </HStack>
                    )}
                    {user.emailVerified && (
                      <HStack gap={2}>
                        <FaCalendarAlt />
                        <Text fontSize="md" fontWeight="medium">
                          Joined{" "}
                          {new Date(user.emailVerified).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>

      {/* Posts Section - Full Width */}
      <Container maxW="3xl" py={8}>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between" align="center">
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Posts
            </Text>
            <Badge
              colorScheme="blue"
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {postCount} {postCount === 1 ? "post" : "posts"}
            </Badge>
          </HStack>

          {postsLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : userPosts && userPosts.length > 0 ? (
            userPosts.map((post: Post) => (
              <UserPost key={post.id} post={post} />
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
    </Box>
  );
}
