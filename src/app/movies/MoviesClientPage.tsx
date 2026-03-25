"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Ticket,
  Clock,
  Play,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Film,
  Calendar,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Header from "@/components/layout/Header";
import NextImage from "next/image";

// ──── Types ──────────────────────────────────────────────────────────────────
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

type StatusFilter = "all" | "now_showing" | "coming_soon";
type SortBy = "newest" | "oldest" | "az" | "duration";

// ──── Helpers ────────────────────────────────────────────────────────────────
const isNowShowing = (release_date: string) =>
  new Date(release_date) <= new Date();

// ──── Main Component ─────────────────────────────────────────────────────────
export default function MoviesClientPage() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  // Banner carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter state
  const searchParams = useSearchParams();
  const defaultStatus = (searchParams.get("status") as StatusFilter) || "all";

  const [search, setSearch] = useState("");
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(defaultStatus);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [durationMax, setDurationMax] = useState(240);

  // Sync ?q= từ URL vào search state (từ SearchBar dropdown)
  useEffect(() => {
    const qFromURL = searchParams.get("q") || "";
    if (qFromURL) setSearch(qFromURL);
  }, [searchParams]);

  // Mobile filter drawer
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Fetch data ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [moviesRes, genresRes] = await Promise.all([
          apiClient.get<{ success: boolean; data: Movie[] }>("/movies/"),
          apiClient.get<{ success: boolean; data: Genre[] }>("/genres/"),
        ]);
        const mData = moviesRes as unknown as { success: boolean; data: Movie[] };
        const gData = genresRes as unknown as { success: boolean; data: Genre[] };
        if (mData.success && mData.data) setAllMovies(mData.data);
        if (gData.success && gData.data) setGenres(gData.data);
      } catch (e) {
        console.error("Failed to load movies:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Banner carousel (dùng 5 phim đầu) ───────────────────────────────────
  const bannerMovies = allMovies.slice(0, 5);
  const activeBannerMovie =
    bannerMovies.length > 0 ? bannerMovies[currentSlide] : null;

  const nextSlide = useCallback(() => {
    if (bannerMovies.length > 0)
      setCurrentSlide((p) => (p + 1) % bannerMovies.length);
  }, [bannerMovies.length]);

  const prevSlide = useCallback(() => {
    if (bannerMovies.length > 0)
      setCurrentSlide(
        (p) => (p - 1 + bannerMovies.length) % bannerMovies.length,
      );
  }, [bannerMovies.length]);

  useEffect(() => {
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, [nextSlide]);

  // ── Client-side filtering & sorting ──────────────────────────────────────
  const filteredMovies = useMemo(() => {
    let result = [...allMovies];

    // Tìm kiếm tên
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q));
    }

    // Lọc theo thể loại
    if (selectedGenreIds.length > 0) {
      result = result.filter((m) =>
        selectedGenreIds.every((gid) => m.genres.some((g) => g.id === gid)),
      );
    }

    // Lọc trạng thái chiếu
    if (statusFilter === "now_showing") {
      result = result.filter((m) => isNowShowing(m.release_date));
    } else if (statusFilter === "coming_soon") {
      result = result.filter((m) => !isNowShowing(m.release_date));
    }

    // Lọc thời lượng
    result = result.filter((m) => m.duration_minutes <= durationMax);

    // Sắp xếp
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.release_date).getTime() -
            new Date(a.release_date).getTime(),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.release_date).getTime() -
            new Date(b.release_date).getTime(),
        );
        break;
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "duration":
        result.sort((a, b) => a.duration_minutes - b.duration_minutes);
        break;
    }

    return result;
  }, [allMovies, search, selectedGenreIds, statusFilter, durationMax, sortBy]);

  const hasActiveFilter =
    search.trim() ||
    selectedGenreIds.length > 0 ||
    statusFilter !== "all" ||
    durationMax < 240;

  const clearAllFilters = () => {
    setSearch("");
    setSelectedGenreIds([]);
    setStatusFilter("all");
    setSortBy("newest");
    setDurationMax(240);
  };

  useEffect(() => {
    const urlStatus = searchParams.get("status") as StatusFilter;
    if (
      urlStatus &&
      ["all", "now_showing", "coming_soon"].includes(urlStatus)
    ) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  const toggleGenre = (id: number) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* ── HERO BANNER CAROUSEL ─────────────────────────────────────────── */}
      {loading ? (
        <div className="w-full h-[40vh] md:h-[45vh] bg-card animate-pulse" />
      ) : activeBannerMovie ? (
        <div className="w-full min-h-[40vh] md:h-[45vh] relative overflow-hidden group flex-shrink-0 flex items-center">
          {/* Background image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBannerMovie.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <NextImage
                src={
                  activeBannerMovie.poster_url ||
                  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025"
                }
                alt={activeBannerMovie.title}
                fill
                className="object-cover opacity-40 md:opacity-50"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 md:via-background/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 md:from-background/80 via-transparent to-transparent hidden md:block" />
            </motion.div>
          </AnimatePresence>

          {/* Banner content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 flex items-center pt-24 md:pt-0 pb-12 md:pb-0">
            <motion.div
              key={`content-${activeBannerMovie.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl w-full"
            >
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-3">
                {activeBannerMovie.genres?.slice(0, 3).map((g) => (
                  <span
                    key={g.id}
                    className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] md:text-xs text-gray-300 font-medium backdrop-blur-sm"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-3 uppercase tracking-tight leading-tight line-clamp-2">
                {activeBannerMovie.title}
              </h2>
              <div className="flex items-center gap-4 text-xs md:text-sm text-gray-400 mb-4 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {activeBannerMovie.duration_minutes} Phút
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {new Date(activeBannerMovie.release_date).toLocaleDateString(
                    "vi-VN",
                  )}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    isNowShowing(activeBannerMovie.release_date)
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {isNowShowing(activeBannerMovie.release_date)
                    ? "Đang Chiếu"
                    : "Sắp Chiếu"}
                </span>
              </div>
              <div className="flex gap-3 mt-6 md:mt-0">
                <Link
                  href={`/movies/${activeBannerMovie.id}`}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-3 md:py-3.5 rounded-full font-black flex items-center gap-2 transition-all text-xs md:text-sm shadow-[0_0_30px_-5px_rgba(229,9,20,0.7)]"
                >
                  <Ticket className="w-4 h-4" /> ĐẶT VÉ
                </Link>
                {activeBannerMovie.trailer_url && (
                  <button className="border border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/10 text-white px-6 py-3 md:py-3.5 rounded-full font-black flex items-center gap-2 transition-all text-xs md:text-sm">
                    <Play className="w-4 h-4" /> TRAILER
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Prev / Next arrows - Desktop Only */}
          {bannerMovies.length > 1 && (
            <div className="hidden md:block">
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 border border-white/10 text-white hover:bg-primary hover:border-primary transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 border border-white/10 text-white hover:bg-primary hover:border-primary transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Slide indicators */}
          <div className="absolute bottom-5 right-6 z-20 flex gap-2">
            {bannerMovies.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "w-6 md:w-7 bg-primary shadow-[0_0_8px_rgba(229,9,20,0.8)]"
                    : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* ── MAIN CONTENT: SIDEBAR + GRID ─────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-6 py-10">
        {/* Mobile: header row */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-2xl font-black text-white uppercase flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" /> Tất Cả Phim
          </h2>
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 border border-border bg-card text-sm font-semibold text-gray-300 px-4 py-2 rounded-xl hover:border-primary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" /> Bộ lọc
            {hasActiveFilter && (
              <span className="w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* ── FILTER SIDEBAR (desktop) ────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-6 w-64 flex-shrink-0">
            <FilterPanel
              search={search}
              setSearch={setSearch}
              genres={genres}
              selectedGenreIds={selectedGenreIds}
              toggleGenre={toggleGenre}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              durationMax={durationMax}
              setDurationMax={setDurationMax}
              hasActiveFilter={!!hasActiveFilter}
              clearAllFilters={clearAllFilters}
            />
          </aside>

          {/* ── MOVIE GRID ───────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Desktop heading + sort */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white uppercase flex items-center gap-2">
                <Film className="w-6 h-6 text-primary" />
                {hasActiveFilter ? "Kết Quả Lọc" : "Tất Cả Phim"}
                <span className="text-gray-500 text-base font-medium ml-1">
                  ({filteredMovies.length})
                </span>
              </h2>
              <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            {loading ? (
              <GridSkeleton />
            ) : filteredMovies.length === 0 ? (
              <EmptyState
                hasFilter={!!hasActiveFilter}
                onClear={clearAllFilters}
              />
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                <AnimatePresence>
                  {filteredMovies.map((movie, i) => (
                    <MovieCard key={movie.id} movie={movie} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setFilterOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-[#111] border-r border-border z-50 overflow-y-auto p-6 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-black text-lg uppercase">
                  Bộ Lọc
                </span>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <FilterPanel
                search={search}
                setSearch={setSearch}
                genres={genres}
                selectedGenreIds={selectedGenreIds}
                toggleGenre={toggleGenre}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                durationMax={durationMax}
                setDurationMax={setDurationMax}
                hasActiveFilter={!!hasActiveFilter}
                clearAllFilters={clearAllFilters}
              />
              <button
                onClick={() => setFilterOpen(false)}
                className="mt-auto w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors"
              >
                Xem {filteredMovies.length} phim
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──── Sub-components ──────────────────────────────────────────────────────────

function FilterPanel({
  search,
  setSearch,
  genres,
  selectedGenreIds,
  toggleGenre,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  durationMax,
  setDurationMax,
  hasActiveFilter,
  clearAllFilters,
}: {
  search: string;
  setSearch: (v: string) => void;
  genres: Genre[];
  selectedGenreIds: number[];
  toggleGenre: (id: number) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  sortBy: SortBy;
  setSortBy: (v: SortBy) => void;
  durationMax: number;
  setDurationMax: (v: number) => void;
  hasActiveFilter: boolean;
  clearAllFilters: () => void;
}) {
  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tên phim..."
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-white text-gray-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Trạng thái */}
      <FilterSection title="Trạng thái">
        {(
          [
            { value: "all", label: "Tất cả" },
            { value: "now_showing", label: "🟢 Đang chiếu" },
            { value: "coming_soon", label: "🟡 Sắp chiếu" },
          ] as { value: StatusFilter; label: string }[]
        ).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-primary/20 text-primary border border-primary/40"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </FilterSection>

      {/* Sắp xếp (mobile only) */}
      <FilterSection title="Sắp xếp theo" className="lg:hidden">
        <SortSelect sortBy={sortBy} setSortBy={setSortBy} fullWidth />
      </FilterSection>

      {/* Thể loại */}
      <FilterSection title="Thể loại">
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => toggleGenre(g.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedGenreIds.includes(g.id)
                  ? "bg-primary text-white border-primary shadow-[0_0_12px_rgba(229,9,20,0.3)]"
                  : "bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-gray-500 hover:text-white"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Thời lượng */}
      <FilterSection title={`Thời lượng tối đa: ${durationMax} phút`}>
        <input
          type="range"
          min={60}
          max={240}
          step={15}
          value={durationMax}
          onChange={(e) => setDurationMax(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>60 phút</span>
          <span>240 phút</span>
        </div>
      </FilterSection>

      {/* Clear filters button */}
      {hasActiveFilter && (
        <button
          onClick={clearAllFilters}
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-semibold transition-colors"
        >
          <X className="w-4 h-4" /> Xóa tất cả bộ lọc
        </button>
      )}
    </>
  );
}

function FilterSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold px-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SortSelect({
  sortBy,
  setSortBy,
  fullWidth = false,
}: {
  sortBy: SortBy;
  setSortBy: (v: SortBy) => void;
  fullWidth?: boolean;
}) {
  return (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as SortBy)}
      className={`bg-[#1a1a1a] border border-[#333] text-sm text-gray-300 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary transition-colors ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <option value="newest">Mới nhất trước</option>
      <option value="oldest">Cũ nhất trước</option>
      <option value="az">A → Z</option>
      <option value="duration">Ngắn nhất trước</option>
    </select>
  );
}

function MovieCard({ movie, index }: { movie: Movie; index: number }) {
  const nowShowing = isNowShowing(movie.release_date);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      className="group relative flex flex-col cursor-pointer"
    >
      <Link href={`/movies/${movie.id}`}>
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-card border border-border">
          <NextImage
            src={
              movie.poster_url ||
              "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600"
            }
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Hover overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm z-10">
            <div className="bg-primary text-white p-4 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_30px_rgba(229,9,20,0.7)]">
              <Ticket className="w-6 h-6" />
            </div>
          </div>

          {/* Status badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                nowShowing
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
              }`}
            >
              {nowShowing ? "Đang Chiếu" : "Sắp Chiếu"}
            </span>
          </div>

          {/* Genre top-right */}
          {movie.genres?.length > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/50 text-primary border border-primary/40 backdrop-blur-md">
                {movie.genres[0].name}
              </span>
            </div>
          )}

          {/* Title + duration at bottom */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <h3 className="text-base md:text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors mb-1">
              {movie.title}
            </h3>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.duration_minutes} Phút
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] rounded-2xl bg-card border border-border animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState({
  hasFilter,
  onClear,
}: {
  hasFilter: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Film className="w-16 h-16 text-gray-700 mb-4" />
      <p className="text-gray-300 text-xl font-bold mb-2">
        {hasFilter ? "Không tìm thấy phim phù hợp" : "Chưa có phim nào"}
      </p>
      <p className="text-gray-600 text-sm mb-6">
        {hasFilter
          ? "Thử thay đổi hoặc xóa bộ lọc để xem thêm phim."
          : "Vui lòng quay lại sau."}
      </p>
      {hasFilter && (
        <button
          onClick={onClear}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-full transition-colors text-sm"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
