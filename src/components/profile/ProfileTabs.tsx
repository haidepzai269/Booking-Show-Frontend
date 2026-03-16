"use client";

import React from "react";
import { User, Shield, CreditCard, History, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "profile", label: "Cá nhân", icon: User },
  { id: "security", label: "Bảo mật", icon: Shield },
  { id: "bookings", label: "Đơn hàng", icon: History },
  { id: "payments", label: "Thanh toán", icon: CreditCard },
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all
              ${isActive ? "text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabProfile"
                className="absolute inset-0 bg-gradient-to-r from-[#e50914] to-[#f5c518] rounded-xl"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className={`w-4 h-4 z-10 ${isActive ? "text-white" : ""}`} />
            <span className="z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
