"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Clock } from "lucide-react";

import { useRouter } from "next/navigation";

interface UrgencyBannerProps {
  expiresAt: string; // ISO datetime string
  showtimeId: string | number;
  orderId?: string | null; // ID đơn hàng nếu đã tạo
  onExpire?: () => void; // Callback khi hết giờ (để cancel order từ parent)
}

export default function UrgencyBanner({
  expiresAt,
  showtimeId,
  onExpire,
}: UrgencyBannerProps) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const calcRemaining = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) {
      setRemaining(0);
      setIsExpired(true);
      setShowModal(true);
      // Gọi onExpire để cancel order/unlock ghế từ parent component
      onExpire?.();
    } else {
      setRemaining(diff);
    }
  }, [expiresAt, onExpire]);

  useEffect(() => {
    calcRemaining();
    const interval = setInterval(calcRemaining, 1000);
    return () => clearInterval(interval);
  }, [calcRemaining]);

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isUrgent = remaining > 0 && remaining < 2 * 60 * 1000; // < 2 phút

  const bannerBg = isExpired
    ? "bg-zinc-900"
    : isUrgent
      ? "bg-gradient-to-r from-amber-900/90 to-amber-800/90"
      : "bg-gradient-to-r from-rose-950/95 to-rose-900/90";

  const timerColor = isUrgent ? "text-amber-400" : "text-rose-400";

  return (
    <>
      {/* STICKY URGENCY BANNER */}
      <div
        className={`w-full sticky top-0 z-50 ${bannerBg} backdrop-blur-xl border-b border-white/5 transition-all duration-500`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isUrgent ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span className="text-white text-xs sm:text-sm font-semibold">
              {isExpired
                ? "Đơn hàng đã hết hạn"
                : isUrgent
                  ? "Sắp hết thời gian! Hoàn tất thanh toán ngay"
                  : "Ghế của bạn được giữ trong"}
            </span>
          </div>

          {!isExpired && (
            <div
              className={`font-black text-lg sm:text-2xl tabular-nums tracking-tight ${timerColor} ${isUrgent ? "animate-pulse" : ""}`}
            >
              {timeStr}
            </div>
          )}
        </div>
      </div>

      {/* EXPIRED MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">
              Đơn hàng đã hết hạn
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Thời gian giữ ghế đã kết thúc. Ghế của bạn đã được trả lại.
              <br />
              Hãy chọn lại ghế để tiếp tục đặt vé.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  router.push(`/booking/seat-selection/${showtimeId}`)
                }
                className="w-full bg-primary hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-colors"
              >
                Chọn Ghế Lại
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full border border-zinc-700 text-zinc-400 hover:text-white font-bold py-3 rounded-2xl transition-colors"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
