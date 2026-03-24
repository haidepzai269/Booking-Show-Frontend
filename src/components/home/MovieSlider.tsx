"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Ticket,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import NextImage from "next/image";

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  release_date: string;
  poster_url: string;
  trailer_url: string;
  genres: Genre[];
  rating?: number;
}

interface MovieSliderProps {
  movies: Movie[];
  badgeColor?: "primary" | "secondary";
  onPlayTrailer: (url: string) => void;
}

export default function MovieSlider({
  movies,
  badgeColor = "primary",
  onPlayTrailer,
}: MovieSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isPrimary = badgeColor === "primary";
  
  const badgeClass = isPrimary
    ? "text-primary border-primary"
    : "text-black bg-secondary border-secondary font-black";

  // Determine how many items to show based on screen width
  const getItemsToShow = () => {
    if (windowWidth >= 1024) return 4;
    if (windowWidth >= 768) return 2;
    return 1;
  };

  const itemsToShow = getItemsToShow();
  
  // Handle window resize
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalMovies = movies.length;
  const [isTransitioning, setIsTransitioning] = useState(true);
  
  // Logical next and prev functions
  const nextSlide = useCallback(() => {
    if (totalMovies <= itemsToShow) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [totalMovies, itemsToShow]);

  const prevSlide = useCallback(() => {
    if (totalMovies <= itemsToShow) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [totalMovies, itemsToShow]);

  // Handle Infinite Loop Snap-back
  useEffect(() => {
    if (currentIndex === totalMovies) {
      // Reached the end (duplicate items). Snap back to original start after animation.
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500); // Wait exactly for tween duration
      return () => clearTimeout(timer);
    }
    if (currentIndex === -1) {
      // Reached the beginning. Snap back to original end.
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalMovies - 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, totalMovies]);

  // Auto-play effect
  useEffect(() => {
    if (isHovered || totalMovies <= itemsToShow) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isHovered, nextSlide, totalMovies, itemsToShow]);

  if (totalMovies === 0) {
    return (
      <div className="text-gray-500 py-10 text-center w-full">
        Chưa có dữ liệu phim.
      </div>
    );
  }

  // Double padding for smooth bi-directional infinite effect
  const displayMovies = [
    ...movies.slice(-itemsToShow),
    ...movies,
    ...movies.slice(0, itemsToShow)
  ];

  // Adjust translation to account for the prepended items
  // Index 0 in displayMovies is now index -itemsToShow in logic
  const activeTranslationIndex = currentIndex + itemsToShow;

  return (
    <div 
      className="relative group w-full mb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Buttons */}
      {totalMovies > itemsToShow && (
        <>
          <button
            onClick={prevSlide}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/50 text-white border border-white/10 hover:bg-primary hover:border-primary transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-xl"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/50 text-white border border-white/10 hover:bg-primary hover:border-primary transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-xl"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slider Container */}
      <div className="relative py-4 -mx-3 md:-mx-4">
        {/* Stable Viewport with padding-bottom hack for absolute height stability */}
        <div 
          className="relative w-full overflow-hidden" 
          style={{ 
            paddingBottom: itemsToShow === 4 ? "37.5%" : itemsToShow === 2 ? "75%" : "150%" 
          }}
        >
          <div className="absolute inset-0">
            <motion.div
              className="flex h-full"
              animate={{
                x: `-${activeTranslationIndex * (100 / itemsToShow)}%`,
              }}
              transition={isTransitioning ? {
                type: "tween",
                ease: "easeInOut",
                duration: 0.5
              } : { duration: 0 }}
            >
              {displayMovies.map((movie, index) => (
                <div
                  key={`${movie.id}-${index}`}
                  className="relative flex-shrink-0 px-3 md:px-4 h-full"
                  style={{ 
                    width: `${100 / itemsToShow}%` 
                  }}
                >
                  <div className="relative w-full h-full transform-gpu">
                {/* Main Card */}
                <Link
                  href={`/movies/${movie.id}`}
                  className="block w-full h-full relative overflow-hidden rounded-2xl bg-card border border-white/5 shadow-2xl z-30 transition-all duration-500 group/card hover:border-primary/50 hover:-translate-y-2"
                >
                  <NextImage
                    src={movie.poster_url || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 z-10 pointer-events-none" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20 pointer-events-none">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${badgeClass}`}>
                        {(movie.genres && movie.genres.length > 0) ? movie.genres[0].name : "2D"}
                      </span>
                      {movie.rating && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-secondary">
                          <Star className="w-3 h-3 fill-current" /> {movie.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-black text-sm md:text-lg uppercase italic leading-tight line-clamp-2 drop-shadow-lg">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-bold">
                      <Clock className="w-3 h-3" /> {movie.duration_minutes} Phút
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px] z-15 pointer-events-none">
                    <div className="p-4 rounded-full bg-primary text-white shadow-xl transform scale-75 group-hover/card:scale-100 transition-transform duration-500">
                      <Ticket className="w-6 h-6" />
                    </div>
                  </div>
                </Link>

                {/* Trailer Button */}
                {movie.trailer_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onPlayTrailer(movie.trailer_url);
                    }}
                    className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-primary hover:border-primary transition-all hover:scale-110 active:scale-90 shadow-2xl"
                    title="Xem Trailer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </div>

      {/* Pagination dots */}
      {totalMovies > itemsToShow && (
        <div className="flex justify-center gap-1.5 mt-4">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
