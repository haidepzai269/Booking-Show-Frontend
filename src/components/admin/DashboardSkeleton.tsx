"use client";

import React from "react";

/**
 * DashboardSkeleton - Hiệu ứng tải trang khối cao cấp cho Dashboard
 * Mô phỏng bố cục Grid-layout để tránh hiện tượng nhảy layout khi dữ liệu tải xong
 */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-3">
          <div className="relative overflow-hidden h-9 w-56 bg-zinc-800/80 rounded-xl">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
          </div>
          <div className="relative overflow-hidden h-4 w-40 bg-zinc-800/40 rounded-lg">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
          </div>
        </div>
        <div className="relative overflow-hidden h-10 w-48 bg-zinc-800/60 rounded-xl border border-white/5">
           <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="relative overflow-hidden h-32 bg-zinc-900/40 border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="h-3 w-20 bg-zinc-800 rounded-full" />
              <div className="h-8 w-8 bg-zinc-800/80 rounded-xl" />
            </div>
            <div className="h-7 w-28 bg-zinc-800 rounded-lg" />
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
          </div>
        ))}
      </div>

      {/* Middle Section: Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-4 relative overflow-hidden h-96 bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="h-4 w-32 bg-zinc-800 rounded-full" />
            <div className="h-4 w-4 bg-zinc-800 rounded" />
          </div>
          <div className="mt-auto h-48 w-full bg-zinc-800/20 rounded-2xl flex items-end gap-2 px-2 pb-4">
             {[...Array(12)].map((_, i) => (
               <div key={i} className="flex-1 bg-zinc-800/40 rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
             ))}
          </div>
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
        </div>

        {/* Table Card */}
        <div className="lg:col-span-8 relative overflow-hidden h-96 bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="h-4 w-40 bg-zinc-800 rounded-full" />
            <div className="h-3 w-24 bg-zinc-800/40 rounded-full" />
          </div>
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-zinc-800 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-1/3 bg-zinc-800 rounded-full" />
                  <div className="h-2 w-1/4 bg-zinc-800/40 rounded-full" />
                </div>
                <div className="h-3 w-20 bg-zinc-800 rounded-full" />
                <div className="h-6 w-16 bg-zinc-800 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
        </div>
      </div>

      {/* Bottom Section: Donuts & System */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative overflow-hidden h-64 bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="h-4 w-32 bg-zinc-800 rounded-full" />
              <div className="h-4 w-4 bg-zinc-800 rounded" />
            </div>
            <div className="flex justify-center items-center py-4">
              {i < 2 ? (
                /* Donut Mockup */
                <div className="relative w-32 h-32 flex items-center justify-center">
                   <div className="w-full h-full rounded-full border-[14px] border-zinc-800/60" />
                   <div className="absolute h-4 w-12 bg-zinc-800 rounded-full" />
                </div>
              ) : (
                /* System Box Mockup */
                <div className="w-full space-y-4 text-center">
                   <div className="h-5 w-48 bg-zinc-800 rounded-full mx-auto" />
                   <div className="h-3 w-full bg-zinc-800/40 rounded-full" />
                   <div className="h-8 w-32 bg-zinc-800/60 rounded-xl mx-auto" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}
