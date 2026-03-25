import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookingshows.vercel.app";

export const metadata: Metadata = {
  title: "Trang Chủ - Đặt Vé Xem Phim Online",
  description:
    "Booking Show - Nền tảng đặt vé xem phim trực tuyến hàng đầu Việt Nam. Xem phim đang hot, phim bán chạy nhất và đặt vé nhanh chóng tại hàng trăm rạp chiếu phim trên toàn quốc.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Booking Show - Đặt Vé Xem Phim Trực Tuyến",
    description:
      "Xem phim đang hot, phim bán chạy và sắp chiếu. Đặt vé nhanh chóng tại hàng trăm rạp chiếu trên toàn quốc.",
    url: SITE_URL,
    type: "website",
  },
};

// JSON-LD WebSite + Organization
function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Booking Show",
        description: "Nền tảng đặt vé xem phim trực tuyến hàng đầu Việt Nam",
        inLanguage: "vi",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/movies?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Booking Show",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/icons/icon-512x512.png`,
          width: 512,
          height: 512,
        },
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "Vietnamese",
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <WebsiteJsonLd />
      <HomeClient />
    </>
  );
}
