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
  Spinner,
  Textarea,
} from "@chakra-ui/react";
import { useState, useRef, useEffect, type DragEvent } from "react";
import Script from "next/script";
import { uploadPhotoAction } from "@/app/actions/uploadPhoto";
import { api } from "@/trpc/react";

type User = {
  name: string | null;
  image: string | null;
  id: string;
  email: string;
  emailVerified: Date | null;
  onboardingComplete: boolean;
};

interface GooglePlace {
  formatted_address: string;
}

interface GoogleAutocomplete {
  addListener(event: string, handler: () => void): void;
  getPlace(): GooglePlace;
}

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options: { types: string[] },
          ) => GoogleAutocomplete;
        };
      };
    };
  }
}

export default function Onboarding({ user }: { user: User | null }) {
  const [step, setStep] = useState(0);
  const [photoUpdated, setPhotoUpdated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const steps = [
    { title: "Step 1", description: "Basic info" },
    { title: "Step 2", description: "Photo" },
    { title: "Step 3", description: "Setup profile" },
  ];

  const [formData, setFormData] = useState({
    id: user?.id ?? "",
    name: user?.name ?? "",
    email: user?.email ?? "",
    photoUrl: "",
    location: "",
    bio: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null);

  useEffect(() => {
    if (window.google && locationInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        { types: ["(cities)"] },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          setFormData((prev) => ({
            ...prev,
            location: place.formatted_address,
          }));
        }
      });
    }
  }, [step]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setPhotoUpdated(true);
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
    setPhotoUpdated(false);
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validateStep0 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStep0Valid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      validateEmail(formData.email)
    );
  };

  // Real-time validation for step 0
  useEffect(() => {
    if (step === 0) {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      setErrors(newErrors);
    }
  }, [formData.name, formData.email, step]);

  const updatePhoto = api.user.updateProfilePhoto.useMutation();
  const finishOnboarding = api.user.finishOnboarding.useMutation();

  const handleNext = async () => {
    if (step === 0) {
      if (!validateStep0()) {
        return;
      }
    }

    if (step === 1 && photo && photoUpdated) {
      setIsUploading(true);
      try {
        const url = await uploadPhotoAction(photo);
        updatePhoto.mutate({ photoUrl: url });
        setFormData((prev) => ({ ...prev, photoUrl: url }));
        setPhotoUpdated(false);
        setStep((s) => s + 1);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // ✅ Last step → send all form data to finishOnboarding
    if (step === steps.length - 1) {
      setIsFinishing(true); // Start loading state for finish
      try {
        await finishOnboarding.mutateAsync({
          name: formData.name,
          email: formData.email,
          photoUrl: formData.photoUrl,
          location: formData.location,
          bio: formData.bio,
        });
        setCompleted(true);
      } catch (err) {
        console.error("Finish onboarding failed", err);
      } finally {
        setIsFinishing(false); // End loading state
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setStep((s) => Math.max(0, s - 1));
    setErrors({});
  };

  return (
    <Center minH="100vh" px={4} bg="gray.900">
      {/* Load Google Places */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />

      <VStack w="full" maxW="lg" mt="-100px">
        {!completed ? (
          <>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Welcome, {user?.name}
            </Text>
            <Text fontSize="lg" color="gray.300">
              Let&apos;s get your account set up
            </Text>

            {/* Stepper */}
            <Steps.Root
              size="lg"
              colorPalette="cyan"
              w="full"
              step={step}
              count={steps.length}
              onStepChange={(e) => setStep(e.step - 1)}
            >
              <Steps.List>
                {steps.map((s, i) => (
                  <Steps.Item key={i} index={i}>
                    <Steps.Indicator />
                    <Box>
                      <Steps.Title>{s.title}</Steps.Title>
                      <Steps.Description>{s.description}</Steps.Description>
                    </Box>
                    <Steps.Separator />
                  </Steps.Item>
                ))}
              </Steps.List>
            </Steps.Root>

            <Box w="full" mt={6}>
              {/* Step 0: Basic Info */}
              {step === 0 && (
                <Card.Root bg="gray.800" borderRadius="xl" shadow="md" w="full">
                  <Card.Body>
                    <Text
                      fontSize="xl"
                      fontWeight="semibold"
                      color="white"
                      mb={4}
                    >
                      Basic Information
                    </Text>
                    <Stack>
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

                      {/* Validation errors */}
                      {Object.keys(errors).length > 0 && (
                        <Box mt={4}>
                          {Object.entries(errors).map(([field, error]) => (
                            <Text key={field} color="red.400" fontSize="sm">
                              {error}
                            </Text>
                          ))}
                        </Box>
                      )}
                    </Stack>
                  </Card.Body>
                </Card.Root>
              )}

              {/* Step 1: Photo */}
              {step === 1 && (
                <Card.Root bg="gray.800" borderRadius="xl" shadow="md" w="full">
                  <Card.Body>
                    <Text
                      fontSize="xl"
                      fontWeight="semibold"
                      color="white"
                      mb={4}
                    >
                      Profile Photo
                    </Text>
                    <Stack align="center">
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
                          <Text>Drag & drop or click to select</Text>
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
              )}

              {/* Step 2: Profile Setup */}
              {step === 2 && (
                <Card.Root bg="gray.800" borderRadius="xl" shadow="md" w="full">
                  <Card.Body>
                    <Text
                      fontSize="xl"
                      fontWeight="semibold"
                      color="white"
                      mb={4}
                    >
                      Profile Setup
                    </Text>
                    <Stack>
                      <Field.Root>
                        <Field.Label color="gray.200">Location</Field.Label>
                        <Input
                          ref={locationInputRef}
                          placeholder="Enter your city"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label color="gray.200">Bio</Field.Label>
                        <Textarea
                          placeholder="Tell us about yourself"
                          rows={4}
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                        />
                      </Field.Root>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              )}
            </Box>

            {step < steps.length && (
              <ButtonGroup size="sm" mt={6}>
                <Button
                  variant="outline"
                  colorScheme="gray"
                  onClick={handlePrev}
                  disabled={step === 0 || isUploading || isFinishing}
                >
                  Prev
                </Button>
                <Button
                  colorScheme="cyan"
                  onClick={handleNext}
                  disabled={
                    isUploading ||
                    isFinishing ||
                    (step === 0 && !isStep0Valid())
                  }
                >
                  {isUploading || isFinishing ? (
                    <Spinner size="sm" />
                  ) : step === steps.length - 1 ? (
                    "Finish"
                  ) : (
                    "Next"
                  )}
                </Button>
              </ButtonGroup>
            )}
          </>
        ) : (
          <Card.Root
            bg="gray.800"
            borderRadius="xl"
            shadow="md"
            w="full"
            p={8}
            textAlign="center"
          >
            <Text fontSize="2xl" fontWeight="bold" color="white" mb={4}>
              🎉 Onboarding Complete!
            </Text>
            <Text fontSize="md" color="gray.300" mb={6}>
              Your profile is all set up. Welcome aboard!
            </Text>
            <Button
              colorScheme="cyan"
              onClick={() => (window.location.href = "/")}
            >
              Go to Dashboard
            </Button>
          </Card.Root>
        )}
      </VStack>
    </Center>
  );
}
