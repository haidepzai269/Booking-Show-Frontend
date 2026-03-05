"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import MovieForm from "@/components/admin/movies/MovieForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

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
  is_active: boolean;
}

export default function EditMoviePage() {
  const params = useParams();
  const movieId = Number(params.id);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = (await apiClient.get(`/movies/${movieId}`)) as {
          success: boolean;
          data: Movie;
        };
        if (res.success) {
          setMovie(res.data);
        }
      } catch {
        setError("Không tìm thấy phim");
      } finally {
        setLoading(false);
      }
    };
    if (movieId) fetchMovie();
  }, [movieId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-[#e50914]" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-red-400">{error || "Không tìm thấy phim"}</p>
        <Link
          href="/admin/movies"
          className="text-sm text-white/40 hover:text-white underline"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const initialData = {
    id: movie.id,
    title: movie.title,
    description: movie.description,
    duration_minutes: movie.duration_minutes,
    release_date: movie.release_date?.split("T")[0],
    poster_url: movie.poster_url,
    trailer_url: movie.trailer_url,
    genre_ids: movie.genres?.map((g) => g.id) || [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/movies"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Chỉnh sửa phim</h1>
          <p className="text-white/40 text-sm mt-0.5 truncate max-w-xs">
            {movie.title}
          </p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
        <MovieForm mode="edit" initialData={initialData} />
      </div>
    </div>
  );
}
