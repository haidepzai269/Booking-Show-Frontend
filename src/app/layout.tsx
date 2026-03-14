import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
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
      <body
        className={`${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          {/* TODO: Header */}
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <AIChatbot />
        </Providers>
      </body>
    </html>
  );
}
