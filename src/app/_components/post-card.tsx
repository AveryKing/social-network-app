import { Avatar, Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { FaHeart, FaComment, FaShare } from "react-icons/fa";

// Define the post type (you'll need to adjust this based on your actual data structure)
type Post = {
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
  likes: number;
  comments: number;
};

const PostCard = ({ post }: { post: Post }) => (
  <Box
    bg="whiteAlpha.50"
    borderRadius="xl"
    p={6}
    backdropFilter="blur(10px)"
    borderWidth="1px"
    borderColor="whiteAlpha.200"
    _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
  >
    <Flex gap={4}>
      <Avatar.Root size="md">
        <Avatar.Image src={post.author.avatar} alt={post.author.name} />
        <Avatar.Fallback>{post.author.name.charAt(0)}</Avatar.Fallback>
      </Avatar.Root>
      <Box flex={1}>
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontWeight="bold">{post.author.name}</Text>
            <Text color="whiteAlpha.700" fontSize="sm">
              {post.author.username}
            </Text>
          </Box>
          <Text color="whiteAlpha.600" fontSize="sm">
            {post.timestamp}
          </Text>
        </Flex>
        <Text mt={4} lineHeight="tall">
          {post.content}
        </Text>
        <Flex gap={6} mt={4}>
          <Flex align="center" gap={2}>
            <IconButton
              aria-label="Like"
              variant="ghost"
              size="sm"
              colorScheme="pink"
            >
              <FaHeart />
            </IconButton>
            <Text fontSize="sm" color="whiteAlpha.700">
              {post.likes}
            </Text>
          </Flex>
          <Flex align="center" gap={2}>
            <IconButton aria-label="Comment" variant="ghost" size="sm">
              <FaComment />
            </IconButton>
            <Text fontSize="sm" color="whiteAlpha.700">
              {post.comments}
            </Text>
          </Flex>
          <IconButton aria-label="Share" variant="ghost" size="sm">
            <FaShare />
          </IconButton>
        </Flex>
      </Box>
    </Flex>
  </Box>
);

export default PostCard;
