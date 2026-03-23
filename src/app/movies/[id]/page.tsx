"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { ApiResponse } from "@/types/api";

// Import Custom Components
import MovieBanner from "@/components/movie-detail/MovieBanner";
import MovieInfo from "@/components/movie-detail/MovieInfo";
import CastCarousel from "@/components/movie-detail/CastCarousel";
import RelatedMovies from "@/components/movie-detail/RelatedMovies";
import MovieReviews from "@/components/movie-detail/MovieReviews";

interface ExtraInfo {
  rating: number;
  director: string;
  cast: {
    id: number;
    name: string;
    character: string;
    profile_image: string;
  }[];
  trivias?: {
    question: string;
    answer: string;
  }[];
}

interface Movie {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  release_date: string;
  poster_url: string;
  trailer_url: string;
  genres: { id: number; name: string }[];
}

interface Cinema {
  id: number;
  name: string;
}

interface Room {
  id: number;
  name: string;
  cinema: Cinema;
}

interface Showtime {
  id: number;
  start_time: string;
  end_time: string;
  base_price: number;
  room: Room;
}

export default function MovieDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [extraInfo, setExtraInfo] = useState<ExtraInfo | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingExtra, setIsLoadingExtra] = useState(true);

  // Group showtimes by day
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const [movieRes, showtimesRes, extraRes] = await Promise.all([
          apiClient.get<{ success: boolean; data: Movie }>(`/movies/${id}`),
          apiClient.get<{ success: boolean; data: Showtime[] }>(
            `/movies/${id}/showtimes`,
          ),
          apiClient
            .get<{ success: boolean; data: ExtraInfo }>(`/movies/${id}/extra`)
            .catch(() => ({ data: null })), // Bỏ qua nếu lỗi
        ]);

        const movieData = movieRes as unknown as ApiResponse<Movie>;
        const showtimesData = showtimesRes as unknown as ApiResponse<Showtime[]>;
        const extraData = extraRes as unknown as ApiResponse<ExtraInfo>;

        if (movieData.data) setMovie(movieData.data);
        if (extraData?.data) {
          setExtraInfo(extraData.data);
          setIsLoadingExtra(false);
        } else {
          setIsLoadingExtra(false);
        }
        if (showtimesData.data) {
          setShowtimes(showtimesData.data);

          // Lấy ngày đầu tiên có lịch chiếu làm default
          if (showtimesData.data.length > 0) {
            const defaultDate = format(
              new Date(showtimesData.data[0].start_time),
              "yyyy-MM-dd",
            );
            setSelectedDate(defaultDate);
          }
        }
      } catch (error) {
        console.error("Failed to fetch movie detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-card rounded-full border-t-primary animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center text-white text-xl">
          Không tìm thấy thông tin phim.
        </div>
      </div>
    );
  }

  // Handle grouping showtimes
  const dates = Array.from(
    new Set(
      showtimes.map((st) => format(new Date(st.start_time), "yyyy-MM-dd")),
    ),
  ).sort();

  const filteredShowtimes = showtimes.filter(
    (st) => format(new Date(st.start_time), "yyyy-MM-dd") === selectedDate,
  );

  // Group by Cinema
  const groupedByCinema = filteredShowtimes.reduce(
    (acc, st) => {
      const cinemaName = st.room.cinema?.name || "Rạp Không Rõ";
      if (!acc[cinemaName]) acc[cinemaName] = [];
      acc[cinemaName].push(st);
      return acc;
    },
    {} as Record<string, Showtime[]>,
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 w-full pb-20">
        {/* Banner Section */}
        <MovieBanner movie={{ ...movie, rating: extraInfo?.rating }} />

        {/* Cấu trúc chính */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 mt-12 space-y-20">
          {/* Thông tin nội dung & Q&A */}
          <MovieInfo
            movie={movie}
            trivias={extraInfo?.trivias}
            director={extraInfo?.director}
            isLoadingExtra={isLoadingExtra}
          />

          {/* Dàn Diễn Viên */}
          {extraInfo?.cast && extraInfo.cast.length > 0 && (
            <CastCarousel cast={extraInfo.cast} />
          )}

          {/* Showtimes Section: Cần id="showtimes" để btn Đặt vé cuộn xuống */}
          <div id="showtimes" className="scroll-mt-32">
            <h2 className="text-2xl font-black text-white mb-6 uppercase border-l-4 border-primary pl-4">
              Lịch Chiếu
            </h2>

            {/* Date Selector */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 hide-scroll">
              {dates.map((date) => {
                const dateObj = new Date(date);
                const isSelected = date === selectedDate;
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl transition-all border ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                        : "bg-card border-border text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <span className="text-xs uppercase font-bold mb-1">
                      {format(dateObj, "EEE")}
                    </span>
                    <span className="text-xl font-black">
                      {format(dateObj, "dd/MM")}
                    </span>
                  </button>
                );
              })}
              {dates.length === 0 && (
                <p className="text-gray-500 bg-white/5 px-6 py-4 rounded-xl border border-white/10 w-full text-center">
                  Bộ phim này hiện chưa có lịch chiếu. Vui lòng quay lại sau!
                </p>
              )}
            </div>

            {/* Showtime Grid by Cinema */}
            <div className="space-y-8">
              {Object.entries(groupedByCinema).map(([cinemaName, stList]) => (
                <div
                  key={cinemaName}
                  className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-widest uppercase">
                      {cinemaName}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {stList.map((st) => (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={st.id}
                        onClick={() =>
                          router.push(`/booking/seat-selection/${st.id}`)
                        }
                        className="flex flex-col items-center p-3 border border-border rounded-xl hover:border-primary hover:bg-primary/20 transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(229,9,20,0.3)] bg-black/40"
                      >
                        <span className="text-lg font-black text-white group-hover:text-primary transition-colors">
                          {format(new Date(st.start_time), "HH:mm")}
                        </span>
                        <span className="text-xs text-gray-400 font-medium mt-1">
                          {st.base_price.toLocaleString("vi-VN")} đ
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Label BookingShow */}
          <div className="flex justify-center items-center py-12 lg:py-20 overflow-hidden relative">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent top-1/2"></div>
            <h2 className="relative text-5xl md:text-7xl lg:text-9xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-500 opacity-20 transform -rotate-2 select-none pointer-events-none mix-blend-overlay">
              BookingShow
            </h2>
            <h2 className="absolute text-5xl md:text-7xl lg:text-9xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white opacity-90 drop-shadow-[0_0_30px_rgba(229,9,20,0.6)] transform -rotate-2 scale-[1.02] hover:scale-110 transition-transform duration-700 cursor-default">
              BookingShow
            </h2>
          </div>

          {/* Đánh Giá & Nhận Xét */}
          <MovieReviews movieId={movie.id} />

          {/* Phim Tương Tự */}
          <RelatedMovies currentMovie={movie} />
        </div>
      </main>
    </div>
  );
}
