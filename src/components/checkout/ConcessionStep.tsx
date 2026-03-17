"use client";

import { Minus, Plus, Loader2 } from "lucide-react";
import NextImage from "next/image";

interface Concession {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
}

interface ConcessionStepProps {
  concessions: Concession[];
  cartConcessions: Record<number, number>;
  onQuantityChange: (id: number, diff: number) => void;
  isLoading: boolean;
  onSkip: () => void;
  onNext: () => void;
}

export default function ConcessionStep({
  concessions,
  cartConcessions,
  onQuantityChange,
  isLoading,
  onSkip,
  onNext,
}: ConcessionStepProps) {
  const concessionTotal = Object.entries(cartConcessions).reduce(
    (sum, [cId, qty]) => {
      const c = concessions.find((x) => x.id === parseInt(cId));
      return sum + (c ? c.price * qty : 0);
    },
    0,
  );

  const totalItems = Object.values(cartConcessions).reduce((s, q) => s + q, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          🍿 Thêm Bắp & Nước
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Hoàn toàn tùy chọn — bạn có thể bỏ qua bước này
        </p>
      </div>

      {/* Concession list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : concessions.length === 0 ? (
        <div className="text-zinc-500 text-center py-10">
          Chưa có sản phẩm bắp nước.
        </div>
      ) : (
        <div className="space-y-3">
          {concessions.map((c) => {
            const qty = cartConcessions[c.id] || 0;
            const isSelected = qty > 0;

            return (
              <div
                key={c.id}
                className={`
                  flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                  ${
                    isSelected
                      ? "border-orange-500/60 bg-orange-500/5 shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)]"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                  }
                `}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800 relative">
                  {c.image_url ? (
                    <NextImage
                      src={c.image_url}
                      alt={c.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🍿
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-white font-bold text-sm sm:text-base leading-tight">
                        {c.name}
                      </h3>
                      {c.description && (
                        <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2">
                          {c.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-full">
                        x{qty}
                      </span>
                    )}
                  </div>
                  <div className="text-orange-400 font-black text-sm sm:text-base mt-1">
                    {c.price.toLocaleString("vi-VN")}đ
                  </div>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-2 bg-zinc-900 rounded-xl border border-zinc-700 p-1 flex-shrink-0">
                  <button
                    onClick={() => onQuantityChange(c.id, -1)}
                    disabled={qty === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-white font-black text-sm">
                    {qty}
                  </span>
                  <button
                    onClick={() => onQuantityChange(c.id, 1)}
                    disabled={qty >= 10}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-400 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtotal */}
      {concessionTotal > 0 && (
        <div className="flex items-center justify-between py-3 px-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <span className="text-zinc-300 text-sm font-semibold">
            Tổng đồ ăn/uống ({totalItems} món):
          </span>
          <span className="text-orange-400 font-black">
            {concessionTotal.toLocaleString("vi-VN")}đ
          </span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onSkip}
          className="flex-none px-5 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold text-sm transition-colors"
        >
          Bỏ qua
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-sm transition-colors shadow-[0_0_20px_-5px_rgba(249,115,22,0.6)]"
        >
          Tiếp Tục →
        </button>
      </div>
    </div>
  );
}
