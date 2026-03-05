"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";

type Gateway = "VNPAY" | "ZALOPAY" | "PAYOS";

const GATEWAYS: {
  id: Gateway;
  label: string;
  icon: React.ReactNode;
  desc: string;
  color: string;
  activeBg: string;
}[] = [
  {
    id: "VNPAY",
    label: "VNPay",
    icon: <CreditCard className="w-6 h-6" />,
    desc: "ATM / Thẻ quốc tế / QR VNPay",
    color: "border-blue-500",
    activeBg: "bg-blue-500/10",
  },
  {
    id: "ZALOPAY",
    label: "ZaloPay",
    icon: <Smartphone className="w-6 h-6" />,
    desc: "Ví ZaloPay / QR ZaloPay",
    color: "border-sky-400",
    activeBg: "bg-sky-400/10",
  },
  {
    id: "PAYOS",
    label: "PayOS",
    icon: <Banknote className="w-6 h-6" />,
    desc: "Chuyển khoản ngân hàng / QR PayOS",
    color: "border-green-500",
    activeBg: "bg-green-500/10",
  },
];

interface PaymentStepProps {
  finalAmount: number;
  onBack: () => void;
  onPay: (gateway: Gateway) => Promise<void>;
  isSubmitting: boolean;
  globalError: string;
}

export default function PaymentStep({
  finalAmount,
  onBack,
  onPay,
  isSubmitting,
  globalError,
}: PaymentStepProps) {
  const [selectedGateway, setSelectedGateway] = useState<Gateway>("VNPAY");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">
          💳 Chọn Phương Thức Thanh Toán
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Chọn cổng thanh toán phù hợp với bạn
        </p>
      </div>

      {/* Gateway Cards */}
      <div className="space-y-3">
        {GATEWAYS.map((gw) => {
          const isSelected = selectedGateway === gw.id;
          return (
            <button
              key={gw.id}
              onClick={() => setSelectedGateway(gw.id)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left
                ${
                  isSelected
                    ? `${gw.color} ${gw.activeBg} shadow-lg`
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                }
              `}
            >
              {/* Radio indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isSelected ? "border-white" : "border-zinc-600"}
                `}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                  ${isSelected ? "bg-white/10 text-white" : "bg-zinc-800 text-zinc-400"}
                `}
              >
                {gw.icon}
              </div>

              {/* Label */}
              <div className="flex-1">
                <div
                  className={`font-black text-base ${isSelected ? "text-white" : "text-zinc-300"}`}
                >
                  {gw.label}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">{gw.desc}</div>
              </div>

              {isSelected && (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {globalError && (
        <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-sm font-semibold">
          {globalError}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold text-sm transition-colors disabled:opacity-50"
        >
          ← Quay lại
        </button>
        <button
          onClick={() => onPay(selectedGateway)}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-secondary hover:bg-[#ffe16b] text-black font-black text-sm transition-all shadow-[0_0_30px_-5px_rgba(255,225,107,0.6)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>Thanh Toán {finalAmount.toLocaleString("vi-VN")}đ</>
          )}
        </button>
      </div>
    </div>
  );
}
