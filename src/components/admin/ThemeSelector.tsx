"use client";

import React, { useState, useRef, useEffect } from "react";
import { ThemeType } from "@/lib/themeConfig";
import { useTheme } from "./ThemeProvider";
import { Palette, Check } from "lucide-react";

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themeOptions: { id: ThemeType; label: string; colors: string[] }[] = [
    { id: "dark", label: "Cyber Dark", colors: ["#0d0d0d", "#e50914"] },
    { id: "midnight", label: "Midnight Blue", colors: ["#020617", "#0ea5e9"] },
    { id: "light", label: "Modern Light", colors: ["#f8fafc", "#6366f1"] },
    { id: "emerald", label: "Emerald Forest", colors: ["#064e3b", "#10b981"] },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-200"
        title="Đổi giao diện"
      >
        <Palette size={16} className="text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--text-primary)] hidden sm:block">
          Theme
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3 py-2">
            Chọn giao diện
          </p>
          <div className="space-y-1">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setTheme(option.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-150 ${
                  currentTheme === option.id
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    <div
                      className="w-4 h-4 rounded-full border border-white/10"
                      style={{ backgroundColor: option.colors[0] }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-white/10"
                      style={{ backgroundColor: option.colors[1] }}
                    />
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                {currentTheme === option.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
