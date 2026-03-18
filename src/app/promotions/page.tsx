"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Megaphone,
  Clock,
  ChevronRight,
  Search,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import Image from "next/image";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// fetch với retry — thử lại tối đa `retries` lần khi gặp Network Error
async function fetchWithRetry(
  url: string,
  retries = 2,
  delayMs = 800,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      return res;
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  type: string;
  end_date: string | null;
}

const TYPE_TABS = [
  { value: "", label: "Tất cả" },
  { value: "BANK", label: "🏦 Ngân hàng" },
  { value: "WALLET", label: "💳 Ví điện tử" },
  { value: "PARTNER", label: "🤝 Đối tác" },
  { value: "MEMBER", label: "⭐ Thành viên" },
  { value: "OTHER", label: "🎁 Khác" },
];

const TYPE_BADGE_COLORS: Record<string, string> = {
  BANK: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  WALLET: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  PARTNER: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  MEMBER: "bg-green-500/15 text-green-300 border-green-500/30",
  OTHER: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

const TYPE_LABELS: Record<string, string> = {
  BANK: "Ngân hàng",
  WALLET: "Ví điện tử",
  PARTNER: "Đối tác",
  MEMBER: "Thành viên",
  OTHER: "Khác",
};

function getDaysLeft(endDate: string | null): string | null {
  if (!endDate) return null;
  const diff = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return null;
  if (diff === 0) return "Hết hôm nay";
  return `Còn ${diff} ngày`;
}

function CampaignCard({ c }: { c: Campaign }) {
  const daysLeft = getDaysLeft(c.end_date);
  return (
    <Link
      href={`/promotions/campaigns/${c.id}`}
      className="group block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-black/30"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] bg-zinc-800 overflow-hidden">
        {c.thumbnail_url ? (
          <Image
            src={c.thumbnail_url}
            alt={c.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Megaphone className="w-12 h-12 text-zinc-600" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Days left badge */}
        {daysLeft && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-orange-400 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-400/20">
            <Clock className="w-3 h-3" />
            {daysLeft}
          </div>
        )}
        {/* Type badge */}
        <div
          className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${TYPE_BADGE_COLORS[c.type] || TYPE_BADGE_COLORS.OTHER}`}
        >
          {TYPE_LABELS[c.type] || c.type}
        </div>
        {/* Arrow on hover */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ChevronRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-zinc-100 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {c.title}
        </h3>
        {c.description && (
          <p className="text-zinc-500 text-xs mt-2 line-clamp-2 leading-relaxed">
            {c.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-1 text-orange-400 text-xs font-medium opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
          Xem chi tiết <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-zinc-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeType, setActiveType] = useState("");
  const [search, setSearch] = useState("");

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const params = activeType ? `?type=${activeType}&limit=24` : "?limit=24";
      const res = await fetchWithRetry(`${API_BASE}/campaigns${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { data: Campaign[] };
      setCampaigns(json.data || []);
    } catch (err) {
      console.warn("[Promotions] Cannot load campaigns:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const filtered = search
    ? campaigns.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : campaigns;

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* ── Hero Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-950/60 via-[#0d0d0d] to-pink-950/40 border-b border-white/5">
        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-900/30">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-orange-400 font-semibold text-sm uppercase tracking-widest">
              Ưu đãi & Khuyến mãi
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3">
            Săn ưu đãi,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
              xem phim rẻ hơn
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg">
            Khám phá hàng loạt ưu đãi độc quyền từ ngân hàng, ví điện tử và đối
            tác của chúng tôi.
          </p>

          {/* Search bar */}
          <div className="mt-8 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm ưu đãi..."
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all placeholder:text-zinc-600 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                activeType === tab.value
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-900/30"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-zinc-500 text-sm mb-6">
            {filtered.length > 0
              ? `Tìm thấy ${filtered.length} ưu đãi`
              : search
                ? "Không tìm thấy ưu đãi phù hợp"
                : "Hiện chưa có ưu đãi nào"}
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((c) => <CampaignCard key={c.id} c={c} />)}
        </div>

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <WifiOff className="w-10 h-10 text-zinc-600" />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-medium">Không thể tải ưu đãi</p>
              <p className="text-zinc-600 text-sm mt-1">
                Kiểm tra kết nối hoặc thử lại sau.
              </p>
            </div>
            <button
              onClick={fetchCampaigns}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors text-sm font-medium border border-orange-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Megaphone className="w-10 h-10 text-zinc-600" />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-medium">Chưa có ưu đãi nào</p>
              <p className="text-zinc-600 text-sm mt-1">
                Hãy quay lại sau để xem thêm ưu đãi mới nhé!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
