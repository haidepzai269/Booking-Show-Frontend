"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/app/admin/layout";
import {
  LayoutDashboard,
  Film,
  Clock,
  Building2,
  UtensilsCrossed,
  Tag,
  Megaphone,
  LogOut,
  Clapperboard,
  ChevronRight,
  ShoppingCart,
  Users,
  Undo2,
  ChevronLeft,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/movies", label: "Quản lý Phim", icon: <Film size={18} /> },
  { href: "/admin/showtimes", label: "Suất chiếu", icon: <Clock size={18} /> },
  { href: "/admin/cinemas", label: "Rạp chiếu", icon: <Building2 size={18} /> },
  {
    href: "/admin/concessions",
    label: "Đồ ăn & Thức uống",
    icon: <UtensilsCrossed size={18} />,
  },
  {
    href: "/admin/promotions",
    label: "Mã Khuyến mãi",
    icon: <Tag size={18} />,
  },
  {
    href: "/admin/campaigns",
    label: "Chiến dịch",
    icon: <Megaphone size={18} />,
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    icon: <ShoppingCart size={18} />,
  },
  { href: "/admin/users", label: "Người dùng", icon: <Users size={18} /> },
  { href: "/admin/refunds", label: "Hoàn tiền", icon: <Undo2 size={18} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  // ─── Xác định class của aside theo chế độ ───────────────────────────────
  // Mobile  (<768px): vị trí cố định, ẩn bằng translateX, full width 240px, z-40
  // Tablet  (768px+): cố định w-16, icon-only
  // Desktop (1024px+): cố định w-60, đầy đủ
  const asideBase =
    "fixed left-0 top-0 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col z-40 transition-all duration-300 ease-in-out";

  // Mobile: ẩn bằng translateX
  const mobileClass = mobileOpen ? "translate-x-0" : "-translate-x-full";

  // Tablet+: luôn hiện nhưng width thay đổi theo collapsed
  // Desktop với collapsed = false thì w-60, collapsed = true hoặc tablet thì w-16
  const desktopWidthClass = collapsed
    ? "md:translate-x-0 md:w-16"
    : "md:translate-x-0 md:w-16 lg:w-60";

  return (
    <aside className={`${asideBase} w-60 ${mobileClass} ${desktopWidthClass}`}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] rounded-lg flex items-center justify-center shadow-lg shadow-red-900/30 shrink-0">
            <Clapperboard size={16} className="text-white" />
          </div>
          {/* Label - ẩn khi tablet collapsed, hiện khi desktop full */}
          <div
            className={`overflow-hidden transition-all duration-300 hidden ${collapsed ? "" : "lg:block"}`}
          >
            <p className="text-[var(--text-primary)] font-bold text-sm leading-tight whitespace-nowrap">
              Booking Show
            </p>
            <p className="text-[var(--text-secondary)] text-xs">Admin Panel</p>
          </div>
        </Link>

        {/* Collapse button - chỉ hiện desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-6 h-6 items-center justify-center text-white/30 hover:text-white transition-colors shrink-0"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {/* Label section - chỉ hiện desktop full */}
        <p
          className={`text-[var(--text-secondary)]/50 text-[10px] font-semibold uppercase tracking-wider px-3 pb-2 hidden ${collapsed ? "" : "lg:block"} truncate opacity-100 transition-opacity duration-200`}
        >
          Menu chính
        </p>

        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <div key={item.href} className="relative group/item">
              {item.disabled ? (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/25 cursor-not-allowed select-none">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="text-sm flex-1 hidden lg:block truncate">
                    {item.label}
                  </span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                    active
                      ? "bg-[var(--primary)]/15 text-[var(--primary)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`shrink-0 transition-colors ${active ? "text-[var(--primary)]" : "group-hover:text-[var(--text-primary)]"}`}
                  >
                    {item.icon}
                  </span>
                  {/* Label - ẩn khi tablet icon-only, hiện khi desktop full hoặc mobile drawer */}
                  <span
                    className={`text-sm font-medium flex-1 truncate hidden ${collapsed ? "" : "lg:block"}`}
                  >
                    {item.label}
                  </span>
                  {/* Mobile: luôn hiện label */}
                  <span className="text-sm font-medium flex-1 truncate lg:hidden md:hidden block">
                    {item.label}
                  </span>
                  {active && (
                    <ChevronRight
                      size={14}
                      className="text-[var(--primary)]/60 shrink-0 lg:block hidden"
                    />
                  )}
                </Link>
              )}

              {/* Tooltip – chỉ hiện trên tablet (md) khi hover, ẩn desktop */}
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-[#1a1a1a] border border-white/10 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50
                            opacity-0 -translate-x-2 transition-all duration-200
                            group-hover/item:opacity-100 group-hover/item:translate-x-0
                            hidden md:block lg:hidden"
              >
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a1a1a]" />
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="px-2 pb-4 border-t border-[var(--border-color)] pt-3 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/3 mb-1 overflow-hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary)]/10 rounded-full flex items-center justify-center shrink-0">
            <span className="text-[var(--primary)] text-xs font-bold uppercase">
              {user?.fullName?.charAt(0) || "A"}
            </span>
          </div>
          <div
            className={`flex-1 min-w-0 hidden ${collapsed ? "" : "lg:block"}`}
          >
            <p className="text-[var(--text-primary)] text-xs font-medium truncate">
              {user?.fullName || "Admin"}
            </p>
            <p className="text-[var(--text-secondary)] text-[10px] truncate">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 group"
        >
          <LogOut size={16} className="shrink-0 group-hover:text-red-400" />
          <span className={`text-sm hidden ${collapsed ? "" : "lg:block"}`}>
            Đăng xuất
          </span>
          <span className="text-sm lg:hidden md:hidden block">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
