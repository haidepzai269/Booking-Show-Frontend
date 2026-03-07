"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { ThemeType, themes } from "@/lib/themeConfig";
import { apiClient } from "@/lib/api";

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthStore();
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("dark");

  useEffect(() => {
    if (user?.themePreference) {
      setCurrentTheme(user.themePreference as ThemeType);
    }
  }, [user?.themePreference]);

  useEffect(() => {
    const themeData = themes[currentTheme];
    const root = document.documentElement;

    // Apply CSS Variables
    root.style.setProperty("--primary", themeData.primary);
    root.style.setProperty("--primary-hover", themeData.primaryHover);
    root.style.setProperty("--bg-main", themeData.bgMain);
    root.style.setProperty("--bg-sidebar", themeData.bgSidebar);
    root.style.setProperty("--bg-card", themeData.bgCard);
    root.style.setProperty("--bg-header", themeData.bgHeader);
    root.style.setProperty("--text-primary", themeData.textPrimary);
    root.style.setProperty("--text-secondary", themeData.textSecondary);
    root.style.setProperty("--border-color", themeData.borderColor);
    root.style.setProperty("--chart-grad-start", themeData.chartGradStart);
    root.style.setProperty("--chart-grad-end", themeData.chartGradEnd);

    // Set color scheme attribute for browser native elements
    root.setAttribute("data-theme", currentTheme);
    if (currentTheme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [currentTheme]);

  const setTheme = async (theme: ThemeType) => {
    setCurrentTheme(theme);
    try {
      await apiClient.patch("/users/theme", { theme });
      // Update local store if needed (authStore usually persists, but we might want to update the user object)
      if (user) {
        useAuthStore.getState().setAuth(useAuthStore.getState().token!, {
          ...user,
          themePreference: theme,
        });
      }
    } catch (err) {
      console.error("Failed to update theme on server", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
