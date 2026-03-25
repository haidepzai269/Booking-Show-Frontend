import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookingshows.vercel.app";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface Movie {
  id: number;
  updated_at?: string;
}

interface Cinema {
  id: number;
  updated_at?: string;
}

async function getMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${API_URL}/movies/`, {
      next: { revalidate: 3600 }, // Cache 1 giờ
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getCinemas(): Promise<Cinema[]> {
  try {
    const res = await fetch(`${API_URL}/cinemas/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [movies, cinemas] = await Promise.all([getMovies(), getCinemas()]);

  // Các trang tĩnh
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/movies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cinemas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/promotions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Trang chi tiết từng phim
  const moviePages: MetadataRoute.Sitemap = movies.map((movie) => ({
    url: `${SITE_URL}/movies/${movie.id}`,
    lastModified: movie.updated_at ? new Date(movie.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Trang chi tiết từng rạp
  const cinemaPages: MetadataRoute.Sitemap = cinemas.map((cinema) => ({
    url: `${SITE_URL}/cinemas/${cinema.id}`,
    lastModified: cinema.updated_at ? new Date(cinema.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...moviePages, ...cinemaPages];
}
