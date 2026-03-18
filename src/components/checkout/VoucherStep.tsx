"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Loader2, X } from "lucide-react";
import { ApiResponse } from "@/types/api";

interface PromotionPreview {
  promotion_id: number;
  code: string;
  description: string;
  discount_amount: number;
  final_amount: number;
}

interface VoucherStepProps {
  orderValue: number; // tổng tiền vé + bắp nước (trước discount)
  onVoucherApplied: (preview: PromotionPreview | null) => void;
  promotionPreview: PromotionPreview | null;
  onBack: () => void;
  onNext: () => void;
}

type VoucherStatus = "idle" | "loading" | "success" | "error" | "warning";

export default function VoucherStep({
  orderValue,
  onVoucherApplied,
  promotionPreview,
  onBack,
  onNext,
}: VoucherStepProps) {
  const [code, setCode] = useState(promotionPreview?.code || "");
  const [status, setStatus] = useState<VoucherStatus>(
    promotionPreview ? "success" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [warningData, setWarningData] = useState<{
    minOrderValue: number;
    currentAmount: number;
  } | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    setWarningData(null);

    try {
      const { apiClient } = await import("@/lib/api");
      const res = await apiClient.post<ApiResponse<PromotionPreview>>(
        "/promotions/validate",
        {
          code: code.trim(),
          order_value: orderValue,
        },
      ) as unknown as ApiResponse<PromotionPreview>;

      if (res.success && res.data) {
        setStatus("success");
        onVoucherApplied(res.data);
      } else {
        // Check specific error codes
        if (res.code === "ORDER_VALUE_TOO_LOW") {
          const minVal = (res.data_extra as { min_order_value?: number })?.min_order_value || 0;
          setStatus("warning");
          setWarningData({ minOrderValue: minVal, currentAmount: orderValue });
        } else {
          setStatus("error");
          setErrorMsg(res.error || "Mã giảm giá không hợp lệ.");
        }
        onVoucherApplied(null);
      }
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: ApiResponse<PromotionPreview> } }).response?.data;
      if (errRes?.code === "ORDER_VALUE_TOO_LOW") {
        setStatus("warning");
        setWarningData({
          minOrderValue: (errRes.data_extra as { min_order_value?: number })?.min_order_value || 0,
          currentAmount: orderValue,
        });
      } else {
        setStatus("error");
        setErrorMsg(errRes?.error || "Lỗi kiểm tra mã giảm giá.");
      }
      onVoucherApplied(null);
    }
  };

  const handleClear = () => {
    setCode("");
    setStatus("idle");
    setErrorMsg("");
    setWarningData(null);
    onVoucherApplied(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">
          🏷️ Bạn có mã giảm giá không?
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Nhập mã để áp dụng vào đơn hàng
        </p>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={code}
            disabled={status === "success"}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setStatus("idle");
              setErrorMsg("");
              setWarningData(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Nhập mã voucher..."
            maxLength={20}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white uppercase font-bold tracking-widest placeholder:tracking-normal placeholder:text-zinc-600 placeholder:font-normal focus:border-orange-500 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
          />
          <button
            onClick={status === "success" ? handleClear : handleApply}
            disabled={
              status === "loading" || (!code.trim() && status !== "success")
            }
            className={`px-4 sm:px-6 rounded-xl font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap
              ${
                status === "success"
                  ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                  : "bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]"
              }
            `}
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === "success" ? (
              <X className="w-4 h-4" />
            ) : (
              "Áp dụng"
            )}
          </button>
        </div>

        {/* Status Messages */}
        {status === "success" && promotionPreview && (
          <div className="flex items-start gap-3 p-4 bg-green-900/20 border border-green-700/50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-400 font-bold text-sm">
                {promotionPreview.code} — {promotionPreview.description}
              </p>
              <p className="text-green-500/70 text-xs mt-0.5">
                Giảm{" "}
                <span className="font-black">
                  {promotionPreview.discount_amount.toLocaleString("vi-VN")}đ
                </span>{" "}
                khỏi đơn hàng
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-700/50 rounded-xl">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {status === "warning" && warningData && (
          <div className="flex items-start gap-3 p-4 bg-amber-900/20 border border-amber-700/50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 text-sm font-bold">
                Đơn hàng cần tối thiểu{" "}
                {warningData.minOrderValue.toLocaleString("vi-VN")}đ để dùng mã
                này
              </p>
              <p className="text-amber-500/70 text-xs mt-0.5">
                Đơn hiện tại:{" "}
                <span className="font-bold">
                  {warningData.currentAmount.toLocaleString("vi-VN")}đ
                </span>{" "}
                — còn thiếu{" "}
                <span className="font-bold">
                  {(
                    warningData.minOrderValue - warningData.currentAmount
                  ).toLocaleString("vi-VN")}
                  đ
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold text-sm transition-colors"
        >
          ← Quay lại
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
