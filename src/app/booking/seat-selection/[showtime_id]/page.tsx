"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CopyX,
  CheckCircle,
  Ticket,
  Loader2,
  Clock,
  X,
  Plus,
  Minus,
  Maximize,
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
  locked_until?: string; // ISO string từ backend
  // Join data from physical seat:
  room_id: number;
  row_char: string;
  seat_number: number;
  type: string;
  x?: number;
  y?: number;
  angle?: number;
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
    strokeColor = "rgba(245, 158, 11, 0.8)";
    seatColor = "rgba(245, 158, 11, 0.2)";
    glowClass = "animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
  } else if (status === "BOOKED") {
    strokeColor = "rgba(63, 63, 70, 0.4)";
    seatColor = "rgba(39, 39, 42, 0.8)";
    iconOpacity = "opacity-40";
  } else {
    strokeColor = isVip ? "rgba(234, 179, 8, 0.6)" : "rgba(255, 255, 255, 0.2)";
    seatColor = isVip ? "rgba(234, 179, 8, 0.05)" : "rgba(255, 255, 255, 0.05)";
  }

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${isSelected ? "scale-110" : "hover:scale-105"} ${iconOpacity}`}
    >
      {isVip && !isSelected && status === "AVAILABLE" && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
        </div>
      )}

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
        <path
          d="M8 12C8 9.79086 9.79086 8 12 8H28C30.2111 8 32 9.79086 32 12V24H8V12Z"
          fill={seatColor}
          stroke={strokeColor}
          strokeWidth={isSelected || isVip ? "2.5" : "1.5"}
          className="transition-colors duration-500"
        />
        <path
          d="M6 24C6 21.7909 7.79086 20 10 20H30C32.2091 20 34 21.7909 34 24V28C34 31.3137 31.3137 34 28 34H12C8.68629 34 6 31.3137 6 28V24Z"
          fill={seatColor}
          stroke={strokeColor}
          strokeWidth={isSelected || isVip ? "2.5" : "1.5"}
          className="transition-colors duration-500"
        />
        <rect x="4" y="20" width="4" height="10" rx="2" fill={seatColor} stroke={strokeColor} strokeWidth="1.5" />
        <rect x="32" y="20" width="4" height="10" rx="2" fill={seatColor} stroke={strokeColor} strokeWidth="1.5" />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-[10px] font-black transition-all duration-500 
        ${
          isSelected ? "text-white scale-110" : 
          status === "BOOKED" ? "text-zinc-600" : 
          status === "LOCKED" ? "text-amber-500/80" : 
          isVip ? "text-yellow-500/70" : "text-zinc-500"
        }`}
      >
        {status === "BOOKED" ? <X className="w-4 h-4 text-zinc-700" /> : status === "LOCKED" ? <span className="animate-pulse">...</span> : seatNumber}
      </span>
    </div>
  );
};

