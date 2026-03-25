import type { Metadata } from "next";
import { Suspense } from "react";
import MoviesClientPage from "./MoviesClientPage";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Danh Sách Phim - Đặt Vé Online",
  description:
    "Khám phá danh sách phim đang chiếu và sắp chiếu tại Booking Show. Lọc theo thể loại, sắp xếp theo ngày phát hành và đặt vé xem phim trực tuyến nhanh chóng.",
  keywords: [
    "danh sách phim",
    "phim đang chiếu",
    "phim sắp chiếu",
    "xem phim online",
    "đặt vé phim",
    "lịch chiếu phim",
    "booking show movies",
  ],
  openGraph: {
    title: "Danh Sách Phim | Booking Show",
    description:
      "Khám phá hàng trăm bộ phim đang chiếu và sắp chiếu. Đặt vé xem phim trực tuyến nhanh chóng tại Booking Show.",
    type: "website",
  },
  alternates: {
    canonical: "/movies",
  },
};

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] rounded-2xl bg-card border border-border animate-pulse"
        />
      ))}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-6 py-10">
            <GridSkeleton />
          </div>
        </div>
      }
    >
      <MoviesClientPage />
    </Suspense>
  );
}
