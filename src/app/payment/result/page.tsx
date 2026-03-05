"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Ticket,
  RefreshCw,
  Home,
} from "lucide-react";
import { apiClient } from "@/lib/api";

// Các tham số query từ các gateway trả về
// VNPay: ?vnp_ResponseCode=00&vnp_TxnRef=<order_id>
// ZaloPay: ?status=1&app_trans_id=...
// PayOS: ?code=00&id=...&cancel=false&status=PAID&orderCode=...
// Tham số thống nhất chúng ta thêm: ?status=cancelled hoặc chứa order info

type PaymentStatus = "loading" | "success" | "failed" | "cancelled";

interface OrderInfo {
  id: string;
  final_amount: number;
  showtime?: {
    movie?: { title: string };
    room?: { name: string; cinema?: { name: string } };
    start_time: string;
  };
}

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [ticketIds, setTicketIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    determineResult();
  }, []);

  const determineResult = async () => {
    // ── Đọc params từ URL ──
    const vnpCode = searchParams.get("vnp_ResponseCode"); // VNPay
    const vnpOrderId = searchParams.get("vnp_TxnRef"); // VNPay
    const gateway = searchParams.get("gateway"); // ZALOPAY | PAYOS (ta tự thêm)
    const orderId = searchParams.get("order_id"); // tất cả gateway (ta tự thêm)
    const statusParam = searchParams.get("status"); // ZaloPay: "1"=OK | PayOS cancel
    const cancelled = searchParams.get("cancel"); // PayOS: "true" khi hủy
    const payosCode = searchParams.get("code"); // PayOS: "00" = OK

    // ── Xác định bị hủy ──
    if (
      cancelled === "true" ||
      statusParam === "cancelled" ||
      statusParam === "CANCELLED"
    ) {
      setStatus("cancelled");
      return;
    }

    // ── Xác định thành công theo từng gateway ──
    let isSuccess = false;

    if (vnpCode !== null) {
      // VNPay: vnp_ResponseCode = "00"
      isSuccess = vnpCode === "00";
    } else if (gateway === "ZALOPAY") {
      // ZaloPay redirect: ?gateway=ZALOPAY&order_id=xxx&status=1
      // status="1" là thành công, status="2" là thất bại/hủy
      isSuccess = statusParam === "1" || statusParam === null; // null = từ embed_data redirect
    } else if (gateway === "PAYOS") {
      // PayOS redirect: ?gateway=PAYOS&order_id=xxx&code=00&status=PAID
      isSuccess = payosCode === "00" && statusParam === "PAID";
    }

    if (!isSuccess) {
      setStatus("failed");
      setErrorMsg("Giao dịch không thành công. Vui lòng thử lại.");
      return;
    }

    // ── Lấy orderId để verify từ backend ──
    const resolvedOrderId = orderId || vnpOrderId;

    if (resolvedOrderId) {
      try {
        // Trong môi trường Localhost, Server VNPay không thể tự gọi IPN webhook về máy tính chúng ta.
        // Giải pháp: Frontend đóng vai trò kích hoạt IPN thủ công bằng cách chuyển toàn bộ Query URL về Backend
        if (vnpCode !== null) {
          await apiClient.get<any, any>(
            `/payments/vnpay_return${window.location.search}`,
          );
        } else if (gateway === "ZALOPAY" || gateway === "PAYOS") {
          await apiClient.get<any, any>(
            `/payments/check_status?gateway=${gateway}&order_id=${resolvedOrderId}`,
          );
        }

        // Poll tối đa 5 lần (7.5 giây) để đợi webhook xử lý xong
        let isCompleted = false;
        for (let i = 0; i < 5; i++) {
          const res = await apiClient.get<any, { success: boolean; data: any }>(
            `/orders/${resolvedOrderId}`,
          );

          if (res.success && res.data?.status === "COMPLETED") {
            setOrderInfo(res.data);
            isCompleted = true;
            // Lấy vé của đơn này
            const ticketRes = await apiClient.get<
              any,
              { success: boolean; data: any[] }
            >("/tickets/my");
            if (ticketRes.success && ticketRes.data) {
              const myTickets = ticketRes.data
                .filter((t: any) => t.order_id === resolvedOrderId)
                .map((t: any) => t.id);
              setTicketIds(myTickets);
            }
            setStatus("success");
            return;
          }
          // Đợi 1.5 giây rồi thử lại
          if (i < 4) await new Promise((r) => setTimeout(r, 1500));
        }

        if (!isCompleted) {
          setStatus("failed");
          setErrorMsg(
            "Giao dịch đang được xử lý hoặc có lỗi xảy ra. Xin vui lòng kiểm tra lại sau.",
          );
          return;
        }
      } catch {
        setStatus("failed");
        setErrorMsg("Không thể xác thực trạng thái đơn hàng.");
      }
    } else {
      // Không có orderId trong URL — vẫn báo thành công dựa vào gateway confirm
      setStatus("success");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
        <p className="text-zinc-400 font-semibold text-lg animate-pulse">
          Đang xác thực thanh toán...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
        {/* Confetti effect via CSS */}
        <div className="relative flex flex-col items-center gap-8 max-w-md w-full">
          {/* Success Icon */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500/30 shadow-[0_0_60px_rgba(34,197,94,0.3)]">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              ✓
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-black text-white mb-3">
              Thanh Toán Thành Công!
            </h1>
            <p className="text-zinc-400 text-lg">
              Vé của bạn đã được xác nhận. Chúc bạn xem phim vui vẻ! 🎬
            </p>
          </div>

          {/* Order info card */}
          {orderInfo && (
            <div className="w-full bg-card border border-border rounded-3xl p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Phim</span>
                <span className="text-white font-bold">
                  {orderInfo.showtime?.movie?.title || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Rạp</span>
                <span className="text-white font-bold">
                  {orderInfo.showtime?.room?.cinema?.name || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Suất chiếu</span>
                <span className="text-white font-bold">
                  {orderInfo.showtime?.start_time
                    ? new Date(orderInfo.showtime.start_time).toLocaleString(
                        "vi-VN",
                        {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-zinc-400 font-black uppercase text-sm">
                  Đã thanh toán
                </span>
                <span className="text-green-400 font-black text-xl">
                  {orderInfo.final_amount?.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {ticketIds.length > 0 ? (
              <button
                onClick={() => router.push(`/tickets/${ticketIds[0]}`)}
                className="flex-1 flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(229,9,20,0.4)] uppercase"
              >
                <Ticket className="w-5 h-5" /> Xem Vé Ngay
              </button>
            ) : (
              <button
                onClick={() => router.push("/profile/tickets")}
                className="flex-1 flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(229,9,20,0.4)] uppercase"
              >
                <Ticket className="w-5 h-5" /> Xem Vé Của Tôi
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center gap-3 bg-card border border-border hover:border-zinc-600 text-zinc-300 font-bold py-4 rounded-2xl transition-all"
            >
              <Home className="w-5 h-5" /> Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
        <div className="relative flex flex-col items-center gap-8 max-w-md w-full">
          <div className="w-32 h-32 rounded-full bg-yellow-500/10 flex items-center justify-center border-2 border-yellow-500/30 shadow-[0_0_60px_rgba(234,179,8,0.2)]">
            <XCircle className="w-16 h-16 text-yellow-400" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-3">
              Đã Hủy Thanh Toán
            </h1>
            <p className="text-zinc-400">
              Bạn đã hủy giao dịch. Ghế của bạn vẫn được giữ trong vài phút. Bạn
              có thể thử lại với phương thức khác.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-3 bg-secondary hover:bg-[#ffe16b] text-black font-black py-4 rounded-2xl transition-all uppercase"
            >
              <RefreshCw className="w-5 h-5" /> Thử Lại
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center gap-3 bg-card border border-border text-zinc-300 font-bold py-4 rounded-2xl"
            >
              <Home className="w-5 h-5" /> Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
      <div className="relative flex flex-col items-center gap-8 max-w-md w-full">
        <div className="w-32 h-32 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.2)]">
          <XCircle className="w-16 h-16 text-red-400" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-3">
            Thanh Toán Thất Bại
          </h1>
          <p className="text-zinc-400">
            {errorMsg || "Giao dịch không thành công. Vui lòng thử lại."}
          </p>
          <p className="text-zinc-600 text-sm mt-2">
            Ghế của bạn vẫn đang được giữ. Bạn có thể thử với phương thức thanh
            toán khác.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-3 bg-secondary hover:bg-[#ffe16b] text-black font-black py-4 rounded-2xl transition-all uppercase"
          >
            <RefreshCw className="w-5 h-5" /> Thử Lại
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 flex items-center justify-center gap-3 bg-card border border-border text-zinc-300 font-bold py-4 rounded-2xl"
          >
            <Home className="w-5 h-5" /> Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
