import type { Metadata } from "next";
import PersonDetailClient from "./PersonDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://booking-show.vercel.app";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string;
  known_for: string;
}

async function getPerson(id: string): Promise<Person | null> {
  try {
    const res = await fetch(`${API_URL}/persons/${id}`, {
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
  const person = await getPerson(id);

  if (!person) {
    return {
      title: "Diễn viên không tồn tại",
      robots: { index: false, follow: false },
    };
  }

  const pageUrl = `${SITE_URL}/persons/${person.id}`;
  const description = person.biography
    ? person.biography.slice(0, 160)
    : `Thông tin về diễn viên ${person.name}${person.known_for ? " - " + person.known_for : ""}. Khám phá các bộ phim liên quan tại Booking Show.`;

  return {
    title: `${person.name} - Diễn Viên`,
    description,
    keywords: [
      person.name,
      `diễn viên ${person.name}`,
      `phim của ${person.name}`,
      person.known_for || "diễn viên",
      "đặt vé xem phim",
    ],
    openGraph: {
      title: `${person.name} | Booking Show`,
      description,
      url: pageUrl,
      type: "profile",
      images: person.profile_path
        ? [{ url: person.profile_path, alt: person.name }]
        : ["/icons/icon-512x512.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${person.name} | Booking Show`,
      description,
      images: person.profile_path ? [person.profile_path] : ["/icons/icon-512x512.png"],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

function PersonJsonLd({ person }: { person: Person }) {
  const pageUrl = `${SITE_URL}/persons/${person.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": pageUrl,
        name: person.name,
        description: person.biography,
        image: person.profile_path,
        birthDate: person.birthday,
        birthPlace: person.place_of_birth,
        jobTitle: person.known_for || "Actor",
        url: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: person.name, item: pageUrl },
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

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPerson(id);

  return (
    <>
      {person && <PersonJsonLd person={person} />}
      <PersonDetailClient id={id} />
    </>
  );
}
