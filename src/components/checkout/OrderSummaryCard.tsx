"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Film,
  MapPin,
  Clock,
  Armchair,
} from "lucide-react";

interface LockedSeat {
  id: number;
  row_char: string;
  seat_number: number;
  price: number;
  type: string;
}

interface ConcessionItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface ShowtimeInfo {
  movie_title: string;
  poster_url?: string;
  cinema_name: string;
  room_name: string;
  start_time: string;
}

interface PromotionPreview {
  code: string;
  discount_amount: number;
}

interface OrderSummaryCardProps {
  showtime: ShowtimeInfo | null;
  seats: LockedSeat[];
  concessionItems: ConcessionItem[];
  promotionPreview: PromotionPreview | null;
  seatTotal: number;
  concessionTotal: number;
  discountAmount: number;
  finalAmount: number;
}

export default function OrderSummaryCard({
  showtime,
  seats,
  concessionItems,
  promotionPreview,
  seatTotal,
  concessionTotal,
  discountAmount,
  finalAmount,
}: OrderSummaryCardProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const originalAmount = seatTotal + concessionTotal;

  const SummaryContent = () => (
    <div className="space-y-4">
      {/* Showtime Info */}
      {showtime && (
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            {showtime.poster_url && (
              <img
                src={showtime.poster_url}
                alt={showtime.movie_title}
                className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <h3 className="text-white font-black text-sm leading-tight line-clamp-2">
                {showtime.movie_title}
              </h3>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
                  <span className="truncate">{showtime.cinema_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Film className="w-3 h-3 text-orange-400 flex-shrink-0" />
                  <span>{showtime.room_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Clock className="w-3 h-3 text-orange-400 flex-shrink-0" />
                  <span>
                    {new Date(showtime.start_time).toLocaleString("vi-VN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Seats */}
      {seats.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Armchair className="w-3 h-3" />
            Ghế Đã Chọn
          </div>
          <div className="flex flex-wrap gap-1.5">
            {seats.map((s) => (
              <span
                key={s.id}
                className={`px-2 py-1 rounded-lg text-xs font-bold border
                  ${
                    s.type === "VIP"
                      ? "border-yellow-600/40 bg-yellow-500/10 text-yellow-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300"
                  }
                `}
              >
                {s.row_char}
                {s.seat_number}
                {s.type === "VIP" && " ⭐"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Concessions */}
      {concessionItems.length > 0 && (
        <>
          <div className="border-t border-zinc-800" />
          <div>
            <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2">
              🍿 Bắp & Nước
            </div>
            <div className="space-y-1.5">
              {concessionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-zinc-400">
                    {item.name}{" "}
                    <span className="text-zinc-600">x{item.quantity}</span>
                  </span>
                  <span className="text-zinc-300 font-semibold">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-zinc-400">
          <span>Tiền vé</span>
          <span>{seatTotal.toLocaleString("vi-VN")}đ</span>
        </div>
        {concessionTotal > 0 && (
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Bắp & Nước</span>
            <span>{concessionTotal.toLocaleString("vi-VN")}đ</span>
          </div>
        )}
        {promotionPreview && discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-400 font-semibold">
            <span>Giảm ({promotionPreview.code})</span>
            <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-zinc-700 pt-3 mt-1">
          <div className="flex justify-between items-end">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
              Tổng thanh toán
            </span>
            <span className="text-orange-400 font-black text-xl">
              {finalAmount.toLocaleString("vi-VN")}
              <span className="text-sm ml-1">đ</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-white font-black text-lg mb-5 uppercase tracking-tight">
            📋 Tóm Tắt Đơn Hàng
          </h3>
          <SummaryContent />
        </div>
      </div>

      {/* Mobile: fixed bottom accordion */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Toggle bar */}
        <button
          onClick={() => setMobileExpanded((p) => !p)}
          className="w-full bg-zinc-900 border-t border-zinc-700 px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-sm font-semibold">Tổng:</span>
            <span className="text-orange-400 font-black text-lg">
              {finalAmount.toLocaleString("vi-VN")}đ
            </span>
            {promotionPreview && (
              <span className="px-1.5 py-0.5 bg-green-900/50 text-green-400 text-[10px] font-bold rounded border border-green-700/50">
                -{promotionPreview.code}
              </span>
            )}
          </div>
          {mobileExpanded ? (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {/* Expanded Content */}
        {mobileExpanded && (
          <div className="bg-zinc-900 border-t border-zinc-800 px-4 pt-4 pb-6 max-h-[60vh] overflow-y-auto">
            <SummaryContent />
          </div>
        )}
      </div>
    </>
  );
}
