"use client";

import {
  Box,
  Button,
  ButtonGroup,
  Center,
  VStack,
  Steps,
  Text,
  Field,
  Input,
  Card,
  Stack,
  Image,
} from "@chakra-ui/react";
import { useState, type DragEvent } from "react";

type User = {
  name: string | null;
  image: string | null;
  id: string;
  email: string;
  emailVerified: Date | null;
  onboardingComplete: boolean;
};

export default function Onboarding({ user }: { user: User | null }) {
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  });

  // eslint wanted `photo` used, so destructure only setter if not needed
  const [, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const steps = [
    { title: "Step 1", description: "Basic info" },
    { title: "Step 2", description: "Photo" },
    { title: "Step 3", description: "Setup profile" },
  ];

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPhoto(null);
    setPreview(null);
  };

  return (
    <Center minH="100vh" px={4} bg="gray.900">
      <VStack w="full" maxW="lg" mt="-100px">
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Welcome, {user?.name}
        </Text>
        <Text fontSize="lg" color="gray.300">
          Let&apos;s get your account set up
        </Text>

        <Steps.Root
          size="lg"
          colorPalette="cyan"
          defaultStep={0}
          count={steps.length}
          w="full"
        >
          <Steps.List>
            {steps.map((step, index) => (
              <Steps.Item key={index} index={index} title={step.title}>
                <Steps.Indicator />
                <Box>
                  <Steps.Title>{step.title}</Steps.Title>
                  <Steps.Description>{step.description}</Steps.Description>
                </Box>
                <Steps.Separator />
              </Steps.Item>
            ))}
          </Steps.List>

          {/* Step 1: Basic Info */}
          <Steps.Content index={0}>
            <Card.Root bg="gray.800" borderRadius="xl" shadow="md" w="full">
              <Card.Body>
                <Stack>
                  <Text fontSize="lg" fontWeight="semibold" color="white">
                    Basic Information
                  </Text>

                  <Field.Root>
                    <Field.Label color="gray.200">Name</Field.Label>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label color="gray.200">Email</Field.Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </Field.Root>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Steps.Content>

          {/* Step 2: Photo Upload */}
          <Steps.Content index={1}>
            <Card.Root bg="gray.800" borderRadius="xl" shadow="md" w="full">
              <Card.Body>
                <Stack align="center">
                  <Text fontSize="lg" fontWeight="semibold" color="white">
                    Upload a Profile Photo
                  </Text>

                  {!preview ? (
                    <Box
                      w="full"
                      h="200px"
                      border="2px dashed"
                      borderColor="gray.600"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="gray.400"
                      cursor="pointer"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() =>
                        document.getElementById("photoInput")?.click()
                      }
                    >
                      <Text>Drag &amp; drop or click to select</Text>
                      <Input
                        id="photoInput"
                        type="file"
                        accept="image/*"
                        display="none"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFile(e.target.files[0]);
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    <Stack w="full" align="center">
                      <Image
                        src={preview}
                        alt="Preview"
                        borderRadius="lg"
                        w="full"
                        maxH="300px"
                        objectFit="cover"
                      />
                      <ButtonGroup>
                        <Button
                          colorScheme="red"
                          variant="solid"
                          size="sm"
                          onClick={handleRemove}
                        >
                          Remove Photo
                        </Button>
                        <Button
                          colorScheme="cyan"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("photoInput")?.click()
                          }
                        >
                          Replace Photo
                        </Button>
                      </ButtonGroup>
                      <Input
                        id="photoInput"
                        type="file"
                        accept="image/*"
                        display="none"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFile(e.target.files[0]);
                          }
                        }}
                      />
                    </Stack>
                  )}
                </Stack>
              </Card.Body>
            </Card.Root>
          </Steps.Content>

          {/* Step 3 */}
          <Steps.Content index={2}>
            <Text color="white">Profile setup here</Text>
          </Steps.Content>

          <Steps.CompletedContent>
            🎉 All steps are complete, {user?.name}!
          </Steps.CompletedContent>

          <ButtonGroup size="sm" mt={6} justifyContent="center">
            <Steps.PrevTrigger asChild>
              <Button variant="outline" colorScheme="gray">
                Prev
              </Button>
            </Steps.PrevTrigger>
            <Steps.NextTrigger asChild>
              <Button colorScheme="cyan">Next</Button>
            </Steps.NextTrigger>
          </ButtonGroup>
        </Steps.Root>
      </VStack>
    </Center>
  );
}
