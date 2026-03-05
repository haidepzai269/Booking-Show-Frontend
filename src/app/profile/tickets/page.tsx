"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import {
  Ticket as TicketIcon,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "@/components/layout/Header";

interface TicketData {
  id: string;
  is_used: boolean;
  created_at: string;
  showtime_seat: {
    seat: { row_char: string; seat_number: number; type: string };
    showtime: {
      start_time: string;
      movie: { title: string; poster_url: string };
      room: {
        name: string;
        cinema: { name: string; city: string };
      };
    };
  };
}

export default function MyTicketsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect về login nếu chưa đăng nhập
  useEffect(() => {
    if (!isHydrated) return;
    if (token === null) {
      router.push("/login?redirect=/profile/tickets");
    }
  }, [token, router, isHydrated]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = (await apiClient.get("/tickets/my")) as any;
        if (res?.success) {
          setTickets(res.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setLoading(false);
      }
    };

    if (isHydrated && token) {
      fetchTickets();
    }
  }, [isHydrated, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center py-40">
          <div className="w-12 h-12 border-4 border-card rounded-full border-t-primary animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Header />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <TicketIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Vé Của Tôi
              </h1>
              <p className="text-gray-400 mt-1">
                Quản lý lịch sử đặt vé và vé điện tử của bạn
              </p>
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-white/5">
              <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Chưa có vé nào
              </h3>
              <p className="text-gray-400 mb-6">
                Bạn chưa đặt vé xem phim nào. Hãy khám phá phim ngay!
              </p>
              <Link
                href="/movies"
                className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-colors"
              >
                Khám Phá Phim
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket, index) => {
                const showtime = ticket.showtime_seat?.showtime;
                const rawDate = showtime?.start_time;
                const dateObj = rawDate ? new Date(rawDate) : null;
                const isValidDate = dateObj && !isNaN(dateObj.getTime());
                const seat = ticket.showtime_seat?.seat;
                const movie = showtime?.movie;
                const room = showtime?.room;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={ticket.id}
                    className="group relative bg-[#1f1f1f] rounded-2xl flex flex-col sm:flex-row overflow-hidden border border-white/5 hover:border-primary/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  >
                    {/* Poster Section (Left) */}
                    <div className="sm:w-48 h-48 sm:h-auto shrink-0 relative">
                      <img
                        src={
                          movie?.poster_url ||
                          "https://images.unsplash.com/photo-1440404653325-ab127d49abc1"
                        }
                        alt={movie?.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1f1f1f] hidden sm:block"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f] to-transparent sm:hidden"></div>
                    </div>

                    {/* Info Section (Middle) */}
                    <div className="p-6 flex-1 flex flex-col justify-center relative">
                      {ticket.is_used && (
                        <div className="absolute top-4 right-4 bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã sử dụng
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-white mb-4 pr-24 line-clamp-2">
                        {movie?.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {isValidDate
                              ? format(dateObj!, "dd/MM/yyyy")
                              : "--/--/----"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>
                            {isValidDate ? format(dateObj!, "HH:mm") : "--:--"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 col-span-2">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">
                            {room?.cinema?.name} - {room?.name}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="inline-block bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
                          <span className="text-gray-400 text-xs mr-2">
                            Ghế:
                          </span>
                          <span className="text-primary font-black">
                            {seat?.row_char}
                            {seat?.seat_number}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tear Line (Separator) */}
                    <div className="hidden sm:flex flex-col items-center justify-center relative w-8">
                      <div className="absolute top-[-10px] w-5 h-5 bg-[#0a0a0a] rounded-full"></div>
                      <div className="h-full border-l-2 border-dashed border-gray-600/50"></div>
                      <div className="absolute bottom-[-10px] w-5 h-5 bg-[#0a0a0a] rounded-full"></div>
                    </div>

                    {/* Action Section (Right) */}
                    <div className="p-6 sm:w-48 flex flex-col items-center justify-center border-t sm:border-t-0 border-dashed border-gray-600/50 sm:border-none bg-black/20">
                      <Link href={`/tickets/${ticket.id}`} className="w-full">
                        <button className="w-full bg-primary hover:bg-[#b80710] text-white py-3 px-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-colors group-hover:scale-105 duration-300">
                          Xem Vé Mã QR
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                      {!ticket.is_used && (
                        <p className="text-xs text-gray-500 text-center mt-4">
                          Xuất trình mã quét khi vào rạp
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
