"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { Calendar, MapPin, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Person {
  id: number;
  tmdb_id: number;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string;
  known_for: string;
}

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  release_date: string;
}

export default function PersonDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [suggestedMovies, setSuggestedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [personRes, homeMoviesRes] = await Promise.all([
          apiClient.get<void, { success: boolean; data: Person }>(
            `/persons/${id}`,
          ),
          apiClient.get<void, { success: boolean; data: { hot: Movie[]; best_selling: Movie[] } }>(`/movies/home`),
        ]);

        if (personRes.success) {
          setPerson(personRes.data);
        }

        if (homeMoviesRes.success) {
          const allMovies = [
            ...(homeMoviesRes.data.hot || []),
            ...(homeMoviesRes.data.best_selling || []),
          ];
          // Lấy ngẫu nhiên hoặc lấy 4 phim
          setSuggestedMovies(allMovies.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch person detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/10 rounded-full border-t-primary animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-white space-y-4">
          <h2 className="text-2xl font-bold">
            Không tìm thấy thông tin diễn viên.
          </h2>
          <Link href="/" className="text-primary hover:underline">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Profile Image */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"
            >
              <Image
                src={
                  person.profile_path ||
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop"
                }
                alt={person.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-white/5 pb-2">
                Thông tin cá nhân
              </h3>

              {person.birthday && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Ngày sinh</p>
                    <p className="text-sm font-medium">{person.birthday}</p>
                  </div>
                </div>
              )}

              {person.place_of_birth && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Nơi sinh</p>
                    <p className="text-sm font-medium">
                      {person.place_of_birth}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-gray-500">Nghề nghiệp</p>
                  <p className="text-sm font-medium">
                    {person.known_for || "Acting"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Biography & Suggested Movies */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl lg:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
                {person.name}
              </h1>
              <div className="flex items-center gap-2 mb-8">
                <div className="h-1 w-12 bg-primary rounded-full"></div>
                <span className="text-primary font-bold uppercase tracking-widest text-sm">
                  Biography
                </span>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
                  {person.biography ||
                    "Thông tin tiểu sử hiện đang được cập nhật..."}
                </p>
              </div>
            </motion.div>

            {/* Suggested Movies */}
            {suggestedMovies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-12 border-t border-white/10"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">
                    Phim có thể bạn thích
                  </h2>
                  <Link
                    href="/movies"
                    className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
                  >
                    Xem tất cả →
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {suggestedMovies.map((movie) => (
                    <motion.div
                      key={movie.id}
                      whileHover={{ y: -10 }}
                      className="group"
                    >
                      <Link href={`/movies/${movie.id}`}>
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 mb-4">
                          <Image
                            src={
                              movie.poster_url ||
                              "https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=500&auto=format&fit=crop"
                            }
                            alt={movie.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity flex items-end p-4">
                            <span className="text-xs font-bold bg-primary px-2 py-1 rounded">
                              Đặt vé
                            </span>
                          </div>
                        </div>
                        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {movie.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Retro background pattern */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,9,20,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>
    </div>
  );
}
