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
  IconButton,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaTrash,
  FaHeart,
} from "react-icons/fa";
import { api } from "~/trpc/react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";

// Google Maps types
interface GooglePlace {
  formatted_address?: string;
}

interface GoogleAutocomplete {
  addListener: (event: string, callback: () => void) => void;
  getPlace: () => GooglePlace;
}

interface GoogleMaps {
  places: {
    Autocomplete: new (
      input: HTMLInputElement,
      options?: { types: string[] },
    ) => GoogleAutocomplete;
  };
}

declare global {
  interface Window {
    google: {
      maps: GoogleMaps;
    };
  }
}

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  location: string | null;
  bio: string | null;
  onboardingComplete: boolean;
  emailVerified: Date | null;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
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

function UserPost({
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
  const router = useRouter();

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
              <Text
                fontWeight="bold"
                color="white"
                _hover={{ color: "blue.300", cursor: "pointer" }}
                transition="color 0.2s"
                onClick={() => router.push(`/user/${post.createdBy.id}`)}
                cursor="pointer"
              >
                {post.createdBy.name ?? "Anonymous"}
              </Text>
              {/* Hidden prefetch link for instant navigation */}
              <Link
                href={`/user/${post.createdBy.id}`}
                prefetch={true}
                style={{ display: "none" }}
              >
                <span></span>
              </Link>
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

export default function Profile({
  user,
  currentUserId,
}: {
  user: User;
  currentUserId?: string;
}) {
  const isOwnProfile = currentUserId === user.id;
  const router = useRouter();
  
  // Get tRPC utils for prefetching
  const utils = api.useUtils();

  // Aggressively prefetch home page data when profile loads
  useEffect(() => {
    // Prefetch all posts for home page
    void utils.post.getAll.prefetch();
    
    // If user exists, prefetch user data
    if (currentUserId) {
      void utils.user.getUser.prefetch();
    }
    
    // Prefetch popular user profiles (for posts on home page)
    setTimeout(() => {
      // This will prefetch data that might be on the home page
      void utils.post.getAll.fetch().then((posts) => {
        if (posts) {
          posts.forEach((post) => {
            void utils.user.getById.prefetch({ id: post.createdBy.id });
          });
        }
      }).catch(() => {
        // Silently handle errors in prefetching
      });
    }, 500);
  }, [utils, currentUserId]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name ?? "",
    bio: user.bio ?? "",
    location: user.location ?? "",
  });
  const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(user.followerCount ?? 0);

  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null);

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      window.location.reload();
    },
  });

  const followUser = api.user.follow.useMutation({
    onSuccess: () => {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
    },
  });

  const unfollowUser = api.user.unfollow.useMutation({
    onSuccess: () => {
      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
    },
  });

  const {
    data: userPosts,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = api.post.getUserPosts.useQuery({
    userId: user.id,
  });

  const handlePostUpdated = () => {
    void refetchPosts();
  };

  const handleSaveProfile = async () => {
    await updateUser.mutateAsync({
      name: editForm.name.trim() || null,
      bio: editForm.bio.trim() || null,
      location: editForm.location.trim() || null,
    });
  };

  // Instant navigation to home
  const handleBackToHome = () => {
    // Use router.push for instant navigation since data is prefetched
    router.push('/');
  };

  // Setup Google Places Autocomplete
  useEffect(() => {
    if (window.google && locationInputRef.current && isEditing) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        { types: ["(cities)"] },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const autocomplete = autocompleteRef.current;
        if (autocomplete) {
          const place = autocomplete.getPlace();
          if (place?.formatted_address) {
            setEditForm((prev) => ({
              ...prev,
              location: place.formatted_address ?? "",
            }));
          }
        }
      });
    }
  }, [isEditing]);

  const postCount = userPosts?.length ?? 0;

  return (
    <>
      {/* Load Google Places */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />

      {/* Hidden prefetch link for home page */}
      <Link href="/" prefetch={true} style={{ display: "none" }}>
        <span></span>
      </Link>

      <Box minH="100vh" bg="rgb(61, 60, 60)" position="relative">
        {/* Profile Header Section */}
        <Container maxW="3xl" py={8} position="relative">
          <VStack align="stretch" gap={6}>
            {/* Back Button with instant navigation */}
            <Button
              variant="ghost"
              size="sm"
              color="whiteAlpha.700"
              _hover={{ color: "white", bg: "whiteAlpha.200" }}
              onClick={handleBackToHome}
              w="fit-content"
            >
              <FaArrowLeft />
              <Box ml={2}>Back to Home</Box>
            </Button>

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
                      {isOwnProfile ? (
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
                          <Box ml={2}>
                            {isEditing ? "Cancel" : "Edit Profile"}
                          </Box>
                        </Button>
                      ) : (
                        <Button
                          onClick={async () => {
                            if (isFollowing) {
                              await unfollowUser.mutateAsync({
                                userId: user.id,
                              });
                            } else {
                              await followUser.mutateAsync({ userId: user.id });
                            }
                          }}
                          size="sm"
                          variant={isFollowing ? "outline" : "solid"}
                          colorScheme={isFollowing ? "gray" : "blue"}
                          loading={
                            followUser.isPending || unfollowUser.isPending
                          }
                          _hover={{
                            transform: "scale(1.05)",
                          }}
                        >
                          {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                      )}
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
                          {user.followingCount ?? 0}
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
                          {followerCount}
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
                {isEditing && isOwnProfile ? (
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
                          Share your interests, profession, or anything
                          you&apos;d like others to know
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
                        ref={locationInputRef}
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
                <UserPost
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId ?? null}
                  onPostUpdated={handlePostUpdated}
                />
              ))
            ) : (
              <Box
                bg="whiteAlpha.50"
                borderRadius="xl"
                p={6}
                textAlign="center"
              >
                <Text color="whiteAlpha.600">
                  No posts yet. Be the first to share something!
                </Text>
              </Box>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
}
