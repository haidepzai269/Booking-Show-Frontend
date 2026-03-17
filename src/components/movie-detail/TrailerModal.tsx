"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl?: string;
}

export default function TrailerModal({
  isOpen,
  onClose,
  trailerUrl,
}: TrailerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  // Xử lý extract Youtube ID để dùng iframe mượt hơn (nếu là link youtube chuẩn)
  const getYoutubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = trailerUrl ? getYoutubeVideoId(trailerUrl) : null;
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`
    : trailerUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-hidden"
          onClick={onClose}
        >
          {/* Cinema Curtains Animation */}
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "-150%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 1, ease: [0.45, 0.05, 0.55, 0.95] }}
            className="absolute inset-y-0 left-0 w-full bg-[#1a0505] z-[101] border-r-4 border-primary/20 shadow-[20px_0_50px_rgba(0,0,0,0.8)]"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: "150%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 1, ease: [0.45, 0.05, 0.55, 0.95] }}
            className="absolute inset-y-0 right-0 w-full bg-[#1a0505] z-[101] border-l-4 border-primary/20 shadow-[-20px_0_50px_rgba(0,0,0,0.8)]"
          />

          {/* Ambient Glow from Video */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(229,9,20,0.2) 0%, transparent 70%)"
            }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 100, rotateX: 20 }}
            animate={{ scale: 1, opacity: 1, y: 40, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100, rotateX: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 150,
              delay: 0.3 // Chờ rèm mở xong
            }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_100px_rgba(229,9,20,0.3)] border border-white/5 z-[102]"
            onClick={(e) => e.stopPropagation()}
            style={{ perspective: "1000px" }}
          >
            {/* Close button with high-end look */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 z-50">
                <button
                onClick={onClose}
                className="absolute top-4 right-6 group flex items-center gap-2"
                >
                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Đóng Chiếu</span>
                <div className="w-10 h-10 bg-white/5 hover:bg-primary text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border border-white/10 group-hover:scale-110 active:scale-95">
                    <X className="w-5 h-5" />
                </div>
                </button>
            </div>

            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="Movie Trailer"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-4">
                <div className="p-8 rounded-full bg-white/5 border border-white/10">
                    <X className="w-12 h-12 text-primary" />
                </div>
                <p className="font-bold tracking-widest uppercase text-xs">Không tìm thấy Trailer</p>
              </div>
            )}
            
            {/* Edge Reflection */}
            <div className="absolute inset-0 border-[1px] border-white/10 rounded-xl pointer-events-none"></div>
          </motion.div>
          
          {/* Cinema Room Decor (Seats silhouette bottom) */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent opacity-60 z-[103] pointer-events-none flex justify-center items-end pb-4">
               <div className="flex gap-4 opacity-20">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                         <div key={i} className="w-8 h-12 bg-zinc-800 rounded-t-lg"></div>
                    ))}
               </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
