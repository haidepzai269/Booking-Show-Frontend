"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  ChevronLeft,
  Ticket,
  Building2,
  Film,
  Star,
  Calendar,
  Loader2,
  MonitorPlay,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { apiClient } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  image_url: string;
}

interface Room {
  id: number;
  cinema_id: number;
  name: string;
  capacity: number;
}

interface Genre {
  id: number;
  name: string;
}

interface ShowtimeItem {
  showtime_id: number;
  start_time: string;
  end_time: string;
  base_price: number;
  room_name: string;
}

interface MovieItem {
  movie_id: number;
  title: string;
  poster_url: string;
  duration_minutes: number;
  genres: Genre[];
  showtimes: ShowtimeItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateParam(d: Date) {
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

function formatDayLabel(d: Date) {
  const isToday = d.toDateString() === new Date().toDateString();
  return {
    day: isToday
      ? "Hôm nay"
      : d.toLocaleDateString("vi-VN", { weekday: "short" }),
    date: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    isToday,
  };
}

function detectRoomType(name: string) {
  const n = name.toUpperCase();
  if (n.includes("IMAX"))
    return {
      label: "IMAX",
      color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    };
  if (n.includes("4DX"))
    return {
      label: "4DX",
      color: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    };
  if (n.includes("3D"))
    return {
      label: "3D",
      color: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    };
  return {
    label: "2D",
    color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30",
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CinemaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cinemaId = params.id as string;

  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const days = getNext7Days();
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);

  // Fetch cinema info + rooms on mount (độc lập để lỗi 1 API không crash cả page)
  useEffect(() => {
    const fetchCinema = async () => {
      try {
        const res = await apiClient.get<
          any,
          { success: boolean; data: Cinema }
        >(`/cinemas/${cinemaId}`);
        if (res.data) setCinema(res.data);
      } catch (e) {
        console.error("cinema fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    const fetchRooms = async () => {
      try {
        const res = await apiClient.get<
          any,
          { success: boolean; data: Room[] }
        >(`/cinemas/${cinemaId}/rooms`);
        if (res.data) setRooms(res.data);
      } catch (e) {
        console.warn("rooms fetch error (route may not exist yet):", e);
      }
    };

    fetchCinema();
    fetchRooms();
  }, [cinemaId]);

  // Fetch movies when date changes
  const fetchMovies = useCallback(
    async (dateIdx: number) => {
      setLoadingMovies(true);
      try {
        const date = formatDateParam(days[dateIdx]);
        const res = await apiClient.get<
          any,
          { success: boolean; data: MovieItem[] }
        >(`/cinemas/${cinemaId}/movies?date=${date}`);
        if (res.data) setMovies(res.data);
        else setMovies([]);
      } catch {
        setMovies([]);
      } finally {
        setLoadingMovies(false);
      }
    },
    [cinemaId],
  );

  useEffect(() => {
    fetchMovies(selectedDateIdx);
  }, [selectedDateIdx, fetchMovies]);

  // ─── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Building2 className="w-16 h-16 text-zinc-600" />
        <p className="text-zinc-400 text-lg">Không tìm thấy rạp chiếu.</p>
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline font-semibold"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div className="relative h-[45vh] min-h-[340px] overflow-hidden">
        {/* Background */}
        <img
          src={
            cinema.image_url ||
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop"
          }
          alt={cinema.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full text-white text-sm font-semibold hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Cinema info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-black rounded uppercase tracking-wider">
                  Rạp Chiếu Phim
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white mb-3 leading-tight">
                {cinema.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  {cinema.address}
                </span>
                {cinema.city && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-zinc-500" />
                    {cinema.city}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────────  */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ── LEFT SIDEBAR: ROOM INFO ─────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rooms */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-white font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-primary" />
                Phòng Chiếu ({rooms.length})
              </h3>
              {rooms.length === 0 ? (
                <p className="text-zinc-500 text-sm">
                  Chưa có thông tin phòng chiếu.
                </p>
              ) : (
                <div className="space-y-2">
                  {rooms.map((room) => {
                    const type = detectRoomType(room.name);
                    return (
                      <div
                        key={room.id}
                        className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
                      >
                        <span className="text-zinc-300 text-sm font-medium">
                          {room.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${type.color}`}
                          >
                            {type.label}
                          </span>
                          <span className="text-zinc-500 text-xs">
                            {room.capacity} ghế
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Tiện Ích
              </h3>
              {[
                "Âm thanh Dolby Atmos",
                "Màn hình 4K HDR",
                "Ghế recliner cao cấp",
                "Bắp nước premium",
                "Bãi đỗ xe",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-zinc-400"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: MOVIES WITH DATE PICKER ──────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <Film className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black text-white">
                Phim Đang Chiếu
              </h2>
            </div>

            {/* Date Picker */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {days.map((d, idx) => {
                const label = formatDayLabel(d);
                const isActive = selectedDateIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateIdx(idx)}
                    className={`
                      flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border transition-all duration-300 min-w-[70px]
                      ${
                        isActive
                          ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                      }
                    `}
                  >
                    <span
                      className={`text-xs font-bold ${isActive ? "text-white/80" : ""}`}
                    >
                      {label.day}
                    </span>
                    <span
                      className={`text-base font-black mt-0.5 ${isActive ? "text-white" : ""}`}
                    >
                      {label.date}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Movie List */}
            <AnimatePresence mode="wait">
              {loadingMovies ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-20"
                >
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </motion.div>
              ) : movies.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 gap-4"
                >
                  <Calendar className="w-12 h-12 text-zinc-600" />
                  <p className="text-zinc-500 text-lg font-semibold">
                    Không có suất chiếu nào trong ngày này
                  </p>
                  <p className="text-zinc-600 text-sm">
                    Hãy chọn ngày khác để xem lịch chiếu
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={`movies-${selectedDateIdx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {movies.map((movie, mIdx) => (
                    <motion.div
                      key={movie.movie_id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: mIdx * 0.05 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300"
                    >
                      <div className="flex gap-4 p-4 sm:p-5">
                        {/* Poster */}
                        <Link
                          href={`/movies/${movie.movie_id}`}
                          className="flex-shrink-0"
                        >
                          <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl overflow-hidden bg-zinc-800 group">
                            <img
                              src={
                                movie.poster_url ||
                                "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=400&auto=format&fit=crop"
                              }
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Link href={`/movies/${movie.movie_id}`}>
                              <h3 className="text-white font-black text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
                                {movie.title}
                              </h3>
                            </Link>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="flex items-center gap-1 text-zinc-400 text-xs">
                              <Clock className="w-3 h-3" />
                              {movie.duration_minutes} phút
                            </span>
                            {movie.genres?.slice(0, 2).map((g) => (
                              <span
                                key={g.id}
                                className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] rounded-full font-medium"
                              >
                                {g.name}
                              </span>
                            ))}
                          </div>

                          {/* Showtimes */}
                          <div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                              Suất chiếu:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {movie.showtimes.map((st) => {
                                const time = new Date(
                                  st.start_time,
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                                const type = detectRoomType(st.room_name);
                                return (
                                  <Link
                                    key={st.showtime_id}
                                    href={`/booking/seat-selection/${st.showtime_id}`}
                                  >
                                    <div className="group flex flex-col items-center px-3 py-2 bg-zinc-800 hover:bg-primary border border-zinc-700 hover:border-primary rounded-xl transition-all duration-200 cursor-pointer min-w-[70px]">
                                      <span className="text-white font-black text-sm group-hover:text-white">
                                        {time}
                                      </span>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span
                                          className={`text-[9px] font-black ${type.color.split(" ")[0]} group-hover:text-white/80`}
                                        >
                                          {type.label}
                                        </span>
                                        <span className="text-zinc-500 text-[9px] group-hover:text-white/60">
                                          {st.room_name.length > 8
                                            ? st.room_name.slice(0, 8) + "…"
                                            : st.room_name}
                                        </span>
                                      </div>
                                      <span className="text-zinc-400 text-[10px] group-hover:text-white/70 mt-0.5">
                                        {st.base_price.toLocaleString("vi-VN")}đ
                                      </span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* CTA desktop */}
                        <div className="hidden sm:flex flex-col items-end justify-between">
                          <Link href={`/movies/${movie.movie_id}`}>
                            <button className="text-primary hover:text-white text-xs font-bold transition-colors">
                              Chi tiết →
                            </button>
                          </Link>
                          <Link
                            href={`/booking/seat-selection/${movie.showtimes[0]?.showtime_id}`}
                          >
                            <button className="flex items-center gap-2 bg-primary hover:bg-rose-700 text-white text-sm font-black px-4 py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(229,9,20,0.3)]">
                              <Ticket className="w-4 h-4" />
                              Đặt Vé
                            </button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
