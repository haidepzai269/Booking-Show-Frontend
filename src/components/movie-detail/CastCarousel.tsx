"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import NextImage from "next/image";

// Dùng Dummy Data vì API backend chưa hỗ trợ array cast thực sự
interface CastMember {
  id: number;
  name: string;
  character?: string;
  role?: string;
  profile_image?: string;
  image?: string;
}

const DUMMY_CAST: CastMember[] = [
  {
    id: 1,
    name: "Cillian Murphy",
    role: "J. Robert Oppenheimer",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Emily Blunt",
    role: "Kitty Oppenheimer",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Matt Damon",
    role: "Leslie Groves",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=250&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Robert Downey Jr.",
    role: "Lewis Strauss",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Florence Pugh",
    role: "Jean Tatlock",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Gary Oldman",
    role: "Harry S. Truman",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
  },
];

export default function CastCarousel({
  cast = [],
}: {
  cast?: CastMember[];
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const displayCast = cast.length > 0 ? cast : DUMMY_CAST;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-black text-white uppercase">
            Dàn Diễn Viên
          </h2>
        </div>

        {/* Navigation Buttons for desktop */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 rounded-full border border-white/20 bg-[#111] flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 rounded-full border border-white/20 bg-[#111] flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all group"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scroll pb-6"
        >
          {displayCast.map((actor, index) => {
            const handleClick = () => {
              if (actor.id) {
                router.push(`/persons/${actor.id}`);
              }
            };

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={handleClick}
                className={`shrink-0 w-36 sm:w-44 group ${
                  actor.id ? "cursor-pointer" : "cursor-default"
                } snap-start`}
              >
                <div className="relative aspect-square mb-4 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors duration-300">
                  <NextImage
                    src={actor.profile_image || actor.image || ""}
                    alt={actor.name}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 144px, 176px"
                  />
                  {actor.id && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-black/30 px-2 py-1 rounded">
                        Info
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center px-2">
                  <h4 className="text-white font-bold leading-tight mb-1 group-hover:text-primary transition-colors">
                    {actor.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {actor.character || actor.role}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
