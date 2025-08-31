"use client";

import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { useState } from "react";
import type { Session } from "next-auth";
import Link from "next/link";
const Links = ["Home", "About", "Services", "Contact"];

export default function Header({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <Box
      bg={"cyan.900"}
      px={4}
      py={1}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack alignItems="center">
          <Box ml={5} color="white" fontWeight="bold" fontSize="xl">
            Social
          </Box>
        </HStack>
        {session?.user ? (
          <>
            <Menu.Root positioning={{ placement: "right-end" }}>
              <Menu.Trigger
                rounded="full"
                focusRing="outside"
                _hover={{
                  scale: 1.1,
                  border: "1px solid white",
                  cursor: "pointer",
                }}
              >
                <Avatar.Root size="lg" colorPalette="cyan">
                  <Avatar.Fallback name={session.user.name!} />
                  <Avatar.Image src={session.user.image ?? undefined} />
                </Avatar.Root>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Link href="/profile">
                      <Menu.Item value="profile">Profile</Menu.Item>
                    </Link>
                    <Menu.Item value="settings">Settings</Menu.Item>
                    <Link href="/api/auth/signout">
                      <Menu.Item value="logout">Logout</Menu.Item>{" "}
                    </Link>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </>
        ) : (
          <>
            <Link href="/api/auth/signin">
              <Button colorPalette={"white"} fontSize="md" variant="subtle">
                Sign in
              </Button>
            </Link>
          </>
        )}
      </Flex>
    </Box>
  );
}
