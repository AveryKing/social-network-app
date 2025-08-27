"use client";

import {
  chakra,
  type IconButtonProps,
  type HTMLChakraProps,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import { ThemeProvider, useTheme, type ThemeProviderProps } from "next-themes";
import * as React from "react";
import { LuMoon, LuSun } from "react-icons/lu";

// ✅ Use type instead of empty interface
export type ColorModeProviderProps = ThemeProviderProps;

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      defaultTheme="dark"
      enableSystem={false}
      {...props}
    />
  );
}

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by returning default until mounted
  const colorMode = mounted
    ? ((forcedTheme ?? resolvedTheme ?? "dark") as ColorMode)
    : "dark";

  const toggleColorMode = () => {
    if (mounted) {
      setTheme(colorMode === "dark" ? "light" : "dark");
    }
  };

  return {
    colorMode,
    setColorMode: (mode: ColorMode) => {
      if (mounted) {
        setTheme(mode);
      }
    },
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton boxSize="1em" />;
  }

  return colorMode === "dark" ? <LuMoon /> : <LuSun />;
}

// ✅ Use type instead of empty interface
type ColorModeButtonProps = Omit<IconButtonProps, "aria-label">;

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode, colorMode } = useColorMode();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton
        ref={ref}
        variant="ghost"
        aria-label="Loading theme"
        disabled
        {...props}
      >
        <Skeleton boxSize="1em" />
      </IconButton>
    );
  }

  return (
    <IconButton
      ref={ref}
      onClick={toggleColorMode}
      variant="ghost"
      aria-label={`Toggle ${colorMode === "dark" ? "light" : "dark"} mode`}
      {...props}
    >
      {colorMode === "dark" ? <LuSun /> : <LuMoon />}
    </IconButton>
  );
});

export const LightMode = React.forwardRef<
  HTMLSpanElement,
  HTMLChakraProps<"span">
>(function LightMode(props, ref) {
  return (
    <chakra.span
      color="fg"
      display="contents"
      className="chakra-theme light"
      colorPalette="gray"
      colorScheme="light"
      ref={ref}
      {...props}
    />
  );
});

export const DarkMode = React.forwardRef<
  HTMLSpanElement,
  HTMLChakraProps<"span">
>(function DarkMode(props, ref) {
  return (
    <chakra.span
      color="fg"
      display="contents"
      className="chakra-theme dark"
      colorPalette="gray"
      colorScheme="dark"
      ref={ref}
      {...props}
    />
  );
});
