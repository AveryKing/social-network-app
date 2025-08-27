import { Box, Container, VStack } from "@chakra-ui/react";

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
        <Box
          h="4"
          bg="whiteAlpha.300"
          borderRadius="md"
          w="32"
          mb="2"
          opacity={0.7}
        />
        {/* Date skeleton */}
        <Box
          h="3"
          bg="whiteAlpha.200"
          borderRadius="md"
          w="20"
          mb="3"
          opacity={0.5}
        />
        {/* Content skeleton */}
        <Box mb="2">
          <Box
            h="4"
            bg="whiteAlpha.300"
            borderRadius="md"
            w="full"
            mb="2"
            opacity={0.7}
          />
          <Box
            h="4"
            bg="whiteAlpha.300"
            borderRadius="md"
            w="75%"
            mb="2"
            opacity={0.7}
          />
          <Box
            h="4"
            bg="whiteAlpha.300"
            borderRadius="md"
            w="50%"
            opacity={0.7}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default function PostSkeletons({ count = 3 }: { count?: number }) {
  return (
    <Container maxW="3xl" py={8}>
      <VStack align="stretch" gap={4}>
        {/* Create post skeleton */}
        <Box
          bg="whiteAlpha.50"
          borderRadius="xl"
          p={6}
          backdropFilter="blur(10px)"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
        >
          <Box display="flex" gap={4}>
            <Box
              w="12"
              h="12"
              bg="whiteAlpha.300"
              borderRadius="full"
              opacity={0.7}
            />
            <Box
              flex="1"
              bg="whiteAlpha.200"
              borderRadius="lg"
              p={4}
              opacity={0.5}
            >
              <Box h="4" bg="whiteAlpha.300" borderRadius="md" w="48" />
            </Box>
          </Box>
        </Box>

        {/* Post skeletons */}
        {Array.from({ length: count }, (_, i) => (
          <PostSkeleton key={i} />
        ))}
      </VStack>
    </Container>
  );
}