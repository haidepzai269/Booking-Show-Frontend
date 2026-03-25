import type { Metadata } from "next";
import PromotionsClientPage from "./PromotionsClientPage";

export const metadata: Metadata = {
  title: "Ưu Đãi & Khuyến Mãi - Săn Vé Phim Rẻ",
  description:
    "Khám phá hàng loạt ưu đãi độc quyền tại Booking Show: giảm giá vé từ ngân hàng, ví điện tử, đối tác và thành viên. Săn deal hot, xem phim rẻ hơn mỗi ngày!",
  keywords: [
    "ưu đãi xem phim",
    "khuyến mãi vé xem phim",
    "giảm giá vé phim",
    "vé phim giá rẻ",
    "mã giảm giá booking show",
    "ưu đãi ngân hàng xem phim",
  ],
  openGraph: {
    title: "Ưu Đãi & Khuyến Mãi | Booking Show",
    description:
      "Săn hàng loạt ưu đãi độc quyền từ ngân hàng, ví điện tử và đối tác. Xem phim rẻ hơn mỗi ngày tại Booking Show!",
    type: "website",
  },
  alternates: {
    canonical: "/promotions",
  },
};

export default function PromotionsPage() {
  return <PromotionsClientPage />;
}
