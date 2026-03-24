"use client";

import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  ImageIcon,
  Film,
  Clock,
  Calendar,
  Link2,
  Tag,
  AlignLeft,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface Genre {
  id: number;
  name: string;
}

interface MovieFormData {
  title: string;
  description: string;
  duration_minutes: number;
  release_date: string;
  poster_url: string;
  trailer_url: string;
  genre_ids: number[];
  is_hot: boolean;
  is_best_selling: boolean;
  is_featured: boolean;
}

interface MovieFormProps {
  mode: "create" | "edit";
  initialData?: Partial<MovieFormData> & { id?: number };
}

const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white 
  placeholder:text-white/30 focus:outline-none focus:border-[#e50914]/50 focus:bg-white/[0.07] 
  transition-all text-sm`;

const labelClass = "block text-white/60 text-sm font-medium mb-1.5";

export default function MovieForm({ mode, initialData }: MovieFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [form, setForm] = useState<MovieFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    duration_minutes: initialData?.duration_minutes || 90,
    release_date:
      initialData?.release_date || new Date().toISOString().split("T")[0],
    poster_url: initialData?.poster_url || "",
    trailer_url: initialData?.trailer_url || "",
    genre_ids: initialData?.genre_ids || [],
    is_hot: (initialData as any)?.is_hot || false,
    is_best_selling: (initialData as any)?.is_best_selling || false,
    is_featured: (initialData as any)?.is_featured || false,
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    apiClient.get("/genres/").then((res: unknown) => {
      const r = res as { success: boolean; data: Genre[] };
      if (r.success) setGenres(r.data);
    });
  }, []);

  const handlePosterUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = (await apiClient.post("/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })) as { success: boolean; data: { url: string } };
      if (res.success) {
        setForm((prev) => ({ ...prev, poster_url: res.data.url }));
      }
    } catch {
      setError("Upload ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const toggleGenre = (id: number) => {
    setForm((prev) => ({
      ...prev,
      genre_ids: prev.genre_ids.includes(id)
        ? prev.genre_ids.filter((g) => g !== id)
        : [...prev.genre_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (mode === "create") {
        const res = (await apiClient.post("/admin/movies", form)) as {
          success: boolean;
          data: { id: number };
        };
        if (res.success) {
          setSuccess("Tạo phim thành công!");
          setTimeout(() => router.push("/admin/movies"), 1200);
        }
      } else {
        const res = (await apiClient.put(
          `/admin/movies/${initialData?.id}`,
          form,
        )) as { success: boolean };
        if (res.success) {
          setSuccess("Cập nhật phim thành công!");
          setTimeout(() => router.push("/admin/movies"), 1200);
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Poster */}
        <div className="xl:col-span-1">
          <label className={labelClass}>Poster phim</label>
          <div
            className={`relative rounded-2xl overflow-hidden border-2 border-dashed border-white/10 bg-white/3 cursor-pointer hover:border-[#e50914]/40 transition-all group ${
              uploading ? "pointer-events-none" : ""
            }`}
            style={{ aspectRatio: "2/3" }}
            onClick={() => fileRef.current?.click()}
          >
            {form.poster_url ? (
              <>
                <Image
                  src={form.poster_url}
                  alt="Poster preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <Upload size={16} />
                    <span>Đổi ảnh</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/30 p-4">
                {uploading ? (
                  <Loader2 size={28} className="animate-spin text-[#e50914]" />
                ) : (
                  <>
                    <ImageIcon size={32} strokeWidth={1} />
                    <div className="text-center">
                      <p className="text-sm font-medium">Upload poster</p>
                      <p className="text-xs mt-0.5">PNG, JPG, WEBP</p>
                    </div>
                  </>
                )}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-[#e50914]" />
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePosterUpload(file);
            }}
          />
          {form.poster_url && (
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, poster_url: "" }))}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors"
            >
              <X size={12} />
              Xóa ảnh
            </button>
          )}
        </div>

        {/* Right: Form fields */}
        <div className="xl:col-span-2 space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>
              <Film size={13} className="inline mr-1.5" />
              Tên phim <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Nhập tên phim..."
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>
              <AlignLeft size={13} className="inline mr-1.5" />
              Mô tả phim
            </label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Nội dung mô tả phim..."
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          {/* Duration + Release Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Clock size={13} className="inline mr-1.5" />
                Thời lượng (phút) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder="90"
                min={1}
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    duration_minutes: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                <Calendar size={13} className="inline mr-1.5" />
                Ngày phát hành <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                className={inputClass}
                value={form.release_date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, release_date: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Trailer URL */}
          <div>
            <label className={labelClass}>
              <Link2 size={13} className="inline mr-1.5" />
              Trailer URL (YouTube embed)
            </label>
            <input
              type="url"
              className={inputClass}
              placeholder="https://www.youtube.com/embed/..."
              value={form.trailer_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, trailer_url: e.target.value }))
              }
            />
          </div>

          {/* Poster URL (manual) */}
          <div>
            <label className={labelClass}>
              <Link2 size={13} className="inline mr-1.5" />
              Hoặc nhập Poster URL trực tiếp
            </label>
            <input
              type="url"
              className={inputClass}
              placeholder="https://..."
              value={form.poster_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, poster_url: e.target.value }))
              }
            />
          </div>

          {/* Genres */}
          <div>
            <label className={labelClass}>
              <Tag size={13} className="inline mr-1.5" />
              Thể loại
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    form.genre_ids.includes(g.id)
                      ? "bg-[#e50914]/20 border-[#e50914]/50 text-[#e50914]"
                      : "bg-white/5 border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
                  }`}
                >
                  {g.name}
                </button>
              ))}
              {genres.length === 0 && (
                <span className="text-white/30 text-xs">
                  Đang tải thể loại...
                </span>
              )}
            </div>
          </div>

          {/* Special Tags (Featured, Hot, Best Selling) */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <label className={labelClass}>Thuộc tính đặc biệt (Trang chủ)</label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_featured: e.target.checked }))
                  }
                  className="w-5 h-5 rounded-lg border-2 border-white/10 bg-white/5 checked:bg-[#e50914] checked:border-[#e50914] transition-all cursor-pointer appearance-none relative checked:after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-white after:text-xs"
                />
                <span className="text-sm font-semibold text-white/50 group-hover:text-white transition-colors">
                  🔥 Phim nổi bật (Banner lớn)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.is_hot}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_hot: e.target.checked }))
                  }
                  className="w-5 h-5 rounded-lg border-2 border-white/10 bg-white/5 checked:bg-orange-500 checked:border-orange-500 transition-all cursor-pointer appearance-none relative checked:after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-white after:text-xs"
                />
                <span className="text-sm font-semibold text-white/50 group-hover:text-white transition-colors">
                  ⚡ Phim Hot
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.is_best_selling}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_best_selling: e.target.checked }))
                  }
                  className="w-5 h-5 rounded-lg border-2 border-white/10 bg-white/5 checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer appearance-none relative checked:after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-white after:text-xs"
                />
                <span className="text-sm font-semibold text-white/50 group-hover:text-white transition-colors">
                  💰 Bán chạy
                </span>
              </label>
            </div>
            <p className="text-[11px] text-white/30 italic">
              * Phim được đánh dấu sẽ luôn xuất hiện ở đầu các danh mục tương ứng trên trang chủ.
            </p>
          </div>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          <X size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">
          ✓ {success}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/movies")}
          className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all text-sm"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#e50914] hover:bg-[#b80710] text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/30"
        >
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {mode === "create" ? "Tạo phim" : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
