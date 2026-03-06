"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import {
  User,
  LogOut,
  Ticket,
  ChevronDown,
  MapPin,
  Gift,
  Film,
  History,
  Key,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/layout/SearchBar";

export default function Header() {
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Đóng menu khi resize lên màn hình lớn
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[110] w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          {/* LEFT: LOGO & SEARCH BAR */}
          <div className="flex items-center gap-8 flex-1">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Ticket className="w-8 h-8 text-primary" />
              <span className="text-2xl font-black tracking-tighter text-white">
                BOOKING<span className="text-primary">SHOW</span>
              </span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-md hidden lg:block">
              <SearchBar />
            </div>
          </div>

          {/* RIGHT: NAVIGATION DROPDOWNS */}
          <div className="h-6 w-px bg-border mx-2 hidden lg:block" />

          {/* RIGHT: NAVIGATION DROPDOWNS (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Dropdown 1: Phim */}
            <div className="relative group h-full">
              <button className="flex items-center gap-1.5 text-sm font-bold text-gray-300 hover:text-white transition-colors py-8">
                Phim{" "}
                <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-[80px] left-1/2 -translate-x-1/2 mt-0 w-56 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                <div className="p-2 flex flex-col gap-1">
                  <Link
                    href="/movies?status=now_showing"
                    className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Film className="w-4 h-4 text-primary" /> Phim đang chiếu
                  </Link>
                  <Link
                    href="/movies?status=coming_soon"
                    className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Film className="w-4 h-4 text-gray-400" /> Phim sắp chiếu
                  </Link>
                  <Link
                    href="/movies"
                    className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Film className="w-4 h-4 text-gray-400" /> Tìm kiếm phim
                  </Link>
                </div>
              </div>
            </div>

            {/* Dropdown 2: Rạp */}
            <div className="relative group h-full">
              <button className="flex items-center gap-1.5 text-sm font-bold text-gray-300 hover:text-white transition-colors py-8">
                Rạp{" "}
                <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-[80px] left-1/2 -translate-x-1/2 mt-0 w-56 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                <div className="p-2 flex flex-col gap-1">
                  <Link
                    href="/cinemas"
                    className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-primary" /> Danh sách rạp
                  </Link>
                  <Link
                    href="/cinemas"
                    className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-blue-400" /> Tìm rạp gần bạn
                  </Link>
                </div>
              </div>
            </div>

            {/* Dropdown 3: Ưu đãi */}
            <div className="relative group h-full">
              <button className="flex items-center gap-1.5 text-sm font-bold text-gray-300 hover:text-white transition-colors py-8">
                Ưu đãi{" "}
                <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-[80px] left-1/2 -translate-x-1/2 mt-0 w-60 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                <div className="p-2 flex flex-col gap-1">
                  <Link
                    href="/promotions"
                    className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4 text-primary" /> Mã giảm giá đang
                    có
                  </Link>
                  <Link
                    href="/promotions/campaigns"
                    className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Ticket className="w-4 h-4 text-secondary" /> Chương trình
                    khuyến mãi
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-border mx-2 hidden lg:block" />

          {/* Account & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Account (Desktop & Mobile) */}
            <div className="relative group h-full">
              {!mounted ? (
                <div className="flex items-center gap-2 text-sm font-bold text-gray-300 py-6">
                  <div className="w-9 h-9 bg-[#1f1f1f] border border-[#333] rounded-full animate-pulse" />
                  <div className="flex flex-col items-start leading-none hidden sm:block animate-pulse">
                    <div className="w-12 h-2.5 bg-gray-700 rounded mb-1.5" />
                    <div className="w-16 h-3 bg-gray-600 rounded" />
                  </div>
                </div>
              ) : user ? (
                <button className="flex items-center justify-center text-sm font-bold text-gray-300 hover:text-white transition-colors py-6 pl-2">
                  <div className="bg-[#1f1f1f] border border-[#333] rounded-full p-2 group-hover:border-primary transition-colors">
                    <User className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors py-6"
                >
                  <div className="bg-[#1f1f1f] border border-[#333] rounded-full p-2 group-hover:border-primary transition-colors">
                    <User className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col items-start leading-none hidden sm:block">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                      Tài khoản
                    </span>
                    <span className="text-sm">Đăng nhập</span>
                  </div>
                </Link>
              )}

              {user && (
                <div className="absolute top-[80px] right-0 mt-0 w-56 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                  <div className="p-2 flex flex-col gap-1">
                    <div className="px-3 py-2 mb-1 flex flex-col border-b border-border/50">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                        Tài khoản
                      </span>
                      <span className="text-sm font-bold text-white truncate">
                        {user.fullName}
                      </span>
                    </div>
                    <Link
                      href="/profile"
                      className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Hồ sơ cá nhân
                    </Link>
                    <Link
                      href="/orders/my"
                      className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <History className="w-4 h-4" /> Lịch sử đơn hàng
                    </Link>
                    <Link
                      href="/profile/tickets"
                      className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4" /> Vé của tôi
                    </Link>
                    <Link
                      href="/reset-password"
                      className="px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" /> Đổi mật khẩu
                    </Link>
                    <div className="h-px w-full bg-border my-1" />
                    <button
                      onClick={logout}
                      className="w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 text-left font-semibold"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger Menu Toggle (Mobile Only) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors relative z-[120]"
            >
              {isMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-20 z-[105] bg-black/95 backdrop-blur-xl border-t border-border lg:hidden overflow-y-auto"
          >
            <div className="p-6 flex flex-col gap-8">
              {/* Mobile Search Bar */}
              <SearchBar
                placeholder="Tìm kiếm phìm..."
                inputClassName="rounded-2xl py-4 pl-12 pr-10"
                onClose={() => setIsMenuOpen(false)}
              />

              {/* Mobile Nav Links */}
              <div className="grid grid-cols-1 gap-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-2 ml-2">
                  Danh mục
                </span>
                <details className="group">
                  <summary className="flex items-center justify-between p-4 bg-[#111] rounded-2xl text-white font-bold cursor-pointer list-none">
                    PHIM{" "}
                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-2 pl-4 flex flex-col gap-1">
                    <Link
                      href="/movies?status=now_showing"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-3 text-gray-400 hover:text-primary transition-colors flex items-center gap-3"
                    >
                      <Film className="w-4 h-4" /> Phim đang chiếu
                    </Link>
                    <Link
                      href="/movies?status=coming_soon"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-3 text-gray-400 hover:text-primary transition-colors flex items-center gap-3"
                    >
                      <Film className="w-4 h-4" /> Phim sắp chiếu
                    </Link>
                  </div>
                </details>

                <details className="group mt-2">
                  <summary className="flex items-center justify-between p-4 bg-[#111] rounded-2xl text-white font-bold cursor-pointer list-none">
                    RẠP{" "}
                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-2 pl-4 flex flex-col gap-1">
                    <Link
                      href="/cinemas"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-3 text-gray-400 hover:text-primary transition-colors flex items-center gap-3"
                    >
                      <MapPin className="w-4 h-4" /> Danh sách rạp
                    </Link>
                  </div>
                </details>

                <details className="group mt-2">
                  <summary className="flex items-center justify-between p-4 bg-[#111] rounded-2xl text-white font-bold cursor-pointer list-none">
                    ƯU ĐÃI{" "}
                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-2 pl-4 flex flex-col gap-1">
                    <Link
                      href="/promotions"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-3 text-gray-400 hover:text-primary transition-colors flex items-center gap-3"
                    >
                      <Gift className="w-4 h-4" /> Khuyến mãi HOT
                    </Link>
                  </div>
                </details>
              </div>

              {/* Account Info (Mobile) */}
              {user ? (
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold ml-2">
                    Tài khoản
                  </span>
                  <div className="p-6 bg-primary/10 border border-primary/20 rounded-[2rem] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-primary uppercase font-bold tracking-widest">
                        Đã đăng nhập
                      </p>
                      <p className="text-white font-black text-lg">
                        {user.fullName}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="bg-primary p-3 rounded-full text-white shadow-lg"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Link
                      href="/orders/my"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-4 bg-[#111] rounded-2xl text-gray-300 flex items-center gap-3"
                    >
                      <History className="w-5 h-5" /> Lịch sử đơn hàng
                    </Link>
                    <Link
                      href="/profile/tickets"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-4 bg-[#111] rounded-2xl text-gray-300 flex items-center gap-3"
                    >
                      <Ticket className="w-5 h-5" /> Vé của tôi
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-center flex items-center justify-center gap-2 shadow-lg"
                  >
                    <User className="w-5 h-5" /> ĐĂNG NHẬP NGAY
                  </Link>
                </div>
              )}

              <div className="mt-auto py-8">
                <p className="text-center text-gray-600 text-xs font-bold tracking-widest uppercase">
                  Booking<span className="text-primary italic">Show</span>{" "}
                  &copy; 2025
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
