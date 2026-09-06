"use client";

import {Moon, Sun} from "lucide-react";
import {useTheme} from "@/lib/use-theme";
import {Button} from "../ui/button";

type ThemeToggleProps = {
  className?: string;
  size?: "tiny" | "small" | "medium" | "large";
};

export function ThemeToggle({className, size = "medium"}: ThemeToggleProps) {
  const {theme, toggleTheme} = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      className={className}
      type="button"
      variant="tertiary"
      size={size}
      shape="square"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      onClick={toggleTheme}
      prefix={isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    />
  );
}
