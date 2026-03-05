"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

// Context để share sidebar state
interface SidebarContextType {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN" && user.role !== "CINEMA_MANAGER") {
      router.replace("/");
    }
  }, [mounted, token, user, router]);

  if (
    !mounted ||
    !token ||
    !user ||
    (user.role !== "ADMIN" && user.role !== "CINEMA_MANAGER")
  ) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Tính toán margin-left của content theo chế độ sidebar
  // Mobile: không margin (sidebar là overlay)
  // Tablet collapsed: ml-16 (64px)
  // Desktop full: ml-60 (240px)
  const contentClass = collapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-16 lg:ml-60";

  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed }}
    >
      <div className="min-h-screen bg-[#0d0d0d]">
        {/* Backdrop mobile */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <AdminSidebar />

        <div
          className={`flex flex-col min-h-screen transition-all duration-300 ${contentClass}`}
        >
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
