"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  ChevronRight,
  Video,
  Navigation,
  Loader2,
  LocateFixed,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import NextImage from "next/image";

export interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  image_url: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // km, trả về từ backend nếu có tọa độ người dùng
}

type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const fetchCinemas = useCallback(async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      let url = "/cinemas/";
      if (lat !== undefined && lng !== undefined) {
        url += `?lat=${lat}&lng=${lng}`;
      }
      const res = await apiClient.get<{ success: boolean; data: Cinema[] }>(url);
      const responseData = (res as any).data || res;
      if (responseData.data) {
        setCinemas(responseData.data);
      }
    } catch (error) {
      console.error("Failed to fetch cinemas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load ban đầu không cần vị trí
  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationStatus("granted");
        setSelectedCity("All"); // Reset city filter khi dùng vị trí
        fetchCinemas(latitude, longitude);
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    setLocationStatus("idle");
    fetchCinemas();
  };

  const cities = [
    "All",
    ...Array.from(new Set(cinemas.map((c) => c.city).filter(Boolean))),
  ];

  const filteredCinemas = cinemas.filter((cinema) => {
    const matchesCity = selectedCity === "All" || cinema.city === selectedCity;
    const matchesSearch =
      cinema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cinema.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <NextImage
            src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop"
            alt="Cinemas Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tight"
          >
            Hệ Thống Rạp <span className="text-primary">Premium</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Trải nghiệm điện ảnh đỉnh cao với hệ thống phòng chiếu hiện đại
            trang bị công nghệ âm thanh và hình ảnh tiên tiến nhất.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto mt-8"
          >
            <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-2 focus-within:border-primary/50 transition-colors">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="Tìm kiếm rạp chiếu hoặc địa chỉ..."
                className="w-full bg-transparent border-none outline-none text-white px-4 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Location Banner */}
        <AnimatePresence>
          {locationStatus === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <Navigation className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    Tìm rạp gần bạn nhất
                  </p>
                  <p className="text-blue-300/70 text-xs mt-0.5">
                    Cho phép truy cập vị trí để xem danh sách rạp sắp xếp theo
                    khoảng cách
                  </p>
                </div>
              </div>
              <button
                onClick={handleRequestLocation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <LocateFixed className="w-4 h-4" />
                Dùng vị trí của tôi
              </button>
            </motion.div>
          )}

          {locationStatus === "loading" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-blue-950/40 border border-blue-700/40 flex items-center gap-3"
            >
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <p className="text-blue-300 text-sm font-medium">
                Đang lấy vị trí của bạn...
              </p>
            </motion.div>
          )}

          {locationStatus === "granted" && userCoords && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-green-950/40 border border-green-700/40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <LocateFixed className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-green-300 text-sm font-medium">
                  Danh sách rạp đã được sắp xếp theo khoảng cách từ vị trí của
                  bạn
                </p>
              </div>
              <button
                onClick={handleClearLocation}
                className="p-1.5 text-green-400/60 hover:text-green-300 hover:bg-green-900/40 rounded-lg transition"
                title="Xóa vị trí"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {locationStatus === "denied" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-amber-950/40 border border-amber-700/40 flex items-center justify-between gap-3"
            >
              <p className="text-amber-300 text-sm">
                ⚠️ Bạn đã từ chối quyền truy cập vị trí. Bạn có thể thay đổi
                trong cài đặt trình duyệt.
              </p>
              <button
                onClick={() => setLocationStatus("idle")}
                className="p-1.5 text-amber-400/60 hover:text-amber-300 hover:bg-amber-900/40 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {locationStatus === "unavailable" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-red-950/40 border border-red-700/40 flex items-center justify-between gap-3"
            >
              <p className="text-red-300 text-sm">
                ❌ Trình duyệt của bạn không hỗ trợ tính năng định vị.
              </p>
              <button
                onClick={() => setLocationStatus("idle")}
                className="p-1.5 text-red-400/60 hover:text-red-300 hover:bg-red-900/40 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* City Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-white/10">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-white font-medium mr-2">Khu vực:</span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCity === city
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                  : "bg-card text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-[400px] bg-card/50 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCinemas.length === 0 && (
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Không tìm thấy rạp chiếu nào
            </h3>
            <p className="text-gray-400">
              Vui lòng thử nghiệm khu vực hoặc từ khóa tìm kiếm khác.
            </p>
          </div>
        )}

        {/* Cinema Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading &&
            filteredCinemas.map((cinema, index) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                key={cinema.id}
                className="group relative bg-card rounded-3xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(229,9,20,0.1)]"
              >
                <div className="relative h-56 overflow-hidden">
                  <NextImage
                    src={
                      cinema.image_url ||
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop"
                    }
                    alt={cinema.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80" />

                  {/* City badge */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-white">
                      {cinema.city || "Việt Nam"}
                    </span>
                  </div>

                  {/* Distance badge - chỉ hiển thị khi có khoảng cách */}
                  {cinema.distance !== undefined &&
                    cinema.distance !== null && (
                      <div className="absolute top-4 right-4 bg-blue-600/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-blue-400/30 flex items-center gap-1.5">
                        <Navigation className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white">
                          {cinema.distance < 1
                            ? `${Math.round(cinema.distance * 1000)} m`
                            : `${cinema.distance.toFixed(1)} km`}
                        </span>
                      </div>
                    )}
                </div>

                <div className="p-6 relative">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {cinema.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                    {cinema.address}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                      <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <span
                          className="text-xs text-white cursor-help"
                          title="2D"
                        >
                          2D
                        </span>
                      </span>
                      <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <span
                          className="text-xs text-primary font-bold cursor-help"
                          title="3D"
                        >
                          3D
                        </span>
                      </span>
                      <span className="w-10 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <span
                          className="text-[10px] text-yellow-500 font-bold cursor-help"
                          title="IMAX"
                        >
                          IMAX
                        </span>
                      </span>
                    </div>

                    <Link href={`/cinemas/${cinema.id}`}>
                      <button className="flex items-center rounded-full pl-5 pr-2 py-2 gap-2 bg-white text-black hover:bg-primary hover:text-white group transition-colors">
                        <span className="font-bold text-sm">Chi tiết</span>
                        <div className="bg-black/10 group-hover:bg-black/20 p-1.5 rounded-full transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
