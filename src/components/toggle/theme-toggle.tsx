"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")
      }
    >
      {theme === "dark" ?
        <Sun className="dark:text-white mx-[8px] size-[20px] cursor-pointer" />
        : <Moon className="dark:text-white mx-[8px] size-[20px] cursor-pointer" />}
    </div>
  );
}
