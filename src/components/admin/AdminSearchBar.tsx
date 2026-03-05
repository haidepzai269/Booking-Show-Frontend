"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Film,
  Users,
  ShoppingCart,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

interface SearchMovie {
  id: number;
  title: string;
  poster: string;
  is_active: boolean;
  ai_match?: boolean;
}

interface SearchUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface SearchOrder {
  id: string;
  user_name: string;
  movie_title: string;
  final_amount: number;
  status: string;
}

interface SearchResults {
  movies: SearchMovie[];
  users: SearchUser[];
  orders: SearchOrder[];
  query: string;
  ai_used: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "text-green-400",
  PENDING: "text-yellow-400",
  CANCELLED: "text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Hoàn thành",
  PENDING: "Chờ",
  CANCELLED: "Đã hủy",
};

export default function AdminSearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Dùng apiClient thay vì fetch thủ công → tự xử lý baseURL + auth token
  const fetchSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) return;
    setLoading(true);
    try {
      const res = await apiClient.get<
        any,
        { success: boolean; data: SearchResults }
      >(`/admin/search?q=${encodeURIComponent(q)}`);
      if (res.success) {
        setResults(res.data);
        setShowDropdown(true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce 350ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSearch(query), 350);
    } else {
      setResults(null);
      setShowDropdown(false);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSearch]);

  // Click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (!query) setIsExpanded(false);
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsExpanded(false);
      setQuery("");
      setShowDropdown(false);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setQuery("");
    setIsExpanded(false);
    setShowDropdown(false);
  };

  const hasResults =
    results &&
    (results.movies.length > 0 ||
      results.users.length > 0 ||
      results.orders.length > 0);

  return (
    <div
      ref={containerRef}
      className="relative flex justify-end items-center h-9"
    >
      {/* Search Input */}
      <div
        className={`flex items-center h-9 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden rounded-lg ${
          isExpanded
            ? "w-[260px] sm:w-[320px] bg-white/10 px-3 shadow-lg border border-white/20"
            : "w-9 bg-white/5 justify-center cursor-pointer hover:bg-white/10 text-white/40 hover:text-white border border-transparent"
        }`}
        onClick={() => {
          if (!isExpanded) {
            setIsExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 150);
          }
        }}
      >
        {loading ? (
          <Loader2
            size={16}
            className={`shrink-0 text-[#e50914] animate-spin ${isExpanded ? "mr-2.5" : ""}`}
          />
        ) : (
          <Search
            size={16}
            className={`shrink-0 transition-all duration-300 ${isExpanded ? "text-white/60 mr-2.5" : ""}`}
          />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            loading ? "✨ AI đang phân tích..." : "Tìm phim, user, đơn hàng..."
          }
          className={`bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 transition-all duration-500 flex-1 ${
            isExpanded ? "opacity-100" : "opacity-0 w-0"
          }`}
        />

        {isExpanded && query && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuery("");
              setResults(null);
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
            className="text-white/40 hover:text-white ml-2 shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isExpanded && showDropdown && (
        <div className="absolute right-0 top-11 w-[320px] sm:w-[400px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header với AI badge */}
          {results?.ai_used && (
            <div className="px-4 py-2 bg-gradient-to-r from-[#e50914]/10 to-purple-500/10 border-b border-white/5 flex items-center gap-2">
              <Sparkles size={12} className="text-purple-400" />
              <span className="text-[10px] text-purple-400 font-medium">
                AI (Groq) đang hỗ trợ tìm kiếm phim
              </span>
            </div>
          )}

          {!hasResults ? (
            <div className="p-5 text-center text-white/40 text-sm">
              Không tìm thấy kết quả cho &quot;{query}&quot;
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              {/* Movies */}
              {results!.movies.length > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-white/5">
                    <Film size={12} className="text-[#e50914]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Phim
                    </span>
                    {results?.ai_used && (
                      <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                  {results!.movies.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleNavigate(`/admin/movies`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-8 h-10 bg-white/5 rounded overflow-hidden shrink-0">
                        {m.poster && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.poster}
                            alt={m.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-white truncate">
                            {m.title}
                          </p>
                          {m.ai_match && (
                            <Sparkles
                              size={10}
                              className="text-purple-400 shrink-0"
                            />
                          )}
                        </div>
                        <p
                          className={`text-xs ${m.is_active ? "text-green-400" : "text-white/30"}`}
                        >
                          {m.is_active ? "Đang chiếu" : "Không chiếu"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Users */}
              {results!.users.length > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-white/5 border-t border-t-white/5">
                    <Users size={12} className="text-blue-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Người dùng
                    </span>
                  </div>
                  {results!.users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleNavigate(`/admin/users`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-400 text-xs font-bold uppercase">
                          {u.full_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {u.full_name}
                        </p>
                        <p className="text-xs text-white/40 truncate">
                          {u.email}
                        </p>
                      </div>
                      <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full shrink-0">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Orders */}
              {results!.orders.length > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-white/5 border-t border-t-white/5">
                    <ShoppingCart size={12} className="text-yellow-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Đơn hàng
                    </span>
                  </div>
                  {results!.orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => handleNavigate(`/admin/orders`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                        <ShoppingCart size={14} className="text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {o.user_name} – {o.movie_title}
                        </p>
                        <p className="text-xs text-white/40">
                          {o.final_amount.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-medium shrink-0 ${
                          STATUS_COLORS[o.status] || "text-white/40"
                        }`}
                      >
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="px-4 py-2 border-t border-white/5 text-center">
                <span className="text-[10px] text-white/30">
                  Nhấn Enter để xem toàn bộ kết quả
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
