"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, MapPin, ChevronRight, Clock, Ticket, XCircle, CheckCircle2, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

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

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    icon: <Clock className="w-4 h-4" />,
  },
  COMPLETED: {
    label: "Thành công",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-gray-500",
    bg: "bg-gray-500/10 border-gray-500/20",
    icon: <XCircle className="w-4 h-4" />,
  },
};

function PendingCountdown({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire?: () => void;
}) {
  const [remaining, setRemaining] = useState(
    Math.max(0, new Date(expiresAt).getTime() - Date.now()),
  );
  const hasExpiredFired = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(ms);
      if (ms === 0 && !hasExpiredFired.current) {
        hasExpiredFired.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (remaining <= 0) {
    return (
      <span className="text-xs text-red-500 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
        Đã hết hạn
      </span>
    );
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 2 * 60 * 1000;

  return (
    <span
      className={`text-xs font-bold tabular-nums px-3 py-1.5 rounded-xl border ${
        isUrgent 
          ? "text-red-400 border-red-400/20 bg-red-400/10 animate-pulse" 
          : "text-yellow-400 border-yellow-400/20 bg-yellow-400/10"
      }`}
    >
      ⏱ {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

interface BookingHistoryProps {
  orders: OrderData[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export default function BookingHistory({ 
  orders, 
  hasMore, 
  loadingMore, 
  onLoadMore 
}: BookingHistoryProps) {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "CANCELLED">("ALL");
  const [expiredOrderIds, setExpiredOrderIds] = useState<Set<string>>(new Set());

  const filteredOrders = orders.filter(order => {
    if (filter === "ALL") return true;
    return order.status === filter;
  });

  const handleOrderExpired = (orderId: string) => {
    setExpiredOrderIds((prev) => new Set(prev).add(orderId));
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Lịch sử đặt vé
        </h1>
        <p className="text-gray-400">Theo dõi các suất chiếu sắp tới và vé đã xem của bạn.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: "ALL", label: "Tất cả" },
          { id: "COMPLETED", label: "Thành công" },
          { id: "PENDING", label: "Chờ thanh toán" },
          { id: "CANCELLED", label: "Đã hủy" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              filter === item.id
                ? "bg-white text-black border-white"
                : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Ticket className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-gray-500 font-medium">Không có đơn hàng nào trong mục này</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const movie = order.showtime?.movie;
            const room = order.showtime?.room;
            const isPending = order.status === "PENDING";
            const isExpired = isPending && (expiredOrderIds.has(order.id) || new Date(order.expires_at).getTime() < Date.now());

            return (
              <div key={order.id} className="glass-card rounded-3xl p-6 flex flex-col md:flex-row gap-6 group hover:border-white/20 transition-all relative overflow-hidden">
                {/* Poster */}
                <div className="w-full md:w-32 h-48 md:h-44 rounded-2xl overflow-hidden shadow-2xl shrink-0">
                  <img 
                    src={movie?.poster_url || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1"} 
                    alt={movie?.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                        {movie?.title || "Không rõ phim"}
                      </h3>
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                      <div className="flex items-center gap-3 text-gray-400">
                        <Calendar size={18} className="text-primary" />
                        <span className="text-sm font-medium">
                          {order.showtime ? format(new Date(order.showtime.start_time), "dd/MM/yyyy") : "---"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400">
                        <Clock size={18} className="text-primary" />
                        <span className="text-sm font-medium">
                          {order.showtime ? format(new Date(order.showtime.start_time), "HH:mm") : "---"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 col-span-1 sm:col-span-2">
                        <MapPin size={18} className="text-primary" />
                        <span className="text-sm font-medium line-clamp-1">{room?.cinema?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tổng tiền</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-white">{order.final_amount.toLocaleString("vi-VN")}</span>
                        <span className="text-sm font-bold text-white/50">VNĐ</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isPending && !isExpired && (
                        <PendingCountdown 
                          expiresAt={order.expires_at} 
                          onExpire={() => handleOrderExpired(order.id)} 
                        />
                      )}

                      {order.status === "COMPLETED" && (
                        <Link href="/profile/tickets">
                          <button className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-all transform active:scale-95 shadow-xl shadow-white/5">
                            <Ticket size={18} /> Vé của tôi
                          </button>
                        </Link>
                      )}

                      {isPending && !isExpired && (
                        <Link href={`/booking/checkout/${order.showtime.id}?order_id=${order.id}`}>
                          <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all transform active:scale-95">
                            <PlayCircle size={18} /> Thanh toán tiếp
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="group relative px-8 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all font-bold text-gray-400 hover:text-white disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-2">
                {loadingMore ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                )}
                <span>{loadingMore ? "Đang tải..." : "Xem thêm đơn hàng"}</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
