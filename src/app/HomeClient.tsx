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
  Sparkles,
  Zap,
} from "lucide-react";
import { useMotionValue, useTransform, useSpring } from "framer-motion";
import { apiClient } from "@/lib/api";
import NextImage from "next/image";
import Header from "@/components/layout/Header";
import TrailerModal from "@/components/movie-detail/TrailerModal";
import MovieSlider from "@/components/home/MovieSlider";

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
  rating?: number;
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  type: string;
}

interface HomeMoviesData {
  featured: Movie | null;
  hot: Movie[];
  best_selling: Movie[];
  coming_soon: Movie[];
}

export default function HomeClient() {
  const [data, setData] = useState<HomeMoviesData>({
    featured: null,
    hot: [],
    best_selling: [],
    coming_soon: [],
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerTab, setBannerTab] = useState<"hot" | "bestseller">("hot");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const fetchHomeData = useCallback(async () => {
    try {
      const [movieRes, campaignRes] = await Promise.all([
        apiClient.get<{ success: boolean; data: HomeMoviesData }>("/movies/home"),
        apiClient.get<{ data: Campaign[] }>("/campaigns?limit=4"),
      ]);

      const movieData = movieRes as unknown as { success: boolean; data: HomeMoviesData };
      const campaignData = campaignRes as unknown as { data: Campaign[] };

      if (movieData.success && movieData.data) {
        setData(movieData.data);
      }
      if (campaignData.data) {
        setCampaigns(campaignData.data);
      }
    } catch (error) {
      console.error("Failed to fetch home data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
    setMounted(true);
  }, [fetchHomeData]);

  const {
    hot: hotMovies,
    best_selling: bestSellingMovies,
    coming_soon: comingSoonMovies,
  } = data;

  const displayMovies =
    bannerTab === "hot" ? hotMovies.slice(0, 4) : bestSellingMovies.slice(0, 4);
  const activeMovie =
    displayMovies.length > 0 ? displayMovies[currentSlide] : null;

  // Parallax Mouse Effect for Hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth - 0.5);
    mouseY.set(clientY / innerHeight - 0.5);
  };

  const bannerX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), { stiffness: 100, damping: 30 });
  const bannerY = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 100, damping: 30 });

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
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [bannerTab]);

  return (
    <div
      className="w-full h-full flex flex-col pb-20 bg-background text-foreground relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Particles */}
      <StarfieldBackground />

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
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ x: bannerX, y: bannerY }}
              className="absolute inset-0 z-0"
            >
              <NextImage
                src={activeMovie.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"}
                alt={activeMovie.title}
                fill
                priority
                className="object-cover opacity-40 md:opacity-50 scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden md:block" />
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
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:animate-[shimmer_2.5s_infinite] transition-transform" />

              <div className="flex items-center gap-3 mb-4 text-primary font-bold tracking-widest text-[10px] md:text-sm uppercase">
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-primary" /> Tiêu
                Điểm {bannerTab === "hot" ? "Hot" : "Bán Chạy"}
              </div>
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
              <h2 className="text-3xl md:text-6xl font-black text-white mb-4 uppercase tracking-tight leading-tight min-h-auto md:min-h-[144px] flex items-center">
                <span className="line-clamp-2">{activeMovie.title}</span>
              </h2>
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
                  {mounted
                    ? new Date(activeMovie.release_date).toLocaleDateString("vi-VN")
                    : "Đang tải..."}
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

          {/* Controls & Switcher */}
          <div className="absolute bottom-6 md:bottom-12 right-6 lg:right-12 z-40 flex flex-col items-end gap-6">
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
          <Link href="/movies" className="text-primary hover:text-white text-sm font-semibold mb-1 transition-colors">
            Xem tất cả &rarr;
          </Link>
        </div>

        {loading || !mounted ? (
          <LoadingSkeleton />
        ) : (
          <MovieSlider
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
      <div className="max-w-7xl mx-auto w-full px-6 mt-24">
        <div className="flex items-end justify-between mb-10 border-b border-border pb-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-secondary" /> Phim{" "}
            <span className="text-secondary">Bán Chạy Nhất</span>
          </h2>
          <Link href="/movies" className="text-secondary hover:text-white text-sm font-semibold mb-1 transition-colors">
            Xem tất cả &rarr;
          </Link>
        </div>

        {loading || !mounted ? (
          <LoadingSkeleton />
        ) : (
          <MovieSlider
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

      {/* PHIM SẮP CHIẾU SECTION */}
      {comingSoonMovies && comingSoonMovies.length > 0 && (
        <div className="max-w-7xl mx-auto w-full px-6 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10 border-b border-white/5 pb-4"
          >
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-400" /> Phim{" "}
              <span className="text-blue-400">Sắp Chiếu</span>
            </h2>
            <Link href="/movies" className="text-white/40 hover:text-white text-sm font-semibold mb-1 transition-colors">
              Xem tất cả &rarr;
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {comingSoonMovies.map((movie, idx) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-[2rem] bg-card/30 border border-white/5 h-40 md:h-56 flex items-center transition-all hover:border-blue-400/30"
              >
                <div className="w-1/3 h-full overflow-hidden relative">
                  <NextImage
                    src={movie.poster_url}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="w-2/3 p-4 md:p-6 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-white font-bold text-sm md:text-lg line-clamp-2 uppercase group-hover:text-blue-400 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
                      Khởi chiếu: {mounted ? new Date(movie.release_date).toLocaleDateString("vi-VN") : "---"}
                    </p>
                  </div>
                  <Link
                    href={`/movies/${movie.id}`}
                    className="mt-2 text-[10px] md:text-xs font-black text-blue-400 flex items-center gap-1 group/link"
                  >
                    XEM CHI TIẾT <ChevronRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="absolute top-4 right-4 text-blue-400/20 group-hover:text-blue-400/40 transition-colors">
                  <Calendar className="w-12 h-12" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* PROMOTIONS SECTION */}
      {campaigns && campaigns.length > 0 && (
        <div className="max-w-7xl mx-auto w-full px-6 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10 border-b border-white/5 pb-4"
          >
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Zap className="w-8 h-8 text-secondary" /> Ưu Đãi{" "}
              <span className="text-secondary">& Sự Kiện</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campaigns.map((camp, idx) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative h-48 rounded-3xl overflow-hidden glass hover:border-secondary/40 transition-all cursor-pointer"
              >
                <NextImage src={camp.thumbnail_url} alt={camp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-2 py-0.5 bg-secondary text-black text-[10px] font-black rounded-md uppercase mb-2 inline-block">{camp.type}</span>
                  <h3 className="text-white font-bold leading-tight group-hover:text-secondary transition-colors line-clamp-2 uppercase italic text-sm">{camp.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StarfieldBackground() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<{ x: string; y: string; opacity: number; scale: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const init = () => {
      setMounted(true);
      setStars([...Array(20)].map(() => ({
        x: Math.random() * 100 + "%",
        y: Math.random() * 100 + "%",
        opacity: Math.random() * 0.5 + 0.2,
        scale: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 10,
      })));
    };
    if (typeof window !== "undefined") {
      requestAnimationFrame(init);
    }
  }, []);

  if (!mounted) return <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" />;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          initial={{ x: star.x, y: star.y, opacity: star.opacity, scale: star.scale }}
          animate={{ y: ["-10%", "110%"], opacity: [0, 0.5, 0] }}
          transition={{ duration: star.duration, repeat: Infinity, ease: "linear", delay: star.delay }}
          className="absolute w-[2px] h-[2px] bg-white rounded-full blur-[1px]"
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,9,20,0.05),transparent_70%)]" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 hover:cursor-progress">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-[2/3] bg-card rounded-2xl animate-pulse border border-border"></div>
      ))}
    </div>
  );
}
