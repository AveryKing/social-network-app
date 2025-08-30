import { Box } from "@chakra-ui/react";

export default function PostSkeleton() {
  return (
    <Box
      bg="whiteAlpha.50"
      borderRadius="xl"
      p={6}
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
    >
      {/* User info skeleton */}
      <Box mb={4}>
        <Box
          h="20px"
          w="120px"
          bg="whiteAlpha.200"
          borderRadius="md"
          mb={2}
          className="skeleton"
        />
        <Box
          h="14px"
          w="80px"
          bg="whiteAlpha.200"
          borderRadius="md"
          className="skeleton"
        />
      </Box>

      {/* Content skeleton */}
      <Box>
        <Box
          h="16px"
          w="100%"
          bg="whiteAlpha.200"
          borderRadius="md"
          mb={2}
          className="skeleton"
        />
        <Box
          h="16px"
          w="85%"
          bg="whiteAlpha.200"
          borderRadius="md"
          mb={2}
          className="skeleton"
        />
        <Box
          h="16px"
          w="60%"
          bg="whiteAlpha.200"
          borderRadius="md"
          className="skeleton"
        />
      </Box>
    </Box>
  );
}
