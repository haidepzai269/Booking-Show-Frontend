"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import {
  Plus,
  Clock,
  Trash2,
  Edit2,
  Loader2,
  RefreshCw,
  X,
  Film,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import TableSkeleton from "@/components/admin/TableSkeleton";

interface Showtime {
  id: number;
  movie_id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  base_price: number;
  is_active: boolean;
  movie: { id: number; title: string; poster_url: string };
  room: { id: number; name: string; cinema: { id: number; name: string } };
}

interface Movie {
  id: number;
  title: string;
}

interface Cinema {
  id: number;
  name: string;
}

interface Room {
  id: number;
  name: string;
  cinema_id: number;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white 
  placeholder:text-white/30 focus:outline-none focus:border-[#e50914]/50 transition-all text-sm`;

// ─── Modal Form ─────────────────────────────────────────────────────────────

interface ShowtimeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editShowtime?: Showtime | null;
}

function ShowtimeModal({
  onClose,
  onSuccess,
  editShowtime,
}: ShowtimeModalProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [movieId, setMovieId] = useState(
    editShowtime?.movie_id?.toString() || "",
  );
  const [cinemaId, setCinemaId] = useState(
    editShowtime?.room?.cinema?.id?.toString() || "",
  );
  const [roomId, setRoomId] = useState(editShowtime?.room_id?.toString() || "");
  const [startTime, setStartTime] = useState(
    editShowtime
      ? new Date(editShowtime.start_time).toISOString().slice(0, 16)
      : "",
  );
  const [basePrice, setBasePrice] = useState(
    editShowtime?.base_price?.toString() || "75000",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch movies
    apiClient.get("/movies/").then((res: unknown) => {
      const r = res as { success: boolean; data: Movie[] };
      if (r.success) setMovies(r.data);
    });
    // Fetch cinemas
    apiClient.get("/cinemas/").then((res: unknown) => {
      const r = res as { success: boolean; data: Cinema[] };
      if (r.success) setCinemas(r.data);
    });
  }, []);

