"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Ticket,
  Calendar,
  Clock,
  Star,
  Flame,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Header from "@/components/layout/Header";
import TrailerModal from "@/components/movie-detail/TrailerModal";

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
  genres: Genre[];
}

interface HomeMoviesData {
  featured: Movie | null;
  hot: Movie[];
  best_selling: Movie[];
}

export default function Home() {
  const [data, setData] = useState<HomeMoviesData>({
    featured: null,
    hot: [],
    best_selling: [],
  });
  const [loading, setLoading] = useState(true);
  const [bannerTab, setBannerTab] = useState<"hot" | "bestseller">("hot");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    const fetchHomeMovies = async () => {
      try {
        const res = await apiClient.get<
          any,
          { success: boolean; data: HomeMoviesData }
        >("/movies/home");
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch home movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeMovies();
  }, []);

  const {
    featured: featuredMovie,
    hot: hotMovies,
    best_selling: bestSellingMovies,
  } = data;

  const displayMovies =
    bannerTab === "hot" ? hotMovies.slice(0, 4) : bestSellingMovies.slice(0, 4);
  const activeMovie =
    displayMovies.length > 0 ? displayMovies[currentSlide] : null;

  const nextSlide = useCallback(() => {
    if (displayMovies.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % displayMovies.length);
    }
  }, [displayMovies.length]);

  const prevSlide = useCallback(() => {
    if (displayMovies.length > 0) {
      setCurrentSlide(
        (prev) => (prev - 1 + displayMovies.length) % displayMovies.length,
      );
    }
  }, [displayMovies.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000); // Auto change every 5s
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Reset slide when tab changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [bannerTab]);

  return (
    <div className="w-full h-full flex flex-col pb-20 bg-background text-foreground">
      {/* HEADER */}
      <Header />

      {/* HERO CAROUSEL SECTION */}
      {loading ? (
        <div className="w-full h-[60vh] md:h-[70vh] bg-background flex items-center justify-center">
           <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="w-full md:w-2/3 h-80 md:h-[440px] bg-card/40 rounded-[2.5rem] animate-pulse"></div>
              <div className="hidden md:block w-1/3 h-[440px] bg-card/20 rounded-[2.5rem] animate-pulse"></div>
           </div>
        </div>
      ) : activeMovie ? (
        <div className="w-full min-h-[60vh] md:h-[70vh] relative flex items-center overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMovie.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0"
            >
              <img
                src={
                  activeMovie.poster_url ||
                  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"
                }
                alt={activeMovie.title}
                className="w-full h-full object-cover opacity-40 md:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 md:via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent hidden md:block" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-6 flex flex-col md:flex-row justify-between items-center mt-24 md:mt-16 h-full pb-12 md:pb-0">
            <motion.div
              key={`info-${activeMovie.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl w-full glass-card p-6 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-start min-h-auto md:min-h-[440px] relative overflow-hidden group/card"
            >
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:animate-[shimmer_2.5s_infinite] transition-transform" />

              <div className="flex items-center gap-3 mb-4 text-primary font-bold tracking-widest text-[10px] md:text-sm uppercase">
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-primary" /> Tiêu
                Điểm {bannerTab === "hot" ? "Hot" : "Bán Chạy"}
              </div>
              {/* Genres badges */}
              {activeMovie.genres && activeMovie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeMovie.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] md:text-xs text-gray-300 font-medium backdrop-blur-sm"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-3xl md:text-6xl font-black text-white mb-4 uppercase tracking-tight leading-tight min-h-auto md:min-h-[144px] flex items-center">
                <span className="line-clamp-2">{activeMovie.title}</span>
              </h1>
              <div className="h-20 md:h-28 mb-6 overflow-y-auto pr-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <p className="text-gray-300 text-sm md:text-lg leading-relaxed line-clamp-3 md:line-clamp-none">
                  {activeMovie.description ||
                    "Hãy tận hưởng những phút giây điện ảnh cực đỉnh tại hệ thống rạp chuẩn 5 sao của chúng tôi."}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-6 text-xs md:text-sm text-gray-400 font-medium">
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 text-primary" />{" "}
                  {activeMovie.duration_minutes} Phút
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 text-primary" />{" "}
                  {new Date(activeMovie.release_date).toLocaleDateString(
                    "vi-VN",
                  )}
                </span>
              </div>
            </motion.div>

            {/* Mobile Buttons Area */}
            <div className="w-full md:hidden mt-8 flex flex-col gap-4">
              <Link
                href={`/movies/${activeMovie.id}`}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <Ticket className="w-5 h-5" /> ĐẶT VÉ NGAY
              </Link>
              {activeMovie.trailer_url && (
                <button
                  onClick={() => {
                    setSelectedTrailer(activeMovie.trailer_url);
                    setIsTrailerOpen(true);
                  }}
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-md text-white py-4 rounded-2xl font-black text-center flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" /> XEM TRAILER
                </button>
              )}
            </div>
          </div>

          {/* Controls & Switcher - Hidden or adjusted for mobile */}
          <div className="absolute bottom-6 md:bottom-12 right-6 lg:right-12 z-40 flex flex-col items-end gap-6">
            {/* Desktop Action Buttons */}
            <motion.div
              key={`btn-${activeMovie.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hidden md:flex flex-wrap gap-4 justify-end"
            >
              <Link
                href={`/movies/${activeMovie.id}`}
                className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all shadow-[0_0_40px_-10px_rgba(229,9,20,0.8)]"
              >
                <Ticket className="w-5 h-5" /> Đặt Vé Ngay
              </Link>
              {activeMovie.trailer_url && (
                <button
                  onClick={() => {
                    setSelectedTrailer(activeMovie.trailer_url);
                    setIsTrailerOpen(true);
                  }}
                  className="border border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-5 h-5" /> Trailer
                </button>
              )}
            </motion.div>

            {/* Slider Indicators */}
            <div className="flex gap-2 mb-4 md:mb-0">
              {displayMovies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx
                      ? "w-6 md:w-8 bg-primary shadow-[0_0_10px_rgba(229,9,20,0.8)]"
                      : "w-1.5 md:w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Arrows - Only on desktop */}
          {displayMovies.length > 1 && (
            <div className="hidden md:block">
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 text-white border border-white/10 hover:bg-primary hover:border-primary transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 text-white border border-white/10 hover:bg-primary hover:border-primary transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Top Switcher - Adjust position for mobile */}
          <div className="absolute top-24 md:top-28 right-4 md:right-12 z-30 scale-75 md:scale-100 origin-right">
            <div className="flex items-center gap-2 glass-dark p-1 md:p-1.5 rounded-2xl">
              <button
                onClick={() => setBannerTab("hot")}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 flex items-center gap-2 ${
                  bannerTab === "hot"
                    ? "bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.5)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4" /> Đang Hot
              </button>
              <button
                onClick={() => setBannerTab("bestseller")}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 flex items-center gap-2 ${
                  bannerTab === "bestseller"
                    ? "bg-secondary text-black shadow-[0_0_20px_rgba(255,225,107,0.5)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Bán Chạy
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[40vh] flex items-center justify-center text-gray-500">
          Chưa có dữ liệu phim
        </div>
      )}

      {/* PHIM ĐANG HOT SECTION */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-16">
        <div className="flex items-end justify-between mb-10 border-b border-border pb-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Flame className="w-8 h-8 text-primary" /> Phim{" "}
            <span className="text-primary">Đang Hot</span>
          </h2>
          <Link
            href="/movies"
            className="text-primary hover:text-white text-sm font-semibold mb-1 transition-colors"
          >
            Xem tất cả &rarr;
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <MovieGrid
            movies={hotMovies}
            badgeColor="primary"
            onPlayTrailer={(url) => {
              setSelectedTrailer(url);
              setIsTrailerOpen(true);
            }}
          />
        )}
      </div>

      {/* PHIM BÁN CHẠY NHẤT SECTION */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-16">
        <div className="flex items-end justify-between mb-10 border-b border-border pb-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-secondary" /> Phim{" "}
            <span className="text-secondary">Bán Chạy Nhất</span>
          </h2>
          <Link
            href="/movies"
            className="text-secondary hover:text-white text-sm font-semibold mb-1 transition-colors"
          >
            Xem tất cả &rarr;
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <MovieGrid
            movies={bestSellingMovies}
            badgeColor="secondary"
            onPlayTrailer={(url) => {
              setSelectedTrailer(url);
              setIsTrailerOpen(true);
            }}
          />
        )}

        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={selectedTrailer || ""}
        />
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-12 h-12 border-4 border-card rounded-full border-t-primary animate-spin"></div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 hover:cursor-progress">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="aspect-[2/3] bg-card rounded-2xl animate-pulse border border-border"
        ></div>
      ))}
    </div>
  );
}

