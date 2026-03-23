"use client";

import { usePathname } from "next/navigation";
import AdminSearchBar from "./AdminSearchBar";
import AdminNotification from "./AdminNotification";
import { ThemeSelector } from "./ThemeSelector";
import { useAuthStore } from "@/store/authStore";
import { useSidebar } from "@/app/admin/layout";
import Link from "next/link";
import { Menu, PanelLeftClose, PanelLeftOpen, Home } from "lucide-react";

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/movies": "Quản lý Phim",
  "/admin/movies/create": "Tạo phim mới",
  "/admin/showtimes": "Quản lý Suất chiếu",
  "/admin/cinemas": "Quản lý Rạp",
  "/admin/concessions": "Đồ ăn & Thức uống",
  "/admin/promotions": "Khuyến mãi",
  "/admin/orders": "Đơn hàng",
  "/admin/users": "Người dùng",
  "/admin/refunds": "Hoàn tiền",
  "/admin/blacklisted-words": "Từ ngữ cấm",
  "/admin/reviews": "Đánh giá",
};

function getBreadcrumb(pathname: string): string {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
  const segments = pathname.split("/");
  if (segments.includes("edit")) return "Chỉnh sửa phim";
  if (segments.includes("create")) return "Tạo mới";
  return "Admin";
}

export default function AdminHeader() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const pageName = getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-20 h-16 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-color)] flex items-center px-4 gap-3">
      {/* Mobile: Hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Tablet+: Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex lg:hidden w-9 h-9 rounded-lg bg-white/5 items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Toggle sidebar collapse"
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      {/* Page Title / Breadcrumb */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] truncate">
          <span className="hidden sm:inline">Admin</span>
          <span className="hidden sm:inline">/</span>
          <span className="text-[var(--text-primary)] font-medium truncate">
            {pageName}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Link 
          href="/" 
          className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all group"
          title="Quay về trang chủ"
        >
          <Home size={18} className="group-hover:scale-110 transition-transform" />
        </Link>
        <ThemeSelector />
        <AdminSearchBar />
        <AdminNotification />
        <div className="w-px h-6 bg-white/10 hidden sm:block" />
        <Link href="/profile" className="hidden sm:flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary)]/10 rounded-full flex items-center justify-center">
            <span className="text-[var(--primary)] text-xs font-bold uppercase">
              {user?.fullName?.charAt(0) || "A"}
            </span>
          </div>
          <span className="text-white/60 text-sm hidden md:block">
            {user?.fullName}
          </span>
          {user?.rank && (
            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${
                user.rank === "DIAMOND"
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  : user.rank === "PLATINUM"
                    ? "bg-slate-500/20 text-slate-300 border-slate-500/30"
                    : user.rank === "GOLD"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : user.rank === "SILVER"
                        ? "bg-gray-400/20 text-gray-400 border-gray-400/30"
                        : "bg-orange-500/20 text-orange-400 border-orange-500/30"
              }`}
            >
              {user.rank}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
