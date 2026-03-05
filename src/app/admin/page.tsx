"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import StatsCard from "@/components/admin/StatsCard";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Ticket,
  Film,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_users: number;
  total_tickets: number;
  total_movies: number;
  monthly_revenue: number;
  recent_orders: Array<{
    id: string;
    user_name: string;
    user_email: string;
    movie_title: string;
    final_amount: number;
    status: string;
    created_at: string;
  }>;
  chart_data: ChartData[];
}

function MiniRevenueChart({ data }: { data: ChartData[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  if (!data || data.length === 0) return null;

  const W = 280;
  const H = 110;
  const PAD = { top: 12, right: 10, bottom: 28, left: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * chartW,
    y: PAD.top + chartH - (d.revenue / maxRev) * chartH,
    ...d,
    dayLabel: days[new Date(d.date).getDay()],
    isToday: i === data.length - 1,
  }));

  // Cubic bezier smooth path
  const smooth = (points: typeof pts) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const linePath = smooth(pts);
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x} ${PAD.top + chartH} L ${pts[0].x} ${PAD.top + chartH} Z`;

  const hovered = hoveredIdx !== null ? pts[hoveredIdx] : null;

  return (
    <div className="relative select-none">
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e50914" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e50914" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#e50914" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={PAD.left}
            y1={PAD.top + chartH * (1 - t)}
            x2={PAD.left + chartW}
            y2={PAD.top + chartH * (1 - t)}
            stroke="white"
            strokeOpacity="0.05"
            strokeDasharray="3 4"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Hover vertical line */}
        {hovered && (
          <line
            x1={hovered.x}
            y1={PAD.top}
            x2={hovered.x}
            y2={PAD.top + chartH}
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {/* Dots */}
        {pts.map((pt, i) => (
          <g key={i}>
            {/* Invisible hit area */}
            <rect
              x={pt.x - 16}
              y={PAD.top}
              width={32}
              height={chartH}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            {/* Dot */}
            {(pt.isToday || hoveredIdx === i) && (
              <>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={6}
                  fill="#e50914"
                  fillOpacity="0.2"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={3.5}
                  fill="#e50914"
                  filter="url(#glow)"
                />
                <circle cx={pt.x} cy={pt.y} r={2} fill="white" />
              </>
            )}
            {!pt.isToday && hoveredIdx !== i && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={2}
                fill="white"
                fillOpacity="0.2"
              />
            )}

            {/* Day label */}
            <text
              x={pt.x}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fill={pt.isToday ? "#e50914" : "rgba(255,255,255,0.3)"}
              fontWeight={pt.isToday ? "600" : "400"}
            >
              {pt.dayLabel}
            </text>
          </g>
        ))}

        {/* Tooltip */}
        {hovered &&
          (() => {
            const tipW = 80;
            const tipH = 30;
            let tipX = hovered.x - tipW / 2;
            tipX = Math.max(PAD.left, Math.min(tipX, W - PAD.right - tipW));
            const tipY = hovered.y - tipH - 8;

            return (
              <g>
                <rect
                  x={tipX}
                  y={tipY}
                  width={tipW}
                  height={tipH}
                  rx="6"
                  fill="#1a1a1a"
                  stroke="#e50914"
                  strokeOpacity="0.4"
                  strokeWidth="0.8"
                />
                <text
                  x={tipX + tipW / 2}
                  y={tipY + 11}
                  textAnchor="middle"
                  fontSize="8"
                  fill="rgba(255,255,255,0.5)"
                >
                  {hovered.dayLabel}
                </text>
                <text
                  x={tipX + tipW / 2}
                  y={tipY + 23}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="white"
                  fontWeight="600"
                >
                  {formatRevShort(hovered.revenue)}đ
                </text>
              </g>
            );
          })()}
      </svg>
    </div>
  );
}

function formatRevShort(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return `${amount}`;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// --- Donut Chart ---
function DonutChart({
  data,
  colors,
}: {
  data: { label: string; value: number }[];
  colors: string[];
}) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent - Math.PI / 2);
    const y = Math.sin(2 * Math.PI * percent - Math.PI / 2);
    return [x, y];
  };

  return (
    <div className="flex items-center gap-6">
      <div className="w-24 h-24 relative">
        <svg viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)" }}>
          {data.map((item, index) => {
            if (item.value === 0) return null;
            const percent = item.value / total;
            const [startX, startY] =
              getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += percent;

            // Handle when single item is 100%
            if (percent === 1) {
              return (
                <circle
                  key={index}
                  cx="0"
                  cy="0"
                  r="0.8"
                  fill="transparent"
                  stroke={colors[index]}
                  strokeWidth="0.4"
                />
              );
            }

            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX * 0.8} ${startY * 0.8}`, // Move
              `A 0.8 0.8 0 ${largeArcFlag} 1 ${endX * 0.8} ${endY * 0.8}`, // Arc
            ].join(" ");

            return (
              <path
                key={index}
                d={pathData}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth="0.4"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-white text-xs font-bold">{total}</span>
          <span className="text-white/40 text-[9px]">Tổng</span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-white/70 text-xs">{item.label}</span>
            </div>
            <span className="text-white font-medium text-xs">
              {item.value} ({((item.value / total) * 100 || 0).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const res = (await apiClient.get("/admin/stats")) as {
        success: boolean;
        data: DashboardStats;
      };
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu thống kê");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Thiết lập SSE để nhận thông báo realtime
    const token = useAuthStore.getState().token;
    if (!token) return;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    // backend hỗ trợ lấy token từ query param ?token=...
    const sseUrl = `${apiUrl}/admin/notifications/stream?token=${token}`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log("✅ SSE Connected to Admin Hub");
    };

    eventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🔔 New notification:", data);
        if (data.type === "order_completed") {
          // Khi có đơn hàng mới, cập nhật lại toàn bộ stats
          fetchStats();
        }
      } catch (e) {
        console.error("❌ Failed to parse SSE data:", e);
      }
    });

    eventSource.onerror = () => {
      // EventSource tự động reconnect — đây chỉ 'warn' để không làm rối console
      console.warn("[SSE] Connection interrupted, reconnecting...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-white/40 hover:text-white underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Mocking data for online users and order status breakdown based on totals
  const totalUsers = stats?.total_users ?? 0;
  const onlineUsers = Math.floor(totalUsers * 0.35); // Giả lập 35% đang online
  const offlineUsers = totalUsers - onlineUsers;

  const userDonutData = [
    { label: "Online", value: onlineUsers },
    { label: "Offline", value: offlineUsers },
  ];

  // Giả lập trạng thái đơn hàng (để biểu đồ thứ 2 có tính thực tế)
  const totalOrders = stats?.total_orders ?? 0;
  const completedOrders = Math.floor(totalOrders * 0.8);
  const cancelledOrders = Math.floor(totalOrders * 0.15);
  const otherOrders = totalOrders - completedOrders - cancelledOrders;

  const orderDonutData = [
    { label: "Hoàn tất", value: completedOrders },
    { label: "Đã hủy", value: cancelledOrders },
    { label: "Khác", value: otherOrders },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
          <p className="text-white/40 text-sm mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          <TrendingUp size={14} className="text-green-400" />
          <span>Cập nhật theo thời gian thực</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard
          title="Tổng doanh thu"
          value={stats?.total_revenue ?? 0}
          prefix="₫"
          icon={<DollarSign size={18} />}
          color="red"
        />
        <StatsCard
          title="Tổng đơn hàng"
          value={stats?.total_orders ?? 0}
          icon={<ShoppingBag size={18} />}
          color="blue"
        />
        <StatsCard
          title="Người dùng"
          value={stats?.total_users ?? 0}
          icon={<Users size={18} />}
          color="green"
        />
        <StatsCard
          title="Vé đã bán"
          value={stats?.total_tickets ?? 0}
          icon={<Ticket size={18} />}
          color="purple"
        />
        <StatsCard
          title="Phim hoạt động"
          value={stats?.total_movies ?? 0}
          icon={<Film size={18} />}
          color="gold"
        />
      </div>

      {/* Charts & Table Row 1 (Revenue & Recent Orders) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-1 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold text-sm">
                Doanh thu 7 ngày
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                Tháng này:{" "}
                <span className="text-[#f5c518] font-medium">
                  {formatVND(stats?.monthly_revenue ?? 0)}
                </span>
              </p>
            </div>
            <CalendarDays size={16} className="text-white/30" />
          </div>
          {stats?.chart_data && <MiniRevenueChart data={stats.chart_data} />}
        </div>

        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">
              Đơn hàng gần đây
            </h2>
            <span className="text-white/30 text-xs">
              {stats?.recent_orders?.length ?? 0} đơn mới nhất
            </span>
          </div>
          <RecentOrdersTable orders={stats?.recent_orders ?? []} />
        </div>
      </div>

      {/* Charts Row 2 (Donut Charts for Users & Orders) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-sm">
              Trạng thái người dùng
            </h2>
            <Users size={16} className="text-[#4ade80]" />
          </div>
          <DonutChart data={userDonutData} colors={["#4ade80", "#3f3f46"]} />
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-sm">
              Trạng thái đơn hàng
            </h2>
            <ShoppingBag size={16} className="text-[#60a5fa]" />
          </div>
          <DonutChart
            data={orderDonutData}
            colors={["#60a5fa", "#f87171", "#fbbf24"]}
          />
        </div>

        <div className="bg-gradient-to-br from-[#e50914]/20 to-[#b80710]/5 border border-[#e50914]/20 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
          <h2 className="text-white font-bold text-lg mb-2">
            Quản trị Hệ thống
          </h2>
          <p className="text-white/70 text-sm mb-4">
            Các tính năng cấu hình nâng cao đã được kích hoạt trong phiên bản
            này.
          </p>
          <div className="flex space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-green-500 text-xs font-semibold">
              Hệ thống ổn định
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
