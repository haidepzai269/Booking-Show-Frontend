"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "red" | "gold" | "blue" | "green" | "purple";
  trend?: number; // % thay đổi
  prefix?: string;
  suffix?: string;
}

const colorMap = {
  red: {
    bg: "from-red-500/10 to-red-900/5",
    border: "border-red-500/20",
    icon: "bg-red-500/15 text-red-400",
    glow: "shadow-red-500/10",
  },
  gold: {
    bg: "from-yellow-500/10 to-yellow-900/5",
    border: "border-yellow-500/20",
    icon: "bg-yellow-500/15 text-yellow-400",
    glow: "shadow-yellow-500/10",
  },
  blue: {
    bg: "from-blue-500/10 to-blue-900/5",
    border: "border-blue-500/20",
    icon: "bg-blue-500/15 text-blue-400",
    glow: "shadow-blue-500/10",
  },
  green: {
    bg: "from-green-500/10 to-green-900/5",
    border: "border-green-500/20",
    icon: "bg-green-500/15 text-green-400",
    glow: "shadow-green-500/10",
  },
  purple: {
    bg: "from-purple-500/10 to-purple-900/5",
    border: "border-purple-500/20",
    icon: "bg-purple-500/15 text-purple-400",
    glow: "shadow-purple-500/10",
  },
};

function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    startRef.current = null;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  trend,
  prefix = "",
  suffix = "",
}: StatsCardProps) {
  const numericValue = typeof value === "number" ? value : 0;
  const animatedValue = useCountUp(numericValue);
  const displayValue = typeof value === "number" ? animatedValue : value;
  const colors = colorMap[color];

  return (
    <div
      className={`relative bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-5 shadow-lg ${colors.glow} overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
    >
      {/* Subtle glow */}
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${colors.bg}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center shadow-sm`}
          >
            {icon}
          </div>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                trend >= 0
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {trend >= 0 ? (
                <TrendingUp size={11} />
              ) : (
                <TrendingDown size={11} />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <p className="text-white/50 text-sm mb-1 font-medium">{title}</p>
        <p className="text-white text-2xl font-bold tracking-tight">
          {prefix}
          {typeof value === "number"
            ? displayValue.toLocaleString("vi-VN")
            : value}
          {suffix}
        </p>
      </div>
    </div>
  );
}
