import {
  ChakraProvider,
  Box,
  Heading,
  Container,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Image,
  Stack,
  Avatar,
  SkeletonCircle,
  SkeletonText,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect } from "react";

const App = () => {
  const [image, updateImage] = useState(null);
  const [prompt, updatePrompt] = useState("");
  const [loading, updateLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState(""); // For typing effect

  const fullTitle = "Text to Image AI";

  // Typing effect for the title
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      setTitle((prev) => fullTitle.substring(0, index));
      index++;
      if (index > fullTitle.length) clearInterval(typingInterval);
    }, 150); // Typing speed
    return () => clearInterval(typingInterval);
  }, []);

  const generate = async (prompt) => {
    if (!prompt.trim()) return;
    updateLoading(true);
    setMessages((prev) => [
      ...prev,
      { type: "user", content: prompt },
    ]);
    try {
      const result = await axios.get(`http://127.0.0.1:8000/?prompt=${prompt}`);
      updateImage(result.data);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: `data:image/png;base64,${result.data}`,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: "Sorry, something went wrong!" },
      ]);
    }
    updateLoading(false);
    updatePrompt(""); // Clear input field
  };

  return (
    <ChakraProvider>
      <Box bg="gray.50" minH="100vh" display="flex" flexDirection="column">
        {/* Header with Typing Effect */}
        <Container maxW="lg" py={6}>
          <Flex justify="center" align="center" mb={4}>
            <Heading color="teal.500">{title}</Heading>
          </Flex>
          {!messages.length && (
            <Text
              color="black"
              textAlign="center"
              fontSize="lg"
              mt={2}
            >
              Enter a prompt and see the magic of AI-generated images!
            </Text>
          )}
        </Container>

        {/* Chat Interface */}
        <VStack
          spacing={4}
          flex={1}
          overflowY="auto"
          px={4}
          py={2}
          bg="gray.100"
          borderRadius="md"
        >
          {messages.map((msg, idx) => (
            <HStack
              key={idx}
              alignSelf={msg.type === "user" ? "flex-end" : "flex-start"}
              spacing={3}
            >
              {msg.type === "bot" && (
                <Avatar name="AI" bg="teal.500" size="sm" />
              )}
              <Box
                bg={msg.type === "user" ? "yellow.200" : "teal.600"}
                color={msg.type === "user" ? "black" : "white"}
                px={4}
                py={2}
                borderRadius="lg"
                maxW="70%"
                boxShadow="md"
              >
                {msg.type === "bot" && msg.content.startsWith("data:image/") ? (
                  <Image src={msg.content} borderRadius="md" />
                ) : (
                  <Text>{msg.content}</Text>
                )}
              </Box>
              {msg.type === "user" && (
                <Avatar name="You" bg="yellow.500" size="sm" />
              )}
            </HStack>
          ))}
          {loading && (
            <Stack spacing={2} w="full">
              <SkeletonCircle size="10" />
              <SkeletonText noOfLines={2} spacing="4" />
            </Stack>
          )}
        </VStack>

        {/* Input Field at Bottom */}
        <Box bg="gray.50" p={4} boxShadow="lg">
          <HStack spacing={3}>
            <Input
              placeholder="Type your prompt..."
              value={prompt}
              onChange={(e) => updatePrompt(e.target.value)}
              bg="white"
              flex={1}
            />
            <Button
              onClick={() => generate(prompt)}
              colorScheme="teal"
              isLoading={loading}
            >
              Send
            </Button>
          </HStack>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default App;
