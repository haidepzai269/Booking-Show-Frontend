import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookingshows.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/movies", "/cinemas", "/promotions"],
        disallow: [
          "/admin",
          "/admin/",
          "/booking",
          "/payment",
          "/profile",
          "/orders",
          "/tickets",
          "/api/",
          "/_next/",
        ],
      },
      {
        // Cho phép Googlebot đọc thêm
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: [
          "/admin",
          "/booking",
          "/payment",
          "/profile",
          "/orders",
          "/tickets",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
