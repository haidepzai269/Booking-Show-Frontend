"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CopyX,
  Monitor,
  CheckCircle,
  Ticket,
  Loader2,
  Clock,
  Users,
  Eye,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import AuthModal from "@/components/auth/AuthModal";

interface Seat {
  id: number;
  showtime_id: number;
  seat_id: number;
  status: "AVAILABLE" | "LOCKED" | "BOOKED";
  price: number;
  // Join data from physical seat:
  room_id: number;
  row_char: string;
  seat_number: number;
  type: string;
}

interface Showtime {
  id: number;
  movie: {
    title: string;
    poster_url: string;
    duration: number;
  };
  room: {
    name: string;
    cinema: {
      name: string;
    };
  };
  start_time: string;
}

const SeatIcon = ({
  status,
  isSelected,
  seatNumber,
  isVip,
}: {
  status: "AVAILABLE" | "LOCKED" | "BOOKED";
  isSelected: boolean;
  seatNumber: number;
  isVip?: boolean;
}) => {
  let seatColor = "transparent";
  let strokeColor = "rgba(255, 255, 255, 0.2)";
  let glowClass = "";
  let iconOpacity = "opacity-100";

  if (isSelected) {
    strokeColor = "white";
    seatColor = "rgba(225, 9, 20, 0.9)";
    glowClass = "drop-shadow-[0_0_12px_rgba(229,9,20,0.8)]";
  } else if (status === "LOCKED") {
    // Ghế đang bị khóa bởi người khác - Màu Amber nổi bật
    strokeColor = "rgba(245, 158, 11, 0.8)";
    seatColor = "rgba(245, 158, 11, 0.2)";
    glowClass = "animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
  } else if (status === "BOOKED") {
    // Ghế đã bán - Màu Xám vô hiệu hóa
    strokeColor = "rgba(63, 63, 70, 0.4)";
    seatColor = "rgba(39, 39, 42, 0.8)";
    iconOpacity = "opacity-40";
  } else {
    // Ghế trống
    strokeColor = isVip ? "rgba(234, 179, 8, 0.6)" : "rgba(255, 255, 255, 0.2)";
    seatColor = isVip ? "rgba(234, 179, 8, 0.05)" : "rgba(255, 255, 255, 0.05)";
  }

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${isSelected ? "scale-110" : "hover:scale-105"} ${iconOpacity}`}
    >
      {/* Vip Badge Pulse */}
      {isVip && !isSelected && status === "AVAILABLE" && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
        </div>
      )}

      {/* Locked Badge */}
      {status === "LOCKED" && (
        <div className="absolute -top-1 -right-1 z-20">
          <Clock className="w-3 h-3 text-amber-500 animate-spin [animation-duration:3s]" />
        </div>
      )}

      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full transition-all duration-700 ${glowClass}`}
      >
        {/* Lưng ghế */}
        <path
          d="M8 12C8 9.79086 9.79086 8 12 8H28C30.2111 8 32 9.79086 32 12V24H8V12Z"
          fill={seatColor}
          stroke={strokeColor}
          strokeWidth={isSelected || isVip ? "2.5" : "1.5"}
          className="transition-colors duration-500"
        />
        {/* Đệm ngồi */}
        <path
          d="M6 24C6 21.7909 7.79086 20 10 20H30C32.2091 20 34 21.7909 34 24V28C34 31.3137 31.3137 34 28 34H12C8.68629 34 6 31.3137 6 28V24Z"
          fill={seatColor}
          stroke={strokeColor}
          strokeWidth={isSelected || isVip ? "2.5" : "1.5"}
          className="transition-colors duration-500"
        />
        {/* Tay vịn */}
        <rect
          x="4"
          y="20"
          width="4"
          height="10"
          rx="2"
          fill={seatColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        <rect
          x="32"
          y="20"
          width="4"
          height="10"
          rx="2"
          fill={seatColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-[10px] font-black transition-all duration-500 
        ${
          isSelected
            ? "text-white scale-110"
            : status === "BOOKED"
              ? "text-zinc-600"
              : status === "LOCKED"
                ? "text-amber-500/80"
                : isVip
                  ? "text-yellow-500/70"
                  : "text-zinc-500"
        }`}
      >
        {status === "BOOKED" ? (
          <X className="w-4 h-4 text-zinc-700" />
        ) : status === "LOCKED" ? (
          <span className="animate-pulse">...</span>
        ) : (
          seatNumber
        )}
      </span>
    </div>
  );
};

const ProgressStepper = ({ step }: { step: number }) => {
  const steps = ["1. Chọn Ghế", "2. Combo Bắp Nước", "3. Thanh Toán"];
  return (
    <div className="w-full bg-black/60 py-2 border-b border-white/5 flex justify-center gap-4 sm:gap-12">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i + 1 <= step ? "bg-primary text-white" : "bg-zinc-800 text-zinc-500 border border-zinc-700"}`}
          >
            {i + 1}
          </div>

          {i < steps.length - 1 && (
            <div className="hidden sm:block w-8 h-[1px] bg-zinc-800 ml-2"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function SeatSelection() {
  const params = useParams();
  const showtimeId = params.showtime_id as string;
  const router = useRouter();

  const { user } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Lấy danh sách Full Ghế & Thông tin suất chiếu
  useEffect(() => {
    if (!showtimeId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Seats
        const seatsRes = await apiClient.get<
          any,
          { success: boolean; data: Seat[] }
        >(`/showtimes/${showtimeId}/seats`);
        if (seatsRes.data) {
          setSeats(seatsRes.data);
        }

        // Fetch Showtime Details
        const showtimeRes = await apiClient.get<
          any,
          { success: boolean; data: Showtime }
        >(`/showtimes/${showtimeId}`);
        if (showtimeRes.data) {
          setShowtime(showtimeRes.data);
        }
      } catch (error) {
        console.error("Failed to load showtime data", error);
        setErrorMsg("Không thể tải thông tin suất chiếu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showtimeId]);

  // 2. Kết nối SSE để theo dõi ghế (Real-time update)
  useEffect(() => {
    if (!showtimeId) return;

    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/showtimes/${showtimeId}/seats/stream`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE Event Received:", data);

        // Update Local State dựa vào message từ backend
        setSeats((prevSeats) =>
          prevSeats.map((s) =>
            s.id === data.seat_id ? { ...s, status: data.status } : s,
          ),
        );

        // Nếu ghế đó đang được mình chọn mà lại bị khóa bởi người khác (hiếm xảy ra)
        if (
          data.status !== "AVAILABLE" &&
          selectedSeatIds.includes(data.seat_id)
        ) {
          setSelectedSeatIds((prev) =>
            prev.filter((id) => id !== data.seat_id),
          );
        }
      } catch (err) {
        console.error("Error parsing SSE data", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [showtimeId, selectedSeatIds]);

  // Toggle Seat Click
  const toggleSeat = (seat: Seat) => {
    if (seat.status !== "AVAILABLE") return; // Ko cho chọn ghế không trống
    setErrorMsg("");

    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id);
      } else {
        if (prev.length >= 8) {
          setErrorMsg("Chỉ được đặt tối đa 8 ghế một lần.");
          return prev;
        }
        return [...prev, seat.id];
      }
    });
  };

  // Tính tổng tiền
  const totalPrice = selectedSeatIds.reduce((sum, seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    return sum + (seat?.price || 0);
  }, 0);

  // Group theo Hàng (Row A, Row B,...)
  const seatGrid = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.row_char]) acc[seat.row_char] = [];
      acc[seat.row_char].push(seat);
      return acc;
    },
    {} as Record<string, Seat[]>,
  );

  // Sort các hàng A, B, C...
  const sortedRows = Object.keys(seatGrid).sort();

  // Handle Lock API
  const handleLockAndCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (selectedSeatIds.length === 0) return;

    setIsLocking(true);
    setErrorMsg("");

    try {
      const res = await apiClient.post<
        any,
        { success: boolean; error?: string; code?: string }
      >("/seats/lock", {
        showtime_id: parseInt(showtimeId),
        seat_ids: selectedSeatIds,
      });

      if (res.success) {
        // Khóa thành công, chuyển tới màn Thanh toán / Bắp nước
        // Truyền State ghế sang trang Checkout qua URL Hoặc Session (ở đây truyền ID via searchParams tạm)
        // Vì Backend đã lưu session Lock theo UserID, tới trang Order chỉ cần lấy lại danh sách ghế này.
        router.push(
          `/booking/checkout/${showtimeId}?seats=${selectedSeatIds.join(",")}`,
        );
      } else {
        setErrorMsg(
          res.error ||
            "Có lỗi xảy ra, có thể ghế đã bị người khác thao tác trước.",
        );
        // Nếu thất bại (409 Conflict), Backend sẽ báo ghế nào hỏng. Refresh lại trang cũng được
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setIsAuthModalOpen(true);
      } else {
        setErrorMsg(
          err.response?.data?.error || "Không thể khóa ghế. Vui lòng thử lại.",
        );
      }
    } finally {
      setIsLocking(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );

  return (
    <div className="w-full relative flex flex-col min-h-screen overflow-hidden selection:bg-primary/30">
      {/* IMMERSIVE BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-[#050505]"></div>
        {/* Radial Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1a0505_0%,_transparent_50%)] opacity-40"></div>
        {/* Mesh Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
        {/* Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.2] mix-blend-soft-light pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* MOVIE INFO HEADER (Minimal & Premium) */}
      <div className="w-full z-50 sticky top-0">
        <div className="w-full bg-black/40 border-b border-white/5 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-all border border-white/5 active:scale-95 group"
            >
              <CopyX className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors rotate-45" />
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-wider border border-primary/20">
                  Đang đặt vé
                </span>
                <h1 className="text-white font-black text-lg sm:text-2xl tracking-tight leading-none">
                  {showtime?.movie.title || "Đang tải..."}
                </h1>
              </div>
              <div className="flex items-center gap-3 text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em]">
                <span className="text-zinc-300">
                  {showtime?.room.cinema.name}
                </span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                <span>{showtime?.room.name}</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-primary" />
                  {showtime?.start_time
                    ? new Date(showtime.start_time).toLocaleString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--/--"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <ProgressStepper step={1} />
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-7xl mx-auto relative z-10 px-4 pt-4 pb-40 sm:pb-32">
        {/* MÀN HÌNH CONG (IMPROVED GLOW) & STATS */}
        <div className="w-full max-w-5xl mt-6 mb-12 sm:mb-20 relative flex flex-col items-center">
          <div className="w-full max-w-4xl flex flex-col items-center group">
            <div className="relative w-full">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-40 bg-primary/20 blur-[100px] rounded-[100%] opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
              <div className="w-full h-1.5 rounded-[50%] bg-zinc-100 shadow-[0_0_50px_rgba(255,255,255,0.8),0_0_20px_rgba(255,255,255,0.4)] relative z-10"></div>
            </div>
            <div className="text-zinc-500 font-black uppercase tracking-[0.8em] mt-6 flex items-center gap-3 text-[10px] opacity-50 group-hover:opacity-100 transition-all duration-700">
              Màn Hình
            </div>
          </div>
        </div>

        {/* LƯỚI GHẾ */}
        <div className="w-full max-w-7xl overflow-x-auto px-4 pb-12 select-none no-scrollbar">
          {seats.length === 0 ? (
            <div className="text-center text-zinc-500 py-20 flex flex-col items-center gap-4">
              <Ticket className="w-12 h-12 opacity-20" />
              <p>Chưa có dữ liệu ghế cho suất chiếu này.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 sm:gap-4 min-w-[max-content] mx-auto items-center pb-4 transition-all duration-500 md:scale-100 scale-[0.85] origin-top">
              {sortedRows.map((row) => {
                const rowSeats = (seatGrid[row] || []).sort(
                  (a, b) => a.seat_number - b.seat_number,
                );
                return (
                  <div
                    key={row}
                    className="flex items-center gap-1 sm:gap-4 group"
                  >
                    <div className="w-5 sm:w-8 text-center font-bold text-zinc-600 text-[9px] sm:text-xs group-hover:text-primary transition-colors">
                      {row}
                    </div>
                    <div className="flex gap-0.5 sm:gap-2">
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isLocked = seat.status === "LOCKED";
                        const isBooked = seat.status === "BOOKED";

                        return (
                          <button
                            key={seat.id}
                            disabled={isLocked || isBooked}
                            onClick={() => toggleSeat(seat)}
                            className="w-7 h-7 sm:w-11 sm:h-11 relative flex items-center justify-center transition-all duration-300 outline-none"
                            title={`Ghế ${row}${seat.seat_number} - ${seat.price.toLocaleString("vi-VN")}đ`}
                          >
                            <SeatIcon
                              status={seat.status}
                              isSelected={isSelected}
                              seatNumber={seat.seat_number}
                              isVip={seat.type === "VIP"}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <div className="w-5 sm:w-8 text-center font-bold text-zinc-600 text-[9px] sm:text-xs group-hover:text-primary transition-colors">
                      {row}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CHÚ THÍCH & HIỂN THỊ LỖI */}
        <div className="flex flex-wrap gap-4 sm:gap-8 justify-center items-center mb-6 sm:mb-12 text-[10px] sm:text-sm font-semibold tracking-wide uppercase text-zinc-500">
          <div className="flex gap-2 items-center">
            <div className="w-5 h-5 flex items-center justify-center text-zinc-600">
              <SeatIcon
                status="AVAILABLE"
                isSelected={false}
                seatNumber={0}
                isVip={false}
              />
            </div>
            Thường
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-5 h-5 flex items-center justify-center text-yellow-500">
              <SeatIcon
                status="AVAILABLE"
                isSelected={false}
                seatNumber={0}
                isVip={true}
              />
            </div>
            VIP
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-5 h-5 flex items-center justify-center text-white">
              <SeatIcon status="AVAILABLE" isSelected={true} seatNumber={0} />
            </div>
            Đang chọn
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-5 h-5 flex items-center justify-center text-amber-500">
              <SeatIcon status="LOCKED" isSelected={false} seatNumber={0} />
            </div>
            Đang giữ
          </div>
          <div className="flex gap-2 items-center opacity-60">
            <div className="w-5 h-5 flex items-center justify-center">
              <SeatIcon status="BOOKED" isSelected={false} seatNumber={0} />
            </div>
            Đã bán
          </div>
        </div>

        {errorMsg && (
          <div className="text-red-500 bg-red-500/10 px-6 py-3 rounded-lg font-bold mb-4 flex items-center gap-2">
            <CopyX className="w-5 h-5" /> {errorMsg}
          </div>
        )}

        {/* BOTTOM ACTION BAR STICKY */}
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/50 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
              <div className="text-zinc-500 text-[10px] sm:text-xs mb-1 uppercase font-bold tracking-widest">
                Ghế đã chọn
              </div>
              <div className="text-zinc-100 font-bold text-sm sm:text-lg flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 max-h-12 overflow-y-auto no-scrollbar">
                {selectedSeatIds.length === 0
                  ? "—"
                  : selectedSeatIds
                      .map((id) => {
                        const s = seats.find((x) => x.id === id);
                        return s ? `${s.row_char}${s.seat_number}` : "";
                      })
                      .join(", ")}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-zinc-800">
              <div className="text-left sm:text-right">
                <div className="text-zinc-500 text-[10px] sm:text-xs mb-1 uppercase font-bold tracking-widest">
                  Tổng cộng
                </div>
                <div className="text-primary font-black text-xl sm:text-3xl flex items-baseline gap-1">
                  {totalPrice.toLocaleString("vi-VN")}{" "}
                  <span className="text-[10px] sm:text-sm font-bold opacity-80 uppercase">
                    VNĐ
                  </span>
                </div>
              </div>

              <button
                disabled={selectedSeatIds.length === 0 || isLocking}
                onClick={handleLockAndCheckout}
                className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 rounded-lg sm:rounded-xl font-black text-sm sm:text-lg transition-all active:scale-95 flex-1 sm:flex-none
                ${
                  selectedSeatIds.length === 0
                    ? "bg-zinc-800 text-zinc-600 border border-zinc-700/50 cursor-not-allowed"
                    : "bg-primary hover:bg-rose-700 text-white shadow-[0_10px_30px_rgba(229,9,20,0.4)]"
                }`}
              >
                {isLocking ? (
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="whitespace-nowrap">Tiếp Tục</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </div>
  );
}
