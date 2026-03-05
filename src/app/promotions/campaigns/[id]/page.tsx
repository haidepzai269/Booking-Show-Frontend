"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ChevronDown,
  ChevronRight,
  Ticket,
  CheckCircle2,
  Megaphone,
  WifiOff,
  RefreshCw,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function fetchWithRetry(
  url: string,
  retries = 2,
  delayMs = 800,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(url, { cache: "no-store" });
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
  banner_url: string;
  type: string;
  how_to_avail: string;
  terms_conditions: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

const TYPE_LABELS: Record<string, string> = {
  BANK: "🏦 Ngân hàng",
  WALLET: "💳 Ví điện tử",
  PARTNER: "🤝 Đối tác",
  MEMBER: "⭐ Thành viên",
  OTHER: "🎁 Khác",
};

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDaysLeft(endDate: string | null): number | null {
  if (!endDate) return null;
  const diff = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return diff >= 0 ? diff : null;
}

// Parse text-based steps (each line starting with "Bước" or dashed list)
function parseSteps(text: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center px-5 py-4 text-left bg-zinc-900/60 hover:bg-zinc-800/40 transition-colors"
      >
        <span className="font-medium text-zinc-200">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 py-4 bg-zinc-900/30 border-t border-zinc-800">
          {children}
        </div>
      )}
    </div>
  );
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const doFetch = async () => {
      try {
        const res = await fetchWithRetry(`${API_BASE}/campaigns/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Campaign;
        setCampaign(data);
      } catch (e) {
        console.warn("[Campaign Detail] Cannot load:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center gap-4">
        <WifiOff className="w-12 h-12 text-zinc-700" />
        <div className="text-center">
          <p className="text-zinc-300 font-medium text-lg">
            Không tìm thấy ưu đãi
          </p>
          <p className="text-zinc-600 text-sm mt-1">
            Ưu đãi không tồn tại hoặc đã kết thúc.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setNotFound(false);
              setLoading(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium border border-orange-500/20"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
          <Link
            href="/promotions"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm"
          >
            ← Quay về
          </Link>
        </div>
      </div>
    );
  }

  const steps = parseSteps(campaign.how_to_avail);
  const terms = parseSteps(campaign.terms_conditions);
  const daysLeft = getDaysLeft(campaign.end_date);

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-28">
      {/* Hero Banner */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] max-h-[500px] bg-zinc-900 overflow-hidden">
        {campaign.banner_url || campaign.thumbnail_url ? (
          <img
            src={campaign.banner_url || campaign.thumbnail_url}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-950/50 to-pink-950/30">
            <Megaphone className="w-24 h-24 text-zinc-700" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/30 to-transparent" />

        {/* Back button */}
        <Link
          href="/promotions"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm border border-white/10 hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tất cả ưu đãi
        </Link>

        {/* Type badge */}
        <div className="absolute bottom-6 left-4 sm:left-6">
          <span className="bg-orange-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {TYPE_LABELS[campaign.type] || campaign.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative">
        {/* Title card */}
        <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {campaign.title}
          </h1>
          {campaign.description && (
            <p className="text-zinc-400 mt-3 leading-relaxed">
              {campaign.description}
            </p>
          )}

          {/* Date info */}
          {(campaign.start_date || campaign.end_date) && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-zinc-500">
                {campaign.start_date
                  ? `${formatDate(campaign.start_date)} — ${formatDate(campaign.end_date)}`
                  : `Đến ${formatDate(campaign.end_date)}`}
              </span>
              {daysLeft !== null && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    daysLeft <= 3
                      ? "bg-red-500/15 text-red-400"
                      : "bg-orange-500/15 text-orange-400"
                  }`}
                >
                  {daysLeft === 0 ? "Hết hôm nay" : `Còn ${daysLeft} ngày`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* How to avail */}
        {steps.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-black">
                ✓
              </span>
              Cách áp dụng ưu đãi
            </h2>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-start bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-sm font-black shrink-0 mt-0.5 shadow-lg shadow-orange-900/20">
                    {idx + 1}
                  </div>
                  <p className="text-zinc-300 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms & Conditions Accordion */}
        {terms.length > 0 && (
          <div className="mb-6">
            <Accordion title="📋 Điều khoản & Điều kiện">
              <ul className="space-y-2">
                {terms.map((term, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2 items-start text-sm text-zinc-400"
                  >
                    <CheckCircle2 className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                    <span>{term.replace(/^[-•*]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </Accordion>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/95 to-transparent">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Link
            href="/movies"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-xl shadow-orange-900/30 active:scale-95"
          >
            <Ticket className="w-5 h-5" />
            Đặt vé xem phim ngay
          </Link>
          <Link
            href="/promotions"
            className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3.5 px-5 rounded-xl transition-colors border border-zinc-700"
          >
            Ưu đãi khác <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
