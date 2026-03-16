"use client";

import React from "react";
import { User, Shield, Ticket, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: User, path: "/settings?tab=profile" },
  { id: "security", label: "Bảo mật", icon: Shield, path: "/settings?tab=security" },
  { id: "bookings", label: "Lịch sử đặt vé", icon: Ticket, path: "/settings?tab=bookings" },
  { id: "payments", label: "Phương thức thanh toán", icon: CreditCard, path: "/settings?tab=payments" },
];

export default function SettingsSidebar({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: string; 
  onTabChange: (id: string) => void;
}) {
  return (
    <div className="w-full md:w-80 glass-card rounded-3xl p-6 flex flex-col gap-2 h-fit">
      <div className="flex items-center gap-4 mb-8 px-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
          A
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Admin User</h3>
          <p className="text-gray-400 text-sm">Superstar Member</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-500/20 border-l-4 border-purple-500 animate-in fade-in slide-in-from-left-1 duration-300" />
              )}
              
              <div className="flex items-center gap-4 relative z-10">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-purple-600 text-white shadow-lg shadow-purple-500/40 scale-110" : "bg-white/5 text-gray-400 group-hover:text-white"
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`font-medium transition-all duration-300 ${isActive ? "ml-1" : ""}`}>{item.label}</span>
              </div>
              <ChevronRight size={16} className={`relative z-10 transition-all duration-500 ${
                isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              }`} />
            </button>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-white/5 px-2">
        <button className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium w-full text-left">
          Đăng xuất tài khoản
        </button>
      </div>
    </div>
  );
}
