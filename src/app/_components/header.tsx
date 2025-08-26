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
                  <Avatar.Image src="https://bit.ly/broken-link" />
                </Avatar.Root>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="account">Account</Menu.Item>
                    <Menu.Item value="settings">Settings</Menu.Item>
                    <Menu.Item
                      as={Link}
                      value="logout"
                      href="/api/auth/signout"
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </>
        ) : (
          <>
            <Button
              as={Link}
              href="/api/auth/signin"
              colorPalette={"white"}
              fontSize="md"
              variant="subtle"
            >
              Sign in
            </Button>
          </>
        )}
      </Flex>
    </Box>
  );
}
