import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import QuickBookingIsland from "@/components/layout/QuickBookingIsland";
import AIChatbot from "@/components/layout/AIChatbot";
import { Providers } from "@/components/layout/Providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://booking-show.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Booking Show - Đặt Vé Xem Phim Trực Tuyến",
    template: "%s | Booking Show",
  },
  description:
    "Booking Show - Nền tảng đặt vé xem phim trực tuyến hàng đầu Việt Nam. Xem lịch chiếu, đặt vé nhanh chóng cho hàng trăm bộ phim hay nhất tại các rạp chiếu phim trên toàn quốc.",
  keywords: [
    "đặt vé xem phim",
    "mua vé xem phim online",
    "rạp chiếu phim",
    "lịch chiếu phim",
    "phim đang chiếu",
    "phim sắp chiếu",
    "booking show",
    "vé phim online",
    "cinema",
    "movie ticket",
  ],
  authors: [{ name: "Booking Show" }],
  creator: "Booking Show",
  publisher: "Booking Show",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "Booking Show",
    title: "Booking Show - Đặt Vé Xem Phim Trực Tuyến",
    description:
      "Nền tảng đặt vé xem phim trực tuyến hàng đầu Việt Nam. Xem lịch chiếu, đặt vé nhanh chóng cho hàng trăm bộ phim hay nhất.",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Booking Show Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Booking Show - Đặt Vé Xem Phim Trực Tuyến",
    description:
      "Nền tảng đặt vé xem phim trực tuyến hàng đầu Việt Nam. Xem lịch chiếu, đặt vé nhanh chóng.",
    images: ["/icons/icon-512x512.png"],
    creator: "@bookingshow",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e50914" />
        <meta name="geo.region" content="VN" />
        <meta name="geo.placename" content="Vietnam" />
      </head>
      <body
        className={`${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          {/* TODO: Header */}
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <QuickBookingIsland />
          <AIChatbot />
        </Providers>
      </body>
    </html>
  );
}
