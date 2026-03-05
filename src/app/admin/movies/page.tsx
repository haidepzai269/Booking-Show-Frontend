"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Film,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface Movie {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  release_date: string;
  poster_url: string;
  genres: Array<{ id: number; name: string }>;
  is_active: boolean;
  created_at: string;
}

interface ListResult {
  movies: Movie[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminMoviesPage() {
  const [data, setData] = useState<ListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const limit = 15;

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { q: search }),
        ...(onlyActive && { active: "true" }),
      });
      const res = (await apiClient.get(`/admin/movies?${params}`)) as {
        success: boolean;
        data: ListResult;
      };
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, onlyActive]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  const handleDelete = async (id: number, title: string) => {
    if (
      !confirm(
        `Xóa phim "${title}"?\nThao tác này sẽ ẩn phim khỏi hệ thống (soft delete).`,
      )
    )
      return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/admin/movies/${id}`);
      fetchMovies();
    } catch {
      alert("Xóa phim thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Phim</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {data?.total ?? 0} phim trong hệ thống
          </p>
        </div>
        <Link
          href="/admin/movies/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e50914] hover:bg-[#b80710] text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-red-900/30"
        >
          <Plus size={16} />
          Tạo phim mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#e50914]/50 transition-all text-sm"
            placeholder="Tìm phim theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setOnlyActive(!onlyActive);
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
              onlyActive
                ? "bg-green-500/15 border-green-500/30 text-green-400"
                : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
            }`}
          >
            {onlyActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            Chỉ hiện active
          </button>
          <button
            onClick={fetchMovies}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#e50914]" />
          </div>
        ) : !data?.movies?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Film size={40} strokeWidth={1} className="text-white/20" />
            <p className="text-white/40 text-sm">Không tìm thấy phim nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3.5 px-5 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Phim
                  </th>
                  <th className="text-left py-3.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">
                    Thể loại
                  </th>
                  <th className="text-left py-3.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                    Thời lượng
                  </th>
                  <th className="text-left py-3.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                    Phát hành
                  </th>
                  <th className="text-center py-3.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-right py-3.5 px-5 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {data.movies.map((movie) => (
                  <tr
                    key={movie.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0 relative">
                          {movie.poster_url ? (
                            <Image
                              src={movie.poster_url}
                              alt={movie.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film size={14} className="text-white/20" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm line-clamp-1">
                            {movie.title}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5 line-clamp-1">
                            {movie.description?.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {movie.genres?.slice(0, 2).map((g) => (
                          <span
                            key={g.id}
                            className="px-2 py-0.5 text-[10px] bg-white/5 text-white/40 rounded-full border border-white/5"
                          >
                            {g.name}
                          </span>
                        ))}
                        {(movie.genres?.length ?? 0) > 2 && (
                          <span className="text-[10px] text-white/25">
                            +{movie.genres.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-white/50 text-xs hidden md:table-cell">
                      {movie.duration_minutes} phút
                    </td>
                    <td className="py-3.5 px-4 text-white/50 text-xs hidden md:table-cell">
                      {new Date(movie.release_date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                          movie.is_active
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {movie.is_active ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <XCircle size={11} />
                        )}
                        {movie.is_active ? "Active" : "Ẩn"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/movies/${movie.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          disabled={deletingId === movie.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {deletingId === movie.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/5">
            <span className="text-white/30 text-xs">
              Trang {page} / {totalPages} • {data?.total} phim
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
