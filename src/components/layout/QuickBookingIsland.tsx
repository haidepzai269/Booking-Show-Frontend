"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Ticket,
  ChevronUp,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { useChatStore } from "@/store/chatStore";
import { apiClient } from "@/lib/api";

export default function QuickBookingIsland() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { setOpen, isOpen } = useChatStore();
  const pathname = usePathname();

  const [movies, setMovies] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNowShowing = async () => {
      try {
        const res = await apiClient.get<any>("/movies/now-showing");
        if (res && res.data) {
          setMovies(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch now showing movies:", error);
      }
    };
    fetchNowShowing();
  }, []);

  useEffect(() => {
    if (movies.length <= 3) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 3;
        return next >= movies.length ? 0 : next;
      });
    }, 5000); // 5s đổi bộ 3 mới

    return () => clearInterval(interval);
  }, [movies.length]);

  // Danh sách các route ẩn QuickBookingIsland
  const hiddenRoutes = [
    "/admin",
    "/login",
    "/register",
    "/forgot-password",
    "/booking",
    "/checkout",
    "/payment",
    "/profile",
    "/promotions/campaigns"
  ];

  const shouldHide = hiddenRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (shouldHide) {
      requestAnimationFrame(() => {
        setIsVisible(false);
      });
      return;
    }
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Kiểm tra nếu cách đáy trang ít hơn 300px (vùng của Footer)
      const isAtBottom = (scrollY + windowHeight) > (documentHeight - 300);

      if (scrollY > 300 && !isAtBottom) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldHide]);

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, x: "-50%", scale: 0, opacity: 0 }}
          animate={{ y: 0, x: "-50%", scale: 1, opacity: 1 }}
          exit={{ y: 50, x: "-50%", scale: 0, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            mass: 1
          }}
          className="fixed bottom-8 left-1/2 z-[90] w-fit min-w-[280px] origin-bottom"
        >
          <motion.div
            layout
            transition={{
              layout: { type: "spring", stiffness: 300, damping: 25, mass: 1 }
            }}
            className={`
              bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] 
              shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(229,9,20,0.1)]
              overflow-hidden flex flex-col items-center
              ${isExpanded ? "p-6 w-[320px] md:w-[450px]" : "p-2 px-6 h-14 flex-row gap-4"}
            `}
          >
            {!isExpanded ? (
              <div
                className="flex items-center gap-4 cursor-pointer w-full group"
                onClick={() => setIsExpanded(true)}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.5)] group-hover:scale-110 transition-transform">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none">
                    Quick Book
                  </span>
                  <span className="text-xs font-bold text-white/80">
                    Đặt vé nhanh phim đang hot
                  </span>
                </div>
                <ChevronUp className="w-4 h-4 text-white/40 ml-auto animate-bounce" />
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOpen(!isOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${isOpen ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 hover:bg-white/10"}`}
                  >
                    {isOpen ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-xs font-black text-white uppercase tracking-widest cursor-pointer">
                      {isOpen ? "Đang trò chuyện" : "Gợi ý đặt nhanh"}
                    </span>
                  </motion.button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-[10px] font-bold text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    THU GỌN
                  </button>
                </div>

                {movies.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    <AnimatePresence mode="wait">
                      {movies.slice(currentIndex, currentIndex + 3).map((movie) => (
                        <motion.div
                          key={movie.id}
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <Link
                            href={`/movies/${movie.id}`}
                            className="flex flex-col gap-2 group cursor-pointer"
                          >
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all shadow-lg group-hover:shadow-primary/20 bg-white/5 flex items-center justify-center">
                              {movie.poster_url ? (
                                <img
                                  src={movie.poster_url}
                                  alt={movie.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <Sparkles className="w-8 h-8 text-white/10 animate-pulse" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <span className="text-[8px] font-black text-white uppercase tracking-tighter">Đặt ngay</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-white/70 group-hover:text-white transition-colors line-clamp-1 text-center">
                              {movie.title}
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      href="/movies"
                      className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-white">
                          Chọn Phim & Rạp
                        </span>
                        <span className="text-[10px] text-white/40">
                          Tìm suất chiếu gần bạn nhất
                        </span>
                      </div>
                    </Link>
                  </div>
                )}

                <Link
                  href="/movies"
                  className="w-full py-4 bg-primary hover:bg-rose-700 text-white rounded-[1.25rem] font-black text-sm transition-all shadow-[0_10px_20px_rgba(229,9,20,0.3)] flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  KHÁM PHÁ TẤT CẢ PHIM
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
