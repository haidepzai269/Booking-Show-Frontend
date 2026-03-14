"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

// Components
import UrgencyBanner from "@/components/checkout/UrgencyBanner";
import StepIndicator from "@/components/checkout/StepIndicator";
import ConcessionStep from "@/components/checkout/ConcessionStep";
import VoucherStep from "@/components/checkout/VoucherStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Concession {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
}

interface SeatInfo {
  id: number;
  row_char: string;
  seat_number: number;
  price: number;
  type: string;
}

interface ShowtimeInfo {
  movie_title: string;
  poster_url?: string;
  cinema_name: string;
  room_name: string;
  start_time: string;
}

interface PromotionPreview {
  promotion_id: number;
  code: string;
  description: string;
  discount_amount: number;
  final_amount: number;
}

type Gateway = "VNPAY" | "ZALOPAY" | "PAYOS";
type Step = 1 | 2 | 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DEFAULT_EXPIRES_AT = new Date(Date.now() + 10 * 60 * 1000).toISOString();

function CheckoutContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const showtimeId = params.showtime_id as string;
  const seatIdsParam = searchParams.get("seats"); // lần đầu vào từ seat-selection
  const orderIdParam = searchParams.get("order_id"); // tiếp tục từ orders/my

  const { user } = useAuthStore();

  // ─── State ───────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Data từ query params + API
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [seatDetails, setSeatDetails] = useState<SeatInfo[]>([]);
  const [showtimeInfo, setShowtimeInfo] = useState<ShowtimeInfo | null>(null);
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [expiresAt, setExpiresAt] = useState<string>(DEFAULT_EXPIRES_AT);

  // Loading states
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingConcessions, setLoadingConcessions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Concession cart
  const [cartConcessions, setCartConcessions] = useState<
    Record<number, number>
  >({});

  // Voucher
  const [promotionPreview, setPromotionPreview] =
    useState<PromotionPreview | null>(null);

  // ─── Computed values ─────────────────────────────────────────────────────
  const seatTotal = seatDetails.reduce((sum, s) => sum + s.price, 0);

  const concessionItems = Object.entries(cartConcessions)
    .filter(([, qty]) => qty > 0)
    .map(([cId, qty]) => {
      const c = concessions.find((x) => x.id === parseInt(cId))!;
      return {
        id: parseInt(cId),
        name: c?.name || "",
        price: c?.price || 0,
        quantity: qty,
      };
    });

  const concessionTotal = concessionItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const originalAmount = seatTotal + concessionTotal;
  const discountAmount = promotionPreview?.discount_amount || 0;
  const finalAmount = Math.max(0, originalAmount - discountAmount);

  // ─── Guard: chỉ khởi tạo đúng 1 lần dù user object thay đổi reference ─────
  const hasInitialized = useRef(false);

  // ─── Khởi tạo: Tạo Order ngay hoặc Load Order cũ ─────────────────────────
  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    // 🛡️ Chặn chạy lại nếu đã init rồi (tránh tạo order duplicate khi user ref thay đổi)
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      setLoadingInit(true);
      try {
        if (orderIdParam) {
          // === Tiếp tục từ orders/my: Load order cũ ===
          const orderRes = await apiClient.get<
            any,
            { success: boolean; data: any }
          >(`/orders/${orderIdParam}`);
          if (!orderRes.success || !orderRes.data) {
            router.push("/orders/my");
            return;
          }
          const order = orderRes.data;
          setOrderId(order.id);
          setExpiresAt(order.expires_at || DEFAULT_EXPIRES_AT);

          // Load thông tin showtime
          const stId = order.showtime?.id || order.showtime_id;
          if (stId) {
            const [seatsRes, stRes] = await Promise.all([
              apiClient.get<any, { success: boolean; data: any[] }>(
                `/showtimes/${stId}/seats`,
              ),
              apiClient.get<any, { success: boolean; data: any }>(
                `/showtimes/${stId}`,
              ),
            ]);

            // Lấy seat IDs từ order_seats trong order
            const orderSeatIds: number[] = (order.order_seats || []).map(
              (os: any) => os.showtime_seat_id,
            );
            setSelectedSeatIds(orderSeatIds);

            if (seatsRes.data) {
              const relevantSeats = seatsRes.data.filter((s: any) =>
                orderSeatIds.includes(s.id),
              );
              setSeatDetails(
                relevantSeats.map((s: any) => ({
                  id: s.id,
                  row_char: s.row_char,
                  seat_number: s.seat_number,
                  price: s.price,
                  type: s.type,
                })),
              );
            }
            if (stRes.data) {
              const st = stRes.data;
              setShowtimeInfo({
                movie_title: st.movie?.title || "Phim",
                poster_url: st.movie?.poster_url,
                cinema_name: st.room?.cinema?.name || "",
                room_name: st.room?.name || "",
                start_time: st.start_time,
              });
            }
          }
        } else if (seatIdsParam) {
          // === Lần đầu từ seat-selection: Tạo Order mới ngay ===
          const ids = seatIdsParam
            .split(",")
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id));
          setSelectedSeatIds(ids);

          // Load thông tin showtime + seat details song song
          const [seatsRes, stRes] = await Promise.all([
            apiClient.get<any, { success: boolean; data: any[] }>(
              `/showtimes/${showtimeId}/seats`,
            ),
            apiClient.get<any, { success: boolean; data: any }>(
              `/showtimes/${showtimeId}`,
            ),
          ]);

          if (seatsRes.data) {
            const relevantSeats = seatsRes.data.filter((s: any) =>
              ids.includes(s.id),
            );
            setSeatDetails(
              relevantSeats.map((s: any) => ({
                id: s.id,
                row_char: s.row_char,
                seat_number: s.seat_number,
                price: s.price,
                type: s.type,
              })),
            );
          }
          if (stRes.data) {
            const st = stRes.data;
            setShowtimeInfo({
              movie_title: st.movie?.title || "Phim",
              poster_url: st.movie?.poster_url,
              cinema_name: st.room?.cinema?.name || "",
              room_name: st.room?.name || "",
              start_time: st.start_time,
            });
          }

          // Tạo Order ngay trong DB — không có concessions/voucher ở bước này
          const orderRes = await apiClient.post<
            any,
            { success: boolean; data?: any; error?: string }
          >("/orders", {
            showtime_id: parseInt(showtimeId),
            showtime_seat_ids: ids,
            concession_items: [],
          });

          if (orderRes.success && orderRes.data?.id) {
            const newOrderId = orderRes.data.id;
            setOrderId(newOrderId);
            setExpiresAt(orderRes.data.expires_at || DEFAULT_EXPIRES_AT);

            // ✅ Cập nhật URL: chuyển từ ?seats= sang ?order_id=
            // Việc này giúp khi refresh trang, logic sẽ rơi vào nhánh "Load Order cũ" thay vì tạo tiếp đơn mới
            router.replace(
              `/booking/checkout/${showtimeId}?order_id=${newOrderId}`,
              { scroll: false },
            );
          } else {
            setGlobalError(
              orderRes.error ||
                "Không thể tạo đơn hàng. Ghế có thể đã hết hoặc phiên đã hết hạn.",
            );
          }
        } else {
          // Không có params → về trang chủ
          router.push("/");
        }
      } catch (err: any) {
        setGlobalError(
          err.response?.data?.error ||
            "Đã có lỗi xảy ra khi khởi tạo đơn hàng.",
        );
      } finally {
        setLoadingInit(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ─── Cancel order khi user rời trang qua browser back/close (không qua nút) ─
  useEffect(() => {
    if (!orderId || orderIdParam) return; // Không cancel nếu là load order cũ
    const handleBeforeUnload = () => {
      // sendBeacon đảm bảo request được gửi ngay cả khi tab đóng
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/orders/${orderId}/cancel`,
      );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [orderId, orderIdParam]);

  // Fetch danh sách concessions
  useEffect(() => {
    apiClient
      .get<any, { success: boolean; data: Concession[] }>("/concessions/")
      .then((res) => {
        if (res.data) setConcessions(res.data);
      })
      .catch(console.error)
      .finally(() => setLoadingConcessions(false));
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleQuantityChange = useCallback((cId: number, diff: number) => {
    setCartConcessions((prev) => {
      const current = prev[cId] || 0;
      const next = Math.max(0, Math.min(10, current + diff));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[cId];
        return copy;
      }
      return { ...prev, [cId]: next };
    });
  }, []);

  // Step 1 → Step 2: Lưu concession vào order đang PENDING
  const handleConcessionNext = useCallback(async () => {
    if (!orderId) {
      setCurrentStep(2);
      return;
    }
    try {
      const items = Object.entries(cartConcessions).map(([id, qty]) => ({
        concession_id: parseInt(id),
        quantity: qty,
      }));
      await apiClient.put(`/orders/${orderId}/concessions`, { items });
    } catch {
      // Bỏ qua lỗi — không block user
    }
    setCurrentStep(2);
  }, [orderId, cartConcessions]);

  // Step 2: Áp dụng voucher lên order
  const handleVoucherApplied = useCallback(
    async (preview: PromotionPreview | null) => {
      setPromotionPreview(preview);
      if (!orderId) return;
      try {
        const res = await apiClient.put<any, { success: boolean; data?: any }>(
          `/orders/${orderId}/voucher`,
          {
            code: preview?.code || "",
          },
        );
        // Cập nhật final_amount từ backend nếu có
        if (res.success && res.data) {
          const updated = res.data;
          if (updated.discount_amount !== undefined) {
            setPromotionPreview(
              preview
                ? {
                    ...preview,
                    discount_amount: updated.discount_amount,
                    final_amount: updated.final_amount,
                  }
                : null,
            );
          }
        }
      } catch {
        // Bỏ qua lỗi — promotionPreview local vẫn đúng
      }
    },
    [orderId],
  );

  // Step 3: Khởi tạo thanh toán
  const handleCheckout = async (gateway: Gateway) => {
    if (!orderId) {
      setGlobalError("Không tìm thấy đơn hàng. Vui lòng thử lại.");
      return;
    }
    setIsSubmitting(true);
    setGlobalError("");

    try {
      const payRes = await apiClient.post<
        any,
        { success: boolean; data?: any; error?: string }
      >("/payments/initiate", {
        order_id: orderId,
        gateway,
      });

      if (payRes.success && payRes.data?.payment_url) {
        window.location.href = payRes.data.payment_url;
      } else {
        setGlobalError(payRes.error || "Không nhận được URL thanh toán.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setGlobalError(
        err.response?.data?.error || "Đã có lỗi xảy ra. Vui lòng thử lại.",
      );
      setIsSubmitting(false);
    }
  };

  // Hủy đặt vé — cancel order nếu đã tạo, về trang chọn ghế
  const handleCancelAndGoBack = useCallback(async () => {
    if (orderId) {
      try {
        await apiClient.post(`/orders/${orderId}/cancel`, {});
      } catch {
        // Bỏ qua lỗi
      }
    }
    router.push(`/booking/seat-selection/${showtimeId}`);
  }, [orderId, showtimeId, router]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loadingInit) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Đang khởi tạo đơn hàng...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      {/* URGENCY BANNER + STEP INDICATOR (sticky dưới nhau) */}
      <div className="sticky top-0 z-50 flex flex-col">
        <UrgencyBanner
          expiresAt={expiresAt}
          showtimeId={showtimeId}
          orderId={orderId}
          onExpire={() => router.push(`/booking/seat-selection/${showtimeId}`)}
        />
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32 lg:pb-16">
        {globalError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 rounded-2xl text-red-400 text-sm font-semibold">
            {globalError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — Step Content (8/12 col) */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              {/* STEP 1 */}
              {currentStep === 1 && (
                <ConcessionStep
                  concessions={concessions}
                  cartConcessions={cartConcessions}
                  onQuantityChange={handleQuantityChange}
                  isLoading={loadingConcessions}
                  onSkip={handleConcessionNext}
                  onNext={handleConcessionNext}
                />
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <VoucherStep
                  orderValue={originalAmount}
                  onVoucherApplied={handleVoucherApplied}
                  promotionPreview={promotionPreview}
                  onBack={() => setCurrentStep(1)}
                  onNext={() => setCurrentStep(3)}
                />
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <PaymentStep
                  finalAmount={finalAmount}
                  onBack={() => setCurrentStep(2)}
                  onPay={handleCheckout}
                  isSubmitting={isSubmitting}
                  globalError={globalError}
                />
              )}
            </div>

            {/* Nút Hủy Đặt Vé */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-zinc-600 text-xs">
                Thông tin thanh toán được bảo mật và mã hóa SSL 256-bit 🔒
              </p>
              <button
                onClick={handleCancelAndGoBack}
                className="text-xs text-zinc-500 hover:text-rose-400 transition-colors underline underline-offset-2 flex-shrink-0 ml-4"
              >
                Hủy đặt vé &amp; chọn lại ghế
              </button>
            </div>
          </div>

          {/* RIGHT — Order Summary (4/12 col) */}
          <div className="lg:col-span-1">
            <OrderSummaryCard
              showtime={showtimeInfo}
              seats={seatDetails}
              concessionItems={concessionItems}
              promotionPreview={promotionPreview}
              seatTotal={seatTotal}
              concessionTotal={concessionTotal}
              discountAmount={discountAmount}
              finalAmount={finalAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function Checkout() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
