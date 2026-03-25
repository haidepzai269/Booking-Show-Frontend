import type { Metadata } from "next";
import MovieDetailClient from "./MovieDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://booking-show.vercel.app";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface Movie {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  release_date: string;
  poster_url: string;
  genres: { id: number; name: string }[];
}

async function getMovie(id: string): Promise<Movie | null> {
  try {
    const res = await fetch(`${API_URL}/movies/${id}`, {
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
  const movie = await getMovie(id);

  if (!movie) {
    return {
      title: "Phim không tồn tại",
      description: "Không tìm thấy thông tin phim này.",
      robots: { index: false, follow: false },
    };
  }

  const description = movie.description
    ? movie.description.slice(0, 160)
    : `Xem lịch chiếu và đặt vé phim "${movie.title}" trực tuyến tại Booking Show. Đặt vé nhanh chóng, tiện lợi.`;

  const pageUrl = `${SITE_URL}/movies/${movie.id}`;
  const genres = movie.genres?.map((g) => g.name).join(", ") || "";

  return {
    title: movie.title,
    description,
    keywords: [
      movie.title,
      `đặt vé ${movie.title}`,
      `xem phim ${movie.title}`,
      ...(movie.genres?.map((g) => g.name) || []),
      "đặt vé xem phim",
      "lịch chiếu phim",
    ],
    openGraph: {
      type: "video.movie",
      url: pageUrl,
      title: `${movie.title} | Booking Show`,
      description,
      images: movie.poster_url
        ? [
            {
              url: movie.poster_url,
              width: 500,
              height: 750,
              alt: movie.title,
            },
          ]
        : ["/icons/icon-512x512.png"],
      siteName: "Booking Show",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${movie.title} | Booking Show`,
      description,
      images: movie.poster_url ? [movie.poster_url] : ["/icons/icon-512x512.png"],
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      "movie:release_date": movie.release_date,
      "movie:duration": String(movie.duration_minutes),
      "movie:tag": genres,
    },
  };
}

// JSON-LD Structured Data cho Movie
function MovieJsonLd({ movie }: { movie: Movie }) {
  const pageUrl = `${SITE_URL}/movies/${movie.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Movie",
        "@id": pageUrl,
        name: movie.title,
        description: movie.description,
        image: movie.poster_url,
        datePublished: movie.release_date,
        genre: movie.genres?.map((g) => g.name) || [],
        duration: `PT${movie.duration_minutes}M`,
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
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Phim",
            item: `${SITE_URL}/movies`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: movie.title,
            item: pageUrl,
          },
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

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovie(id);

  return (
    <>
      {movie && <MovieJsonLd movie={movie} />}
      <MovieDetailClient id={id} />
    </>
  );
}
