"use client";

import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import type { Session } from "next-auth";
import Link from "next/link";
import { BsBell, BsSearch } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function Header({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const toggleMenu = () => setIsOpen(!isOpen);
  const router = useRouter();

  // Get tRPC utils for prefetching
  const utils = api.useUtils();

  // Prefetch profile data when header loads (if user is signed in)
  useEffect(() => {
    if (session?.user?.id) {
      // Prefetch current user data for profile page
      void utils.user.getUser.prefetch();
      void utils.user.getById.prefetch({ id: session.user.id });
      // Prefetch user's posts for profile page
      void utils.post.getUserPosts.prefetch({ userId: session.user.id });
    }
  }, [session?.user?.id, utils]);

  return (
    <Box
      bg="rgba(40, 39, 39, 0.95)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
      px={6}
      py={3}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
    >
      <Flex h={14} alignItems="center" justifyContent="space-between">
        <HStack alignItems="center">
          <Box
            color="cyan.300"
            fontWeight="bold"
            fontSize="2xl"
            letterSpacing="tight"
            textShadow="0 1px 2px rgba(0, 0, 0, 0.5)"
            _hover={{
              color: "cyan.200",
              transition: "all 0.2s",
              transform: "scale(1.02)",
            }}
          >
            Social
          </Box>
        </HStack>

        {/* Search Bar - Center */}
        <Box flex="1" maxW="500px" mx={8}>
          <Box position="relative">
            <Input
              placeholder="Search users, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
              color="white"
              _placeholder={{ color: "whiteAlpha.600" }}
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.5)",
                bg: "whiteAlpha.200",
              }}
              paddingLeft={10}
              borderRadius="full"
            />
            <Icon
              as={BsSearch}
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="whiteAlpha.600"
              boxSize={4}
            />
          </Box>
        </Box>

        {session?.user ? (
          <HStack gap={4}>
            {/* Notifications Menu */}
            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger
                p={2}
                borderRadius="full"
                color="whiteAlpha.700"
                _hover={{
                  bg: "whiteAlpha.200",
                  color: "white",
                  transform: "scale(1.05)",
                }}
                transition="all 0.2s"
                position="relative"
                cursor="pointer"
              >
                <Icon as={BsBell} boxSize={5} />
                {/* Notification badge */}
                <Box
                  position="absolute"
                  top={1}
                  right={1}
                  w={2}
                  h={2}
                  bg="red.500"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="gray.800"
                />
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    bg="gray.800"
                    borderColor="whiteAlpha.200"
                    backdropFilter="blur(10px)"
                    boxShadow="xl"
                    borderRadius="lg"
                    minW="300px"
                    maxH="400px"
                    overflowY="auto"
                  >
                    <Box
                      p={3}
                      borderBottom="1px solid"
                      borderColor="whiteAlpha.200"
                    >
                      <Box color="white" fontWeight="semibold" fontSize="md">
                        Notifications
                      </Box>
                    </Box>
                    <Menu.Item
                      value="notification1"
                      color="white"
                      _hover={{ bg: "whiteAlpha.200" }}
                      p={3}
                    >
                      <Box>
                        <Box fontWeight="medium">John liked your post</Box>
                        <Box fontSize="sm" color="whiteAlpha.600">
                          2 minutes ago
                        </Box>
                      </Box>
                    </Menu.Item>
                    <Menu.Item
                      value="notification2"
                      color="white"
                      _hover={{ bg: "whiteAlpha.200" }}
                      p={3}
                    >
                      <Box>
                        <Box fontWeight="medium">
                          Sarah started following you
                        </Box>
                        <Box fontSize="sm" color="whiteAlpha.600">
                          1 hour ago
                        </Box>
                      </Box>
                    </Menu.Item>
                    <Menu.Item
                      value="notification3"
                      color="white"
                      _hover={{ bg: "whiteAlpha.200" }}
                      p={3}
                    >
                      <Box>
                        <Box fontWeight="medium">Mike followed you back</Box>
                        <Box fontSize="sm" color="whiteAlpha.600">
                          3 hours ago
                        </Box>
                      </Box>
                    </Menu.Item>
                    <Box
                      p={3}
                      borderTop="1px solid"
                      borderColor="whiteAlpha.200"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        color="blue.300"
                        w="full"
                        _hover={{ bg: "whiteAlpha.200" }}
                      >
                        View all notifications
                      </Button>
                    </Box>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>

            {/* User Menu */}
            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger
                rounded="full"
                focusRing="outside"
                transition="all 0.2s"
                _hover={{
                  transform: "scale(1.05)",
                  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                  cursor: "pointer",
                }}
              >
                <Avatar.Root size="md" colorPalette="blue">
                  <Avatar.Fallback
                    name={session.user.name!}
                    bg="blue.500"
                    color="white"
                    fontWeight="semibold"
                  />
                  <Avatar.Image src={session.user.image ?? undefined} />
                </Avatar.Root>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    bg="gray.800"
                    borderColor="whiteAlpha.200"
                    backdropFilter="blur(10px)"
                    boxShadow="xl"
                    borderRadius="lg"
                    minW="200px"
                  >
                    {/* Hidden prefetch link for profile page */}
                    <Link href="/profile" prefetch={true}>
                      <Menu.Item
                        value="profile"
                        color="white"
                        _hover={{ bg: "whiteAlpha.200" }}
                        fontWeight="medium"
                        cursor="pointer"
                      >
                        Profile
                      </Menu.Item>
                    </Link>
                    <Menu.Item
                      value="settings"
                      color="white"
                      _hover={{ bg: "whiteAlpha.200" }}
                      fontWeight="medium"
                    >
                      Settings
                    </Menu.Item>
                    <Link href="/api/auth/signout">
                      <Menu.Item
                        value="logout"
                        color="red.300"
                        _hover={{ bg: "red.900", color: "red.200" }}
                        fontWeight="medium"
                      >
                        Logout
                      </Menu.Item>
                    </Link>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </HStack>
        ) : (
          <HStack gap={3}>
            <Link href="/api/auth/signin">
              <Button
                variant="outline"
                colorScheme="blue"
                size="sm"
                fontWeight="semibold"
                borderColor="blue.400"
                color="blue.300"
                _hover={{
                  bg: "blue.500",
                  color: "white",
                  borderColor: "blue.500",
                  transform: "translateY(-1px)",
                  boxShadow: "lg",
                }}
                transition="all 0.2s"
              >
                Sign in
              </Button>
            </Link>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}
