"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Film, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import NextImage from "next/image";

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  duration_minutes: number;
  genres?: { id: number; name: string }[];
}

interface SearchBarProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  onClose?: () => void; // dùng cho mobile menu
}

export default function SearchBar({
  className = "",
  inputClassName = "",
  placeholder = "Tìm kiếm phim...",
  onClose,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.get<ApiResponse<Movie[]>>(
        `/movies/search?q=${encodeURIComponent(q)}&limit=6`,
      ) as unknown as ApiResponse<Movie[]>;
      if (res.success && res.data) {
        setResults(res.data);
        setIsOpen(true);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(query), 500); // Tăng lên 500ms
    } else {
      setResults([]);
      setIsOpen(false);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      router.push(`/movies?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      inputRef.current?.blur();
      onClose?.();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectMovie = (id: number) => {
    setIsOpen(false);
    setQuery("");
    onClose?.();
    router.push(`/movies/${id}`);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative flex items-center">
        {isLoading ? (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        ) : (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={
            isLoading && query.length > 2
              ? "✨ AI đang suy nghĩ..."
              : placeholder
          }
          autoComplete="off"
          className={`w-full bg-[#1a1a1a] border border-[#333] rounded-full py-2.5 pl-12 pr-10 text-sm text-white focus:outline-none focus:border-primary transition-colors ${
            isLoading
              ? "border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]"
              : ""
          } ${inputClassName}`}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-[200]">
          {results.length === 0 && !isLoading ? (
            <div className="px-4 py-6 text-center text-zinc-500 text-sm">
              Không tìm thấy phim nào
            </div>
          ) : (
            <>
              <div className="flex flex-col divide-y divide-zinc-800">
                {results.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie.id)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left w-full group"
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                      {movie.poster_url ? (
                        <NextImage
                          src={movie.poster_url}
                          alt={movie.title}
                          width={40}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">
                        {movie.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-zinc-500 text-xs">
                          {movie.duration_minutes} phút
                        </span>
                        {movie.genres?.slice(0, 2).map((g) => (
                          <span
                            key={g.id}
                            className="text-zinc-600 text-[10px]"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* View all results */}
              {results.length >= 6 && (
                <Link
                  href={`/movies?q=${encodeURIComponent(query)}`}
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="flex items-center justify-center gap-2 py-3 text-xs text-primary hover:bg-zinc-800 transition-colors font-bold border-t border-zinc-800"
                >
                  <Search className="w-3.5 h-3.5" />
                  Xem tất cả kết quả cho &quot;{query}&quot;
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
