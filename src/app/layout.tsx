import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import QuickBookingIsland from "@/components/layout/QuickBookingIsland";
import AIChatbot from "@/components/layout/AIChatbot";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* TODO: Header */}
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <QuickBookingIsland />
        <AIChatbot />
      </body>
    </html>
  );
}
