"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Ticket, MoveLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Không Tìm Thấy Trang | Booking Show",
  description: "Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã được di dời.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center relative overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-2xl"
      >
        <div className="relative w-full max-w-md aspect-square mb-8 group">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full relative"
          >
            <Image
              src="/images/errors/404.png"
              alt="404 Not Found - Empty Cinema Seat"
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(229,9,20,0.3)] transition-transform duration-500 group-hover:scale-105"
              priority
            />
          </motion.div>
          
          {/* 404 Big Text with Glow */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[120px] md:text-[180px] font-black italic opacity-10 select-none pointer-events-none text-primary">
            404
          </div>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter"
        >
          Suất chiếu <span className="text-primary italic">"Hết Chỗ"</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed font-medium"
        >
          Có vẻ như bạn đã đi nhầm vào một phòng chiếu trống hoặc phim đã hạ màn. <br className="hidden md:block" />
          Đừng lo, những siêu phẩm bom tấn khác đang chờ bạn khám phá!
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 items-center"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-bold transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 group"
          >
            <Home className="w-5 h-5" /> Quay Lại Trang Chủ
          </Link>
          
          <Link
            href="/movies"
            className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold transition-all backdrop-blur-md hover:scale-105 active:scale-95 group"
          >
            <Ticket className="w-5 h-5 text-secondary" /> Phim Đang Chiếu
          </Link>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => window.history.back()}
          className="mt-8 text-gray-500 hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors uppercase tracking-widest"
        >
          <MoveLeft className="w-4 h-4" /> Quay lại trang trước
        </motion.button>
      </motion.div>
    </div>
  );
}