// SVG-native version of SeatIcon specifically for SvgLayout (solving hit-box issues in 3D)
const SeatIconPureSvg = ({
  status,
  isSelected,
  seatNumber,
  isVip,
  onClick,
}: {
  status: "AVAILABLE" | "LOCKED" | "BOOKED";
  isSelected: boolean;
  seatNumber: number;
  isVip?: boolean;
  onClick?: () => void;
}) => {
  let seatColor = "transparent";
  let strokeColor = "rgba(255, 255, 255, 0.2)";
  let glowClass = "";
  let iconOpacity = 1;

  if (isSelected) {
    strokeColor = "white";
    seatColor = "rgba(225, 9, 20, 0.9)";
    glowClass = "drop-shadow(0 0 12px rgba(229,9,20,0.8))";
  } else if (status === "LOCKED") {
    strokeColor = "rgba(245, 158, 11, 0.8)";
    seatColor = "rgba(245, 158, 11, 0.2)";
    glowClass = "drop-shadow(0 0 8px rgba(245,158,11,0.5))";
  } else if (status === "BOOKED") {
    strokeColor = "rgba(63, 63, 70, 0.4)";
    seatColor = "rgba(39, 39, 42, 0.8)";
    iconOpacity = 0.4;
  } else {
    strokeColor = isVip ? "rgba(234, 179, 8, 0.6)" : "rgba(255, 255, 255, 0.2)";
    seatColor = isVip ? "rgba(234, 179, 8, 0.05)" : "rgba(255, 255, 255, 0.05)";
  }

  const textColor = isSelected ? "white" : 
                    status === "BOOKED" ? "#3f3f46" : 
                    status === "LOCKED" ? "#f59e0b" : 
                    isVip ? "#eab308" : "#71717a";

  return (
    <g 
      className={`cursor-pointer transition-all duration-300 ${isSelected ? "scale-110" : "hover:scale-105"}`}
      style={{ opacity: iconOpacity, filter: glowClass }}
      onClick={onClick}
    >
      {/* Invisible larger hit-box area to make clicking easier */}
      <rect x="-20" y="-20" width="40" height="40" fill="transparent" />
      
      {/* Lưng ghế */}
      <path
        d="M-12 -12C-12 -14.2 -10.2 -16 -8 -16H8C10.2 -16 12 -14.2 12 -12V0H-12V-12Z"
        fill={seatColor}
        stroke={strokeColor}
        strokeWidth={isSelected || isVip ? "2.5" : "1.5"}
      />
      {/* Đệm ngồi */}
      <path
        d="M-14 0C-14 -2.2 -12.2 -4 -10 -4H10C12.2 -4 14 -2.2 14 0V4C14 7.3 11.3 10 8 10H-8C-11.3 10 -14 7.3 -14 4V0Z"
        fill={seatColor}
        stroke={strokeColor}
        strokeWidth={isSelected || isVip ? "2.5" : "1.5"}
      />
      {/* Tay vịn */}
      <rect x="-16" y="0" width="4" height="10" rx="2" fill={seatColor} stroke={strokeColor} strokeWidth="1.5" />
      <rect x="12" y="0" width="4" height="10" rx="2" fill={seatColor} stroke={strokeColor} strokeWidth="1.5" />
      
      {/* Seat Number */}
      <text
        x="0"
        y="3"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        style={{ fontSize: "10px", fontWeight: "900", pointerEvents: "none" }}
      >
        {status === "BOOKED" ? "X" : status === "LOCKED" ? "..." : seatNumber}
      </text>

      {/* Vip / Locked Badge */}
      {isVip && !isSelected && status === "AVAILABLE" && (
          <circle cx="16" cy="-16" r="3" fill="#eab308">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
      )}
      {status === "LOCKED" && (
          <g transform="translate(14, -14)">
            <circle r="4" fill="#f59e0b" opacity="0.2" />
            <path d="M-2 0 L0 2 L2 -2" fill="none" stroke="#f59e0b" strokeWidth="1" />
          </g>
      )}
    </g>
  );
};


