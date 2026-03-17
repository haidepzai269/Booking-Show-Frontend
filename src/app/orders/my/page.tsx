"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Calendar,
  Clock,
  Ticket,
  XCircle,
  CheckCircle2,
  Loader2,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import Header from "@/components/layout/Header";
import NextImage from "next/image";

interface OrderData {
  id: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  final_amount: number;
  original_amount: number;
  discount_amount: number;
  created_at: string;
  expires_at: string;
  showtime: {
    id: number;
    start_time: string;
    movie: { title: string; poster_url: string };
    room: {
      name: string;
      cinema: { name: string; city: string };
    };
  };
}

// ─── Countdown Timer cho đơn PENDING ─────────────────────────────────────
function PendingCountdown({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire?: () => void;
}) {
  const [remaining, setRemaining] = useState(0);
  const hasExpiredFired = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    });
  }, [expiresAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(ms);
      // Gọi onExpire đúng 1 lần khi vừa về 0
      if (ms === 0 && !hasExpiredFired.current) {
        hasExpiredFired.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (remaining <= 0) {
    return (
      <span className="text-xs text-red-400 font-semibold">Đã hết hạn</span>
    );
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 2 * 60 * 1000;

  return (
    <span
      className={`text-xs font-bold tabular-nums ${isUrgent ? "text-red-400 animate-pulse" : "text-yellow-400"}`}
    >
      ⏱ {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    label: "Thành công",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-gray-500",
    bg: "bg-gray-500/10 border-gray-500/20",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function OrderCard({ 
  order, 
  index, 
  expiredOrderIds, 
  handleOrderExpired 
}: { 
  order: OrderData; 
  index: number; 
  expiredOrderIds: Set<string>;
  handleOrderExpired: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const dateObj = new Date(order.showtime?.start_time || order.created_at);
  const movie = order.showtime?.movie;
  const room = order.showtime?.room;
  const showtimeId = order.showtime?.id;
  const isPending = order.status === "PENDING";
  const isExpired = isPending && (expiredOrderIds.has(order.id) || new Date(order.expires_at).getTime() < Date.now());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group bg-[#1f1f1f] rounded-2xl flex flex-col sm:flex-row overflow-hidden border transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${
        isPending && !isExpired
          ? "border-yellow-500/20 hover:border-yellow-500/40"
          : "border-white/5 hover:border-primary/30"
      }`}
    >
      {/* Poster */}
      <div className="sm:w-36 h-36 sm:h-auto shrink-0 relative">
        <NextImage
          src={movie?.poster_url || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1"}
          alt={movie?.title || "Movie Poster"}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1f1f1f] hidden sm:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f] to-transparent sm:hidden" />
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-bold text-white line-clamp-1">
              {movie?.title || "Không rõ phim"}
            </h3>
            <span
              className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}
            >
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {format(dateObj, "dd/MM/yyyy HH:mm")}
            </span>
            {room && (
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                {room.cinema?.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Tổng tiền
            </span>
            <p className="text-xl font-black text-white">
              {order.final_amount?.toLocaleString("vi-VN")}
              <span className="text-sm ml-1">đ</span>
            </p>
            {order.discount_amount > 0 && (
              <p className="text-xs text-green-400">
                Đã giảm {order.discount_amount.toLocaleString("vi-VN")}đ
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {isPending && !isExpired && order.expires_at && (
              <PendingCountdown
                expiresAt={order.expires_at}
                onExpire={() => handleOrderExpired(order.id)}
              />
            )}

            {order.status === "COMPLETED" && (
              <Link href="/profile/tickets">
                <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
                  <Ticket className="w-4 h-4" /> Xem Vé
                </button>
              </Link>
            )}

            {isPending && !isExpired && showtimeId && (
              <Link href={`/booking/checkout/${showtimeId}?order_id=${order.id}`}>
                <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
                  <PlayCircle className="w-4 h-4" /> Tiếp Tục Thanh Toán
                </button>
              </Link>
            )}

            {isPending && isExpired && (
              <span className="text-xs text-gray-500 italic">Đơn đã hết hạn</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [expiredOrderIds, setExpiredOrderIds] = useState<Set<string>>(new Set());
  const { user } = useAuthStore();
  const router = useRouter();

  const handleOrderExpired = useCallback((orderId: string) => {
    setExpiredOrderIds((prev) => new Set(prev).add(orderId));
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push("/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: OrderData[] }>(
          "/orders/my"
        );
        // Kiểm tra đúng kiểu trả về của apiClient (thường axios bọc trong data)
        const responseData = (res as any).data || res;
        if (responseData.success && responseData.data) {
          setOrders(responseData.data);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, router, isHydrated]);

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Header />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Lịch Sử Đơn Hàng
              </h1>
              <p className="text-gray-400 mt-1">Toàn bộ lịch sử đặt vé của bạn</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-white/5">
              <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-gray-400 mb-6">Hãy đặt vé xem phim yêu thích ngay!</p>
              <Link
                href="/movies"
                className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-colors"
              >
                Khám Phá Phim
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order, index) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={index}
                  expiredOrderIds={expiredOrderIds}
                  handleOrderExpired={handleOrderExpired}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
