"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCcw, Home, AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("System Error (500):", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center relative overflow-hidden bg-background">
      {/* Background Glow - Gold for Error */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-3xl"
      >
        <div className="relative w-full max-w-sm aspect-square mb-6">
          <motion.div
            animate={{ 
              rotate: [0, -1, 1, -1, 0],
              scale: [1, 1.02, 1, 1.01, 1] 
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="w-full h-full relative"
          >
            <Image
              src="/images/errors/500.png"
              alt="500 Internal Server Error - Broken Projector"
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(245,197,24,0.2)]"
              priority
            />
          </motion.div>
          
          {/* Glitch Overlay Effect */}
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay opacity-20 animate-pulse rounded-full" />
        </div>

        <div className="flex items-center gap-2 mb-4 px-4 py-1.5 bg-secondary/10 border border-secondary/20 rounded-full text-secondary text-xs md:text-sm font-black uppercase tracking-widest">
          <AlertCircle className="w-4 h-4" /> TRỤC TRẶC KỸ THUẬT
        </div>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter"
        >
          Máy chiếu đang <span className="text-secondary italic">"Đình Công"</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed font-medium"
        >
          Hệ thống đang gặp sự cố bất ngờ phía sau cánh gà. <br className="hidden md:block" />
          Các kỹ thuật viên của chúng tôi đang nỗ lực hết mình để đưa suất chiếu trở lại.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row gap-4 items-center"
        >
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-10 py-4 bg-secondary hover:bg-secondary-hover text-black rounded-full font-bold transition-all shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 group"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" /> Thử Lại Ngay
          </button>
          
          <Link
            href="/"
            className="flex items-center gap-2 px-10 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold transition-all backdrop-blur-md hover:scale-105 active:scale-95"
          >
            <Home className="w-5 h-5" /> Về Trang Chủ
          </Link>
        </motion.div>

        {error.digest && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] text-gray-600 font-mono tracking-tighter"
          >
            Error ID: {error.digest}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