function MovieGrid({
  movies,
  badgeColor = "primary",
  onPlayTrailer,
}: {
  movies: Movie[];
  badgeColor?: "primary" | "secondary";
  onPlayTrailer: (url: string) => void;
}) {
  const isPrimary = badgeColor === "primary";
  const badgeClass = isPrimary
    ? "text-primary border-primary"
    : "text-black bg-secondary border-secondary font-black";
  const hoverTextClass = isPrimary
    ? "group-hover:text-primary"
    : "group-hover:text-secondary";
  const buttonBg = isPrimary
    ? "bg-primary text-white"
    : "bg-secondary text-black";
  const shadowEffect = isPrimary
    ? "shadow-[0_0_30px_rgba(229,9,20,0.6)]"
    : "shadow-[0_0_30px_rgba(255,225,107,0.6)]";

  if (movies.length === 0)
    return <div className="text-gray-500">Chưa có dữ liệu phim.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {movies.map((movie, index) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group relative flex flex-col cursor-pointer"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-card border border-border glass-card group-hover:border-primary/50 transition-all duration-500">
            <img
              src={
                movie.poster_url ||
                "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"
              }
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-90" />

            {/* View Ticket Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px] z-10">
              <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Link
                  href={`/movies/${movie.id}`}
                  className={`${buttonBg} p-4 rounded-full ${shadowEffect} hover:scale-110 transition-transform`}
                  title="Đặt vé"
                >
                  <Ticket className="w-6 h-6" />
                </Link>
                {movie.trailer_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayTrailer(movie.trailer_url);
                    }}
                    className="bg-white/20 backdrop-blur-md text-white p-4 rounded-full border border-white/30 hover:bg-primary hover:border-primary transition-all hover:scale-110 shadow-xl"
                    title="Xem Trailer"
                  >
                    <Play className="w-6 h-6 fill-current" />
                  </button>
                )}
              </div>
            </div>

            {/* Genre and Trailer Tags */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
              {movie.genres && movie.genres.length > 0 ? (
                <div
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black glass border uppercase tracking-wider ${badgeClass}`}
                >
                  {movie.genres[0].name}
                </div>
              ) : (
                <div
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black glass border uppercase tracking-wider ${badgeClass}`}
                >
                  2D PHỤ ĐỀ
                </div>
              )}
              {movie.trailer_url && (
                <div className="px-2 py-1 rounded-md text-[9px] font-bold bg-primary/20 text-primary border border-primary/30 backdrop-blur-md uppercase shadow-lg">
                  Trailer
                </div>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-left z-10 transform group-hover:-translate-y-1 transition-transform">
              <h3
                className={`text-lg md:text-xl font-bold text-white mb-1 line-clamp-2 leading-tight transition-colors ${hoverTextClass} drop-shadow-md`}
              >
                {movie.title}
              </h3>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span>{movie.duration_minutes} Phút</span>
                <span className="text-secondary flex items-center gap-1">
                  <Star className="w-3 h-3 fill-secondary" /> 8.5
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
