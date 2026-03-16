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

export const metadata: Metadata = {
  title: "Booking Show - Trải nghiệm điện ảnh đỉnh cao",
  description: "Đặt vé xem phim trực tuyến siêu tốc!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e50914" />
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
