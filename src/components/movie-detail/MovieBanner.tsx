"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Clock, Calendar, Play, Ticket, Star } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import TrailerModal from "./TrailerModal";

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  release_date: string;
  poster_url: string;
  trailer_url: string;
  genres?: Genre[];
  rating?: number; // Optional
}

export default function MovieBanner({ movie }: { movie: Movie }) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] flex items-end overflow-hidden group">
      {/* Background w/ Parallax */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img
          src={
            movie.poster_url ||
            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"
          }
          alt={movie.title}
          className="w-full h-full object-cover opacity-40 blur-[2px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col md:flex-row gap-8 pb-12 items-end md:items-center">
        {/* Poster (Left) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block shrink-0"
        >
          <div className="relative w-56 lg:w-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all duration-500">
            <img
              src={
                movie.poster_url ||
                "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600"
              }
              alt={movie.title}
              className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </motion.div>

        {/* Info (Right) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-end w-full"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres?.map((g) => (
              <span
                key={g.id}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white font-medium backdrop-blur-md"
              >
                {g.name}
              </span>
            ))}
            {(movie.rating || 8.5) > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-xs text-yellow-400 font-bold backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {movie.rating || 8.5}/10
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-4 uppercase tracking-tight leading-tight drop-shadow-lg">
            {movie.title}
          </h1>

          <div className="flex items-center gap-4 md:gap-6 text-sm md:text-base text-gray-300 font-medium mb-8">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
              <Clock className="w-4 h-4 text-primary" />
              {movie.duration_minutes} Phút
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
              <Calendar className="w-4 h-4 text-primary" />
              {format(new Date(movie.release_date), "dd/MM/yyyy")}
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const showtimesSection = document.getElementById("showtimes");
                if (showtimesSection) {
                  showtimesSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group relative overflow-hidden bg-primary text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(229,9,20,0.5)] hover:shadow-[0_0_40px_rgba(229,9,20,0.8)] hover:scale-105"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite]" />
              <Ticket className="w-5 h-5 relative z-10 group-hover:-rotate-12 transition-transform" />
              <span className="relative z-10">Đặt Vé Ngay</span>
            </button>
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="border-2 border-white/30 bg-black/30 backdrop-blur-md hover:bg-white text-white hover:text-black px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105"
            >
              <Play className="w-5 h-5" /> Trailer
            </button>
          </div>
        </motion.div>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailer_url}
      />
    </div>
  );
}
