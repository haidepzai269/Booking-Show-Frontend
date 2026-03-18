"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Copy,
  MapPin,
  Clock,
  Calendar,
  Download,
  AlertCircle,
  ArrowLeft,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import NextImage from "next/image";
import { format } from "date-fns";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";

interface TicketDetail {
  id: string;
  is_used: boolean;
  qr_code_data: string;
  showtime_seat: {
    price: number;
    seat: { row_char: string; seat_number: number; type: string };
    showtime: {
      start_time: string;
      movie: { title: string; poster_url: string; duration_minutes: number };
      room: {
        name: string;
        cinema: { name: string; city: string; address: string };
      };
    };
  };
}

export default function TicketBoardingPass() {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const ticketId = params.id as string;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect về login nếu chưa đăng nhập
  useEffect(() => {
    if (!isHydrated) return;
    if (token === null) {
      router.push("/login");
    }
  }, [token, router, isHydrated]);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await apiClient.get<ApiResponse<TicketDetail>>(
          `/tickets/${ticketId}`,
        ) as unknown as ApiResponse<TicketDetail>;
        if (res.success && res.data) {
          setTicket(res.data);
        } else {
          setError(res.error || "Không tìm thấy vé");
        }
      } catch (err: unknown) {
        setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || "Lỗi tải dữ liệu vé");
      } finally {
        setLoading(false);
      }
    };

    if (isHydrated && token) fetchTicket();
  }, [ticketId, token, isHydrated]);

  // Copy mã vé với feedback
  const copyTicketId = async () => {
    try {
      await navigator.clipboard.writeText(ticket?.id || ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback cho trình duyệt không hỗ trợ clipboard API
      const el = document.createElement("textarea");
      el.value = ticket?.id || ticketId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Lưu ảnh vé bằng html-to-image
  const saveTicketImage = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#fbfbfb",
      });
      const link = document.createElement("a");
      link.download = `ve-xem-phim-${ticketId.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Lỗi lưu ảnh:", e);
    } finally {
      setSaving(false);
    }
  };

  if (!isHydrated || loading || token === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-card rounded-full border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
          <AlertCircle className="w-16 h-16 text-primary mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Không thể tải thông tin vé
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/profile/tickets")}
            className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors"
          >
            Quay lại danh sách vé
          </button>
        </div>
      </div>
    );
  }

  const showtime = ticket.showtime_seat.showtime;
  const seat = ticket.showtime_seat.seat;
  const movie = showtime.movie;
  const room = showtime.room;
  const dateObj = new Date(showtime.start_time);

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,#0a0a0a,#1a0505)] flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Breadcrumb */}
        <div className="w-full max-w-md mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push("/profile/tickets")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Vé của tôi</span>
          </button>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Chuyến bay điện ảnh
          </div>
        </div>

        {/* Boarding Pass Card — phần này sẽ được chụp ảnh */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(229,9,20,0.15)] relative"
        >
          {/* TOP TICKET BANNER */}
          <div className="relative h-56 bg-card w-full">
            <NextImage
              src={
                movie.poster_url ||
                "https://images.unsplash.com/photo-1440404653325-ab127d49abc1"
              }
              fill
              className="w-full h-full object-cover opacity-60"
              alt={movie.title}
              crossOrigin="anonymous"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent" />

            {ticket.is_used && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Đã Sử Dụng
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2 drop-shadow-md">
                {movie.title}
              </h1>
              <div className="flex gap-2 text-xs font-semibold">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-gray-200">
                  {movie.duration_minutes} Phút
                </span>
                <span className="bg-primary/80 backdrop-blur-md px-2 py-0.5 rounded text-white">
                  2D Phụ Đề
                </span>
              </div>
            </div>
          </div>

          {/* MIDDLE INFO */}
          <div className="bg-[#151515] px-6 py-8 pb-4 text-white relative">
            {/* CUTOUTS */}
            <div className="absolute top-0 left-0 w-6 h-6 rounded-br-full bg-[#fbfbfb]" />
            <div className="absolute top-0 right-0 w-6 h-6 rounded-bl-full bg-[#fbfbfb]" />
            <div className="absolute bottom-[-1px] left-0 w-6 h-6 rounded-tr-full bg-[#fbfbfb] z-10" />
            <div className="absolute bottom-[-1px] right-0 w-6 h-6 rounded-tl-full bg-[#fbfbfb] z-10" />

            <div className="grid grid-cols-2 gap-y-7 gap-x-4 mb-4">
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Rạp Phim
                </p>
                <p className="font-bold text-[15px] leading-tight text-gray-100">
                  {room.cinema.name}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Phòng Chiếu
                </p>
                <p className="font-bold text-[15px] leading-tight text-gray-100">
                  {room.name}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Thời Gian
                </p>
                <p className="font-bold text-[15px] text-gray-100">
                  {format(dateObj, "dd/MM/yyyy")} -{" "}
                  <span className="text-primary">
                    {format(dateObj, "HH:mm")}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-primary -ml-3 pl-3 border-l-2">
                  Ghế Ngồi
                </p>
                <p className="font-black text-2xl text-primary mt-1">
                  {seat.row_char}
                  {seat.seat_number}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">
                  {seat.type} Class
                </p>
              </div>
            </div>
          </div>

          {/* BOTTOM QR */}
          <div className="bg-[#fbfbfb] px-6 py-10 flex flex-col items-center justify-center relative">
            {/* DASHED LINE BORDER SEPARATOR */}
            <div className="absolute top-0 left-6 right-6 border-t-[3px] border-dashed border-gray-300/60" />

            <div
              className={`p-4 rounded-2xl mb-4 transition-all duration-500 ${
                ticket.is_used
                  ? "opacity-40 grayscale"
                  : "bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 max-w-max mx-auto"
              }`}
            >
              <NextImage
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  ticket.qr_code_data,
                )}&color=000000&bgcolor=ffffff`}
                alt="QR Code"
                width={160}
                height={160}
                className="w-40 h-40 mix-blend-multiply"
                crossOrigin="anonymous"
              />
            </div>

            <p className="text-gray-500 text-[11px] font-semibold tracking-wide text-center uppercase mb-1 max-w-[250px]">
              {ticket.is_used
                ? "Mã này đã được quét và sử dụng"
                : "Đưa QR code này cho nhân viên để vào phòng chiếu"}
            </p>

            {/* Mã vé dạng text */}
            <p className="text-[10px] font-mono text-gray-400 tracking-widest mb-6">
              {ticket.id.split("-").join("").toUpperCase()}
            </p>
          </div>
        </motion.div>

        {/* ACTION BUTTONS — nằm ngoài card để không bị chụp ảnh */}
        <div className="w-full max-w-md mt-4 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={copyTicketId}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all duration-300 ${
              copied
                ? "bg-green-500 text-white"
                : "bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Đã sao chép!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Mã Vé
              </>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={saveTicketImage}
            disabled={saving}
            className="flex-1 bg-primary hover:bg-[#b80710] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-colors shadow-lg shadow-primary/20"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Lưu Ảnh Vé
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
