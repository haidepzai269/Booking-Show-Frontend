"use client";

import React from "react";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { motion } from "framer-motion";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  reverse?: boolean; // Nếu true, banner bên trái, form bên phải (dùng cho register)
}

export default function AuthSplitLayout({
  children,
  bannerImage,
  bannerTitle,
  bannerSubtitle,
  reverse = false,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#080808] text-foreground">
      {/* SECTION FORM */}
      <div
        className={`w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 order-2 ${reverse ? "md:order-2" : "md:order-1"} relative z-10`}
      >
        <div className="absolute inset-0 bg-background/50 backdrop-blur-md -z-10 md:hidden" />
        <Link href="/" className="flex items-center gap-2 mb-12 w-max group">
          <Ticket className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" />
          <span className="text-2xl font-black tracking-tighter text-white">
            BOOKING<span className="text-primary">SHOW</span>
          </span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {children}
        </motion.div>
      </div>

      {/* SECTION BANNER */}
      <div
        className={`w-full md:w-1/2 relative h-64 md:h-screen order-1 ${reverse ? "md:order-1" : "md:order-2"}`}
      >
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImage}
            alt="Cinema Banner"
            className="w-full h-full object-cover"
          />

          {/* Dark overlay base layer */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

          {/* Gradient blending depending on position */}
          <div
            className={`absolute inset-0 md:hidden bg-gradient-to-t from-[#080808] via-transparent to-transparent`}
          />
          <div
            className={`absolute inset-0 hidden md:block ${reverse ? "bg-gradient-to-r from-[#080808] via-transparent to-transparent" : "bg-gradient-to-l from-[#080808] via-transparent to-transparent"}`}
          />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-end p-12 hidden md:flex">
          <motion.div
            initial={{ opacity: 0, x: reverse ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-lg"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight uppercase tracking-tight shadow-black drop-shadow-lg">
              {bannerTitle}
            </h2>
            <p className="text-gray-200 text-lg shadow-black drop-shadow-md bg-black/20 p-4 border-l-4 border-primary rounded-r-lg backdrop-blur-sm">
              {bannerSubtitle}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
