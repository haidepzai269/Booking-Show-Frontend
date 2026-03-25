import type { Metadata } from "next";
import CinemaDetailClient from "./CinemaDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://booking-show.vercel.app";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  image_url: string;
}

async function getCinema(id: string): Promise<Cinema | null> {
  try {
    const res = await fetch(`${API_URL}/cinemas/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cinema = await getCinema(id);

  if (!cinema) {
    return {
      title: "Rạp chiếu không tồn tại",
      robots: { index: false, follow: false },
    };
  }

  const pageUrl = `${SITE_URL}/cinemas/${cinema.id}`;
  const description = `Xem lịch chiếu phim và đặt vé tại ${cinema.name} - ${cinema.address}${cinema.city ? ", " + cinema.city : ""}. Đặt vé nhanh chóng tại Booking Show.`;

  return {
    title: `${cinema.name} - Lịch Chiếu & Đặt Vé`,
    description,
    keywords: [
      cinema.name,
      `lịch chiếu ${cinema.name}`,
      `đặt vé ${cinema.name}`,
      cinema.city || "",
      "rạp chiếu phim",
      "lịch chiếu phim",
    ],
    openGraph: {
      title: `${cinema.name} | Booking Show`,
      description,
      url: pageUrl,
      type: "website",
      images: cinema.image_url
        ? [{ url: cinema.image_url, alt: cinema.name }]
        : ["/icons/icon-512x512.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cinema.name} | Booking Show`,
      description,
      images: cinema.image_url ? [cinema.image_url] : ["/icons/icon-512x512.png"],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

// JSON-LD LocalBusiness schema
function CinemaJsonLd({ cinema }: { cinema: Cinema }) {
  const pageUrl = `${SITE_URL}/cinemas/${cinema.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MovieTheater",
        "@id": pageUrl,
        name: cinema.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: cinema.address,
          addressLocality: cinema.city || "Việt Nam",
          addressCountry: "VN",
        },
        image: cinema.image_url,
        url: pageUrl,
        potentialAction: {
          "@type": "ReserveAction",
          target: pageUrl,
          name: "Đặt vé",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Rạp chiếu phim", item: `${SITE_URL}/cinemas` },
          { "@type": "ListItem", position: 3, name: cinema.name, item: pageUrl },
        ],
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

export default async function CinemaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cinema = await getCinema(id);

  return (
    <>
      {cinema && <CinemaJsonLd cinema={cinema} />}
      <CinemaDetailClient id={id} />
    </>
  );
}
