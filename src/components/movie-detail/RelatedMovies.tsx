"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import NextImage from "next/image";
import { ApiResponse } from "@/types/api";

interface Movie {
  id: number;
  title: string;
  duration_minutes: number;
  poster_url: string;
  genres: { id: number; name: string }[];
  rating?: number;
}

export default function RelatedMovies({ currentMovie }: { currentMovie: Movie }) {
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy toàn bộ phim và filter ngẫu nhiên (vì chưa có API suggest riêng)
    // Tự filter dựa trên cùng thể loại hoặc ngẫu nhiên
    const fetchRelated = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: Movie[] }>("/movies/");
        const responseData = res as unknown as ApiResponse<Movie[]>;
        if (responseData.success && responseData.data) {
          // Lọc loại trừ phim hiện tại
          const others = responseData.data.filter((m: Movie) => m.id !== currentMovie.id);

          // Lọc phim cùng thể loại (ít nhất 1 điểm chung)
          let matches = others.filter((m: Movie) =>
            m.genres?.some((g1) =>
              currentMovie.genres?.some((g2) => g1.id === g2.id),
            ),
          );

          // Nếu ít quá thì lấy thêm cho đủ 4
          if (matches.length < 4) {
            matches = [
              ...matches,
              ...others.filter((m: Movie) => !matches.includes(m)),
            ];
          }

          // Lấy 4 phim đầu
          setRelatedMovies(matches.slice(0, 4));
        }
      } catch (e) {
        console.error("Failed to load related movies:", e);
      } finally {
        setLoading(false);
      }
    };

    if (currentMovie?.id) {
      fetchRelated();
    }
  }, [currentMovie]);

  if (loading || relatedMovies.length === 0) return null;

  return (
    <div className="w-full border-t border-white/10 pt-16">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-primary rounded-full"></div>
        <h2 className="text-3xl font-black text-white uppercase">
          Có Thể Bạn Cũng Thích
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedMovies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group block rounded-2xl overflow-hidden bg-[#111] border border-white/5 hover:border-white/20 transition-all cursor-pointer relative"
          >
            <Link href={`/movies/${movie.id}`}>
              <div className="relative aspect-[2/3] w-full overflow-hidden">
                <NextImage
                  src={
                    movie.poster_url ||
                    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600"
                  }
                  alt={movie.title}
                  fill
                  className="object-cover transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Gradient Layer */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Meta data top */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                  {(movie.rating || 8.5) > 0 && (
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-yellow-500 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      {movie.rating || 8.5}
                    </span>
                  )}
                  {movie.genres?.[0] && (
                    <span className="bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-primary uppercase border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      {movie.genres[0].name}
                    </span>
                  )}
                </div>

                {/* Info Text */}
                <div className="absolute bottom-4 left-4 right-4 z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {movie.duration_minutes} Phút
                    </span>
                  </div>
                </div>

                {/* Hover Play Button */}
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-14 h-14 bg-primary/90 text-white rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-500 shadow-[0_0_30px_rgba(229,9,20,0.5)]">
                    <Play className="w-6 h-6 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