const SeatSelectionSkeleton = () => {
  return (
    <div className="w-full relative flex flex-col min-h-screen pb-32 overflow-hidden selection:bg-primary/30">
      {/* IMMERSIVE BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#050505]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1a0505_0%,_transparent_50%)] opacity-40"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
        <div className="absolute inset-0 opacity-[0.2] mix-blend-soft-light pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="absolute inset-y-0 left-0 w-24 sm:w-64 bg-gradient-to-r from-red-950/40 via-red-900/10 to-transparent z-0 pointer-events-none hidden md:block">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.3) 21px, rgba(0,0,0,0.3) 40px)' }}></div>
        </div>
        <div className="absolute inset-y-0 right-0 w-24 sm:w-64 bg-gradient-to-l from-red-950/40 via-red-900/10 to-transparent z-0 pointer-events-none hidden md:block">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(-90deg, transparent, transparent 20px, rgba(0,0,0,0.3) 21px, rgba(0,0,0,0.3) 40px)' }}></div>
        </div>
      </div>

      {/* HEADER SKELETON */}
      <div className="w-full z-50 sticky top-0">
        <div className="w-full bg-black/40 border-b border-white/5 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
            <div className="p-2.5 rounded-xl border border-white/5 w-10 h-10 bg-white/5 animate-pulse" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-20 h-5 bg-primary/20 rounded-md animate-pulse" />
                <div className="w-48 sm:w-64 h-6 sm:h-8 bg-white/10 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-24 h-3 bg-white/5 rounded-full animate-pulse shrink-0" />
                <span className="w-1 h-1 bg-zinc-800 rounded-full shrink-0" />
                <div className="w-20 h-3 bg-white/5 rounded-full animate-pulse shrink-0" />
                <span className="w-1 h-1 bg-zinc-800 rounded-full shrink-0" />
                <div className="w-32 h-3 bg-white/5 rounded-full animate-pulse shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-7xl mx-auto relative z-10 px-4 pt-4 pb-40 sm:pb-32">
        {/* SCREEN SKELETON */}
        <div className="w-full max-w-5xl mt-8 mb-16 sm:mb-24 relative flex flex-col items-center group">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[140%] h-[300px] bg-gradient-to-b from-white/5 via-white/5 to-transparent blur-[120px] rounded-full opacity-20 pointer-events-none animate-pulse"></div>
          <div className="w-full max-w-4xl flex flex-col items-center relative">
            <div className="relative w-full h-[150px] overflow-hidden flex flex-col items-center opacity-70">
                <div className="w-[120%] h-[300px] border-[12px] border-zinc-800/60 rounded-[100%] absolute -top-[260px] bg-white/5 backdrop-blur-sm"></div>
                <div className="mt-16 flex flex-col items-center gap-2">
                  <div className="w-32 h-3 bg-white/10 rounded-full animate-pulse" />
                  <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
                </div>
            </div>
          </div>
        </div>

        {/* SEATS SKELETON */}
        <div className="w-full max-w-7xl px-4 flex flex-col items-center justify-center gap-2 sm:gap-5 min-w-[max-content] mx-auto pb-4">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row, rowIndex) => (
            <div 
              key={row} 
              className="flex items-center gap-2 sm:gap-6" 
              style={{ opacity: 1 - rowIndex * 0.05 }}
            >
              <div className="w-6 sm:w-10 text-center text-zinc-800 font-black text-[10px] sm:text-sm">{row}</div>
              <div className="flex gap-1 sm:gap-3">
                {Array.from({ length: 12 }).map((_, seatIndex) => (
                  <div 
                    key={seatIndex} 
                    className="w-8 h-8 sm:w-12 sm:h-12 relative flex items-center justify-center"
                  >
                     <div 
                        className="w-[70%] h-[80%] border border-white/10 rounded-t-lg rounded-b-sm animate-pulse bg-white/5 shadow-inner"
                        style={{ animationDelay: `${(rowIndex * 12 + seatIndex) * 0.03}s` }}
                     />
                  </div>
                ))}
              </div>
              <div className="w-6 sm:w-10 text-center text-zinc-800 font-black text-[10px] sm:text-sm">{row}</div>
            </div>
          ))}
        </div>

        {/* LEGEND SKELETON */}
        <div className="flex flex-wrap gap-4 sm:gap-8 justify-center items-center mt-12 mb-6 sm:mb-12">
            {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex gap-2 items-center">
                  <div className="w-5 h-5 rounded-full bg-white/5 animate-pulse" />
                  <div className="w-16 h-3 rounded-full bg-white/5 animate-pulse" />
               </div>
            ))}
        </div>
      </div>
      
      {/* BOTTOM ACTION BAR SKELETON */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-[150] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
          <div className="flex flex-col items-center sm:items-start w-full sm:w-auto gap-1">
            <div className="w-20 h-2 sm:h-3 rounded-full bg-white/5 animate-pulse" />
            <div className="w-32 h-5 sm:h-7 rounded-md bg-white/5 animate-pulse" />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
             <div className="flex flex-col gap-1 items-start sm:items-end w-full sm:w-auto">
                <div className="w-20 h-2 sm:h-3 rounded-full bg-white/5 animate-pulse" />
                <div className="w-32 sm:w-40 h-6 sm:h-8 rounded-md bg-white/5 animate-pulse" />
             </div>
             <div className="hidden sm:block w-full sm:w-40 h-10 sm:h-12 rounded-full bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
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
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Lấy danh sách Full Ghế & Thông tin suất chiếu
  useEffect(() => {
    if (!showtimeId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Seats
        const seatsRes = await apiClient.get<
          void,
          { success: boolean; data: Seat[] }
        >(`/showtimes/${showtimeId}/seats`);
        if (seatsRes.data) {
          setSeats(seatsRes.data);
        }

        // Fetch Showtime Details
        const showtimeRes = await apiClient.get<
          void,
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
            s.id === data.seat_id 
              ? { ...s, status: data.status, locked_until: data.status === "AVAILABLE" ? undefined : s.locked_until } 
              : s,
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

  // 3. Định kỳ Re-render để cập nhật trạng thái "Hết hạn" trên UI (mỗi 30s)
  useEffect(() => {
    const timer = setInterval(() => {
      // Chỉ cần set lại một state bất kỳ để trigger re-render
      setSeats((prev) => [...prev]);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

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
        { showtime_id: number; seat_ids: number[] },
        { success: boolean; error?: string; code?: string }
      >("/seats/lock", {
        showtime_id: parseInt(showtimeId),
        seat_ids: selectedSeatIds,
      });

      if (res.success) {
        router.push(
          `/booking/checkout/${showtimeId}?seats=${selectedSeatIds.join(",")}`,
        );
      } else {
        setErrorMsg(
          res.error ||
            "Có lỗi xảy ra, có thể ghế đã bị người khác thao tác trước.",
        );
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      if (error.response?.status === 401) {
        setIsAuthModalOpen(true);
      } else {
        setErrorMsg(
          error.response?.data?.error || "Không thể khóa ghế. Vui lòng thử lại.",
        );
      }
    } finally {
      setIsLocking(false);
    }
  };

  const isSvgLayout = seats.length > 0 && seats.some((s) => s.x && s.x !== 0);

  const calculateViewBox = (seats: Seat[]) => {
    if (!isSvgLayout) return "0 0 1000 800";
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;
    seats.forEach((seat) => {
      if (seat.x! < minX) minX = seat.x!;
      if (seat.y! < minY) minY = seat.y!;
      if (seat.x! > maxX) maxX = seat.x!;
      if (seat.y! > maxY) maxY = seat.y!;
    });
    const padding = 60;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    return `${minX - padding} ${minY - padding} ${width} ${height}`;
  };

  if (!isMounted || loading)
    return <SeatSelectionSkeleton />;

  return (
    <div className="w-full relative flex flex-col min-h-screen pb-32 overflow-hidden selection:bg-primary/30">
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
        
        {/* THEATER CURTAINS (Decorative) */}
        <div className="absolute inset-y-0 left-0 w-24 sm:w-64 bg-gradient-to-r from-red-950/40 via-red-900/10 to-transparent z-0 pointer-events-none hidden md:block">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.3) 21px, rgba(0,0,0,0.3) 40px)' }}></div>
        </div>
        <div className="absolute inset-y-0 right-0 w-24 sm:w-64 bg-gradient-to-l from-red-950/40 via-red-900/10 to-transparent z-0 pointer-events-none hidden md:block">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(-90deg, transparent, transparent 20px, rgba(0,0,0,0.3) 21px, rgba(0,0,0,0.3) 40px)' }}></div>
        </div>
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
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-7xl mx-auto relative z-10 px-4 pt-4 pb-40 sm:pb-32">
        {/* MÀN HÌNH CONG (CINEMA SCREEN WITH INTENSE GLOW) */}
        <div className="w-full max-w-5xl mt-8 mb-16 sm:mb-24 relative flex flex-col items-center group">
          {/* Ambient Light from Screen */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[140%] h-[300px] bg-gradient-to-b from-white/10 via-white/5 to-transparent blur-[120px] rounded-full opacity-30 pointer-events-none"></div>
          
          <div className="w-full max-w-4xl flex flex-col items-center relative">
            {/* The Curve Screen */}
            <div className="relative w-full h-[150px] overflow-hidden flex flex-col items-center">
                <div className="w-[120%] h-[300px] border-[12px] border-zinc-200/90 rounded-[100%] absolute -top-[260px] shadow-[0_30px_100px_rgba(255,255,255,0.4),0_10px_30px_rgba(255,255,255,0.2)] bg-white/5 backdrop-blur-sm"></div>
                
                {/* Visual "Màn Hình" text with glow */}
                <div className="mt-16 relative flex flex-col items-center gap-2">
                  <div className="text-zinc-200 font-black uppercase tracking-[1.5em] text-[10px] sm:text-xs drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse">
                    MÀN HÌNH
                  </div>
                  <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>
                </div>
            </div>
          </div>
        </div>

        <div 
          className="w-full max-w-7xl px-4 select-none no-scrollbar overflow-visible transition-all duration-500"
          style={{ 
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top center",
            marginBottom: `${(zoomLevel - 1) * 400}px` // Add margin to prevent overlap when zoomed in
          }}
          suppressHydrationWarning
        >
          <div 
            className="w-full transition-all duration-1000 ease-out flex flex-col items-center"
            style={{ 
              transform: "rotateX(0deg) translateY(0px)",
              transformOrigin: "center top"
            }}
          >
            {seats.length === 0 ? (
              <div className="text-center text-zinc-500 py-20 flex flex-col items-center gap-4">
                <Ticket className="w-12 h-12 opacity-20" />
                <p>Chưa có dữ liệu ghế cho suất chiếu này.</p>
              </div>
            ) : isSvgLayout ? (
              <div className="w-full flex justify-center pb-4 transition-all duration-500 origin-top overflow-visible">
                <svg
                  viewBox={calculateViewBox(seats)}
                  className="w-full max-w-[800px] h-auto overflow-visible cursor-grab active:cursor-grabbing drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                    {seats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isExpired = seat.locked_until && new Date(seat.locked_until) < new Date();
                      const isLocked = seat.status === "LOCKED" && !isExpired;
                      const isBooked = seat.status === "BOOKED";

                      return (
                        <g
                          key={seat.id}
                          transform={`translate(${seat.x}, ${seat.y}) rotate(${seat.angle || 0})`}
                        >
                          <SeatIconPureSvg
                            status={isLocked ? "LOCKED" : isBooked ? "BOOKED" : "AVAILABLE"}
                            isSelected={isSelected}
                            seatNumber={seat.seat_number}
                            isVip={seat.type === "VIP"}
                            onClick={!(isLocked || isBooked) ? () => toggleSeat(seat) : undefined}
                          />
                          {/* Reflection on seat base */}
                          {isSelected && (
                            <ellipse 
                              cx="0" cy="12" rx="8" ry="2" 
                              fill="rgba(225, 9, 20, 0.4)" 
                              style={{ filter: "blur(4px)" }} 
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
            ) : (
              <div 
                className="flex flex-col gap-2 sm:gap-5 min-w-[max-content] mx-auto items-center pb-4 transition-all duration-500 md:scale-100 scale-[0.85] origin-top"
                style={{ transformStyle: "preserve-3d" }}
              >
                {sortedRows.map((row, rowIndex) => {
                  const rowSeats = (seatGrid[row] || []).sort(
                    (a, b) => a.seat_number - b.seat_number,
                  );
                  // Dynamic row perspective (hàng ở xa nhỏ hơn/mờ hơn nhẹ)
                  const rowOpacity = 1 - (rowIndex * 0.02);
                  
                  return (
                    <div
                      key={row}
                      className="flex items-center gap-2 sm:gap-6 group"
                      style={{ 
                        opacity: rowOpacity,
                        transform: `translateZ(${rowIndex * -5}px)` 
                      }}
                    >
                      <div className="w-6 sm:w-10 text-center font-black text-zinc-700 text-[10px] sm:text-sm group-hover:text-primary transition-colors tracking-tighter">
                        {row}
                      </div>
                      <div className="flex gap-1 sm:gap-3">
                        {rowSeats.map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isExpired = seat.locked_until && new Date(seat.locked_until) < new Date();
                          const isLocked = seat.status === "LOCKED" && !isExpired;
                          const isBooked = seat.status === "BOOKED";

                          return (
                            <button
                              key={seat.id}
                              disabled={isLocked || isBooked}
                              onClick={() => toggleSeat(seat)}
                              className="w-8 h-8 sm:w-12 sm:h-12 relative flex items-center justify-center transition-all duration-300 outline-none hover:z-50"
                              title={`Ghế ${row}${seat.seat_number} - ${seat.price.toLocaleString("vi-VN")}đ`}
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              <SeatIcon
                                status={isLocked ? "LOCKED" : isBooked ? "BOOKED" : "AVAILABLE"}
                                isSelected={isSelected}
                                seatNumber={seat.seat_number}
                                isVip={seat.type === "VIP"}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <div className="w-6 sm:w-10 text-center font-black text-zinc-700 text-[10px] sm:text-sm group-hover:text-primary transition-colors tracking-tighter">
                        {row}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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

        {/* ZOOM CONTROLS */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex flex-col gap-1 shadow-2xl">
                <button 
                    onClick={handleZoomIn}
                    className="p-3 bg-white/5 hover:bg-primary hover:text-white text-zinc-400 rounded-xl transition-all active:scale-90"
                    title="Phóng to"
                >
                    <Plus className="w-5 h-5" />
                </button>
                <div className="h-[1px] bg-white/5 mx-2" />
                <button 
                    onClick={handleZoomReset}
                    className="p-3 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl transition-all active:scale-90 flex flex-col items-center gap-1"
                    title="Vừa màn hình"
                >
                    <Maximize className="w-5 h-5" />
                    <span className="text-[8px] font-bold">{Math.round(zoomLevel * 100)}%</span>
                </button>
                <div className="h-[1px] bg-white/5 mx-2" />
                <button 
                    onClick={handleZoomOut}
                    className="p-3 bg-white/5 hover:bg-primary hover:text-white text-zinc-400 rounded-xl transition-all active:scale-90"
                    title="Thu nhỏ"
                >
                    <Minus className="w-5 h-5" />
                </button>
            </div>
        </div>

        {errorMsg && (
          <div className="text-red-500 bg-red-500/10 px-6 py-3 rounded-lg font-bold mb-4 flex items-center gap-2">
            <CopyX className="w-5 h-5" /> {errorMsg}
          </div>
        )}

      </div>

      {/* BOTTOM ACTION BAR STICKY */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-[150] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
          <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
            <div className="text-white/40 text-[10px] sm:text-xs mb-0.5 uppercase font-bold tracking-widest">
              Ghế đã chọn
            </div>
            <div className="text-white font-bold text-sm sm:text-base flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 max-h-12 overflow-y-auto no-scrollbar">
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

          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
            <div className="text-left sm:text-right">
              <div className="text-white/40 text-[10px] sm:text-xs mb-0.5 uppercase font-bold tracking-widest">
                Tổng cộng
              </div>
              <div className="text-primary font-black text-lg sm:text-2xl flex items-baseline gap-1">
                {totalPrice.toLocaleString("vi-VN")}{" "}
                <span className="text-[10px] sm:text-xs font-bold opacity-80 uppercase">
                  VNĐ
                </span>
              </div>
            </div>

            <button
              disabled={selectedSeatIds.length === 0 || isLocking}
              onClick={handleLockAndCheckout}
              className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-black text-xs sm:text-sm transition-all active:scale-95 flex-1 sm:flex-none uppercase tracking-wide
              ${
                selectedSeatIds.length === 0
                  ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                  : "bg-primary hover:bg-rose-700 text-white shadow-[0_10px_30px_rgba(229,9,20,0.4)]"
              }`}
            >
              {isLocking ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
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
  );
}