  useEffect(() => {
    if (!cinemaId) {
      setRooms([]);
      return;
    }
    apiClient
      .get(`/cinemas/${cinemaId}/rooms`)
      .then((res: unknown) => {
        const r = res as { success: boolean; data: Room[] };
        if (r.success) setRooms(r.data);
      })
      .catch(() => setRooms([]));
  }, [cinemaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editShowtime) {
        const body: Record<string, unknown> = {
          base_price: parseInt(basePrice),
        };
        if (startTime) body.start_time = new Date(startTime).toISOString();
        if (roomId) body.room_id = parseInt(roomId);
        await apiClient.put(`/admin/showtimes/${editShowtime.id}`, body);
      } else {
        await apiClient.post("/admin/showtimes", {
          movie_id: parseInt(movieId),
          cinema_id: parseInt(cinemaId),
          room_id: parseInt(roomId),
          start_time: new Date(startTime).toISOString(),
          base_price: parseInt(basePrice),
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#181818] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">
            {editShowtime ? "Sửa suất chiếu" : "Tạo suất chiếu mới"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editShowtime && (
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">
                Phim <span className="text-red-400">*</span>
              </label>
              <select
                className={inputClass}
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                required
              >
                <option value="">-- Chọn phim --</option>
                {movies.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#1a1a1a]">
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!editShowtime && (
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">
                Rạp chiếu <span className="text-red-400">*</span>
              </label>
              <select
                className={inputClass}
                value={cinemaId}
                onChange={(e) => {
                  setCinemaId(e.target.value);
                  setRoomId("");
                }}
                required
              >
                <option value="">-- Chọn rạp --</option>
                {cinemas.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1a1a1a]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">
              Phòng chiếu <span className="text-red-400">*</span>
            </label>
            <select
              className={inputClass}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required={!editShowtime}
              disabled={!editShowtime && !cinemaId}
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#1a1a1a]">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">
              <Calendar size={11} className="inline mr-1" />
              Thời gian bắt đầu <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              className={inputClass}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required={!editShowtime}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">
              Giá vé (VND)
            </label>
            <input
              type="number"
              className={inputClass}
              value={basePrice}
              min={0}
              step={1000}
              onChange={(e) => setBasePrice(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#e50914] hover:bg-[#b80710] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {editShowtime ? "Lưu" : "Tạo suất chiếu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterMovieId, setFilterMovieId] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editShowtime, setEditShowtime] = useState<Showtime | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const limit = 15;

  const fetchShowtimes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filterMovieId && { movie_id: filterMovieId }),
      });
      const res = (await apiClient.get(`/admin/showtimes?${params}`)) as {
        success: boolean;
        data: { showtimes: Showtime[]; total: number };
      };
      if (res.success) {
        setShowtimes(res.data.showtimes || []);
        setTotal(res.data.total);
      }
    } catch {
      console.error("Failed to fetch showtimes");
    } finally {
      setLoading(false);
    }
  }, [page, filterMovieId]);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes]);

  useEffect(() => {
    apiClient.get("/movies/").then((res: unknown) => {
      const r = res as { success: boolean; data: Movie[] };
      if (r.success) setMovies(r.data);
    });
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa suất chiếu này?")) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/admin/showtimes/${id}`);
      fetchShowtimes();
    } catch {
      alert("Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Suất chiếu</h1>
          <p className="text-white/40 text-sm mt-0.5">{total} suất chiếu</p>
        </div>
        <button
          onClick={() => {
            setEditShowtime(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e50914] hover:bg-[#b80710] text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-red-900/30"
        >
          <Plus size={16} />
          Tạo suất chiếu
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#e50914]/50 transition-all"
          value={filterMovieId}
          onChange={(e) => {
            setFilterMovieId(e.target.value);
            setPage(1);
          }}
        >
          <option value="" className="bg-[#1a1a1a]">
            Tất cả phim
          </option>
          {movies.map((m) => (
            <option key={m.id} value={m.id} className="bg-[#1a1a1a]">
              {m.title}
            </option>
          ))}
        </select>
        <button
          onClick={fetchShowtimes}
          className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-white/[0.03]">
                <TableSkeleton rows={10} cols={7} />
              </tbody>
            </table>
          </div>
        ) : !showtimes?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Clock size={40} strokeWidth={1} className="text-white/20" />
            <p className="text-white/40 text-sm">Chưa có suất chiếu nào</p>
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
                    Rạp / Phòng
                  </th>
                  <th className="text-left py-3.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Bắt đầu
                  </th>
                  <th className="text-left py-3.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                    Kết thúc
                  </th>
                  <th className="text-right py-3.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                    Giá vé
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
                {showtimes.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <Film size={14} className="text-white/25 shrink-0" />
                        <span className="text-white/80 text-xs font-medium line-clamp-1 max-w-[140px]">
                          {st.movie?.title || `#${st.movie_id}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div>
                        <p className="text-white/60 text-xs">
                          {st.room?.cinema?.name}
                        </p>
                        <p className="text-white/30 text-[11px]">
                          {st.room?.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-white/70 text-xs">
                        {formatDateTime(st.start_time)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <span className="text-white/40 text-xs">
                        {formatDateTime(st.end_time)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right hidden md:table-cell">
                      <span className="text-[#f5c518] text-xs font-medium">
                        {formatVND(st.base_price)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          st.is_active
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {st.is_active ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <XCircle size={10} />
                        )}
                        {st.is_active ? "Active" : "Ẩn"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditShowtime(st);
                            setShowModal(true);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(st.id)}
                          disabled={deletingId === st.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {deletingId === st.id ? (
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
              Hiển thị {total > 0 ? (page - 1) * limit + 1 : 0} -{" "}
              {Math.min(page * limit, total)} / {total} suất chiếu
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

      {/* Modal */}
      {showModal && (
        <ShowtimeModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchShowtimes}
          editShowtime={editShowtime}
        />
      )}
    </div>
  );
}
