"use client";

import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const THEME_STORAGE_KEY = "toty-theme";

const applyTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let savedTheme: string | null = null;

    try {
      savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
      console.error("Unable to read saved theme preference:", error);
    }

    const syncTheme = (dark: boolean) => {
      applyTheme(dark);
      setIsDark(dark);
    };

    syncTheme(savedTheme ? savedTheme === "dark" : mediaQuery.matches);

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(THEME_STORAGE_KEY) === null) {
          syncTheme(event.matches);
        }
      } catch (error) {
        console.error("Unable to check saved theme preference:", error);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        syncTheme(event.newValue === "dark");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    applyTheme(nextIsDark);
    setIsDark(nextIsDark);

    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextIsDark ? "dark" : "light",
      );
    } catch (error) {
      console.error("Unable to save theme preference:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"
      }
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-neutral text-secondry transition hover:border-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {isDark ? (
        <MdLightMode aria-hidden="true" className="text-xl" />
      ) : (
        <MdDarkMode aria-hidden="true" className="text-xl" />
      )}
    </button>
  );
};

export default ThemeToggle;
