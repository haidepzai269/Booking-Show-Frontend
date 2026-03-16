"use client";

import React from "react";

export default function BookingHistorySkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-10 w-48 bg-white/5 rounded-xl" />
        <div className="h-5 w-64 bg-white/5 rounded-lg" />
      </div>

      <div className="flex gap-4 border-b border-white/5 pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 bg-white/5 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 border border-white/5">
            {/* Poster Skeleton */}
            <div className="w-full md:w-32 h-48 md:h-44 bg-white/10 rounded-2xl shrink-0" />
            
            {/* Info Skeleton */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="h-7 w-2/3 bg-white/10 rounded-lg" />
                  <div className="h-6 w-24 bg-white/10 rounded-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-5 w-32 bg-white/5 rounded-md" />
                  <div className="h-5 w-24 bg-white/5 rounded-md" />
                  <div className="h-5 w-48 bg-white/5 rounded-md" />
                </div>
              </div>
              <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/5">
                <div>
                  <div className="h-3 w-16 bg-white/5 rounded mb-2" />
                  <div className="h-8 w-32 bg-white/10 rounded-lg" />
                </div>
                <div className="h-10 w-28 bg-white/10 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
