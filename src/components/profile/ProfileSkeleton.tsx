"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] animate-in fade-in duration-500">
      {/* ── HERO BANNER SKELETON ────────────────────── */}
      <div className="relative h-52 bg-[#111] overflow-hidden">
        <div className="absolute inset-0 flex gap-1 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-1 bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        
        {/* Breadcrumb & Title Skeleton */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-8">
          <div className="h-4 w-32 bg-white/5 rounded-md mb-3 animate-pulse" />
          <div className="h-10 w-48 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Tabs Skeleton */}
        <div className="flex gap-8 border-b border-white/5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-24 bg-white/5 rounded-t-lg animate-pulse" />
          ))}
        </div>

        {/* ── PROFILE HEADER SKELETON ───────────────────────── */}
        <div className="mb-8 bg-[#111] border border-white/[0.07] rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar Skeleton */}
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-white/5 animate-pulse" />
          </div>

          {/* Name & Info Skeleton */}
          <div className="flex-1 space-y-3 w-full sm:w-auto">
            <div className="h-7 w-48 bg-white/10 rounded-lg animate-pulse mx-auto sm:mx-0" />
            <div className="h-4 w-32 bg-white/5 rounded-md animate-pulse mx-auto sm:mx-0" />
            <div className="h-3 w-40 bg-white/5 rounded-md animate-pulse mx-auto sm:mx-0" />
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* ── MAIN GRID SKELETON ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Stats & Member Card */}
          <div className="lg:col-span-1 space-y-6">
             {/* Membership Card Skeleton */}
             <div className="h-48 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl border border-white/10 p-6 relative overflow-hidden">
                <div className="h-4 w-24 bg-white/10 rounded mb-4 animate-pulse" />
                <div className="h-6 w-40 bg-white/10 rounded mb-8 animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                <div className="absolute bottom-6 right-6 h-12 w-12 bg-white/5 rounded-full animate-pulse" />
             </div>

             {/* Progress Bar Skeleton */}
             <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-5 space-y-3">
                <div className="flex justify-between">
                   <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                   <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full" />
             </div>

             {/* Stats Cards Skeleton */}
             <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-5 space-y-4">
                <div className="h-3 w-24 bg-white/5 rounded mb-2 animate-pulse" />
                {[1, 2, 3].map((i) => (
                   <div key={i} className="flex justify-between items-center h-12 bg-white/[0.02] rounded-xl px-4 animate-pulse" />
                ))}
             </div>
          </div>

          {/* RIGHT: Main Content Skeleton */}
          <div className="lg:col-span-2">
             <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-12 flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-full animate-pulse" />
                <div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-4 w-full max-w-sm bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-3/4 max-w-sm bg-white/5 rounded animate-pulse" />
                <div className="flex gap-4 pt-4">
                   <div className="h-12 w-32 bg-white/10 rounded-xl animate-pulse" />
                   <div className="h-12 w-32 bg-white/5 rounded-xl animate-pulse" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
