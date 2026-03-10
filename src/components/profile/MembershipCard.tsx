"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Star, Diamond, Trophy, Zap } from "lucide-react";

interface MembershipCardProps {
  rank: string;
  fullName: string;
  totalSpending: number;
}

const rankConfigs: Record<
  string,
  {
    name: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
    text: string;
    glow: string;
  }
> = {
  BRONZE: {
    name: "ĐỒNG",
    icon: <Shield className="w-8 h-8" />,
    color: "#CD7F32",
    bg: "linear-gradient(135deg, #8B4513 0%, #CD7F32 50%, #A0522D 100%)",
    border: "border-orange-900/30",
    text: "text-orange-100",
    glow: "shadow-[0_0_20px_rgba(205,127,50,0.3)]",
  },
  SILVER: {
    name: "BẠC",
    icon: <Trophy className="w-8 h-8" />,
    color: "#C0C0C0",
    bg: "linear-gradient(135deg, #708090 0%, #C0C0C0 50%, #E6E6FA 100%)",
    border: "border-slate-300/30",
    text: "text-slate-100",
    glow: "shadow-[0_0_20px_rgba(192,192,192,0.4)]",
  },
  GOLD: {
    name: "VÀNG",
    icon: <Star className="w-8 h-8" />,
    color: "#FFD700",
    bg: "linear-gradient(135deg, #B8860B 0%, #FFD700 50%, #FFFACD 100%)",
    border: "border-yellow-500/30",
    text: "text-yellow-50",
    glow: "shadow-[0_0_30px_rgba(255,215,0,0.5)]",
  },
  PLATINUM: {
    name: "BẠCH KIM",
    icon: <Zap className="w-8 h-8" />,
    color: "#E5E4E2",
    bg: "linear-gradient(135deg, #2F4F4F 0%, #E5E4E2 50%, #F0F8FF 100%)",
    border: "border-cyan-200/30",
    text: "text-cyan-50",
    glow: "shadow-[0_0_40px_rgba(229,228,226,0.4)]",
  },
  DIAMOND: {
    name: "KIM CƯƠNG",
    icon: <Diamond className="w-8 h-8" />,
    color: "#B9F2FF",
    bg: "linear-gradient(135deg, #00CED1 0%, #B9F2FF 50%, #F0FFFF 100%)",
    border: "border-white/50",
    text: "text-white",
    glow: "shadow-[0_0_50px_rgba(185,242,255,0.6)]",
  },
  ADMIN: {
    name: "ADMINISTRATOR",
    icon: <Shield className="w-8 h-8 text-white" />,
    color: "#E50914",
    bg: "linear-gradient(135deg, #831010 0%, #E50914 50%, #FF0000 100%)",
    border: "border-red-500/50",
    text: "text-white",
    glow: "shadow-[0_0_40px_rgba(229,9,20,0.6)]",
  },
};

const MembershipCard: React.FC<MembershipCardProps> = ({
  rank,
  fullName,
  totalSpending,
}) => {
  const config = rankConfigs[rank.toUpperCase()] || rankConfigs.BRONZE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, rotateY: 5 }}
      transition={{ duration: 0.5 }}
      style={{ background: config.bg }}
      className={`relative w-full max-w-md h-56 rounded-2xl p-6 ${config.border} border-2 ${config.glow} overflow-hidden flex flex-col justify-between group cursor-default`}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p
            className={`text-xs font-bold tracking-widest ${config.text} opacity-80 uppercase`}
          >
            Member Privilege
          </p>
          <div className="flex items-center gap-2">
            <span className={config.text}>{config.icon}</span>
            <h3 className={`text-2xl font-black ${config.text} italic`}>
              {config.name}
            </h3>
          </div>
        </div>
        <div className="w-12 h-8 bg-black/20 rounded flex items-center justify-center border border-white/20">
          <span className="text-[8px] text-white/60 font-mono">CHIP 256</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col">
          <p
            className={`text-[10px] ${config.text} opacity-70 uppercase tracking-tighter`}
          >
            Customer Name
          </p>
          <p
            className={`text-xl font-semibold ${config.text} uppercase truncate`}
          >
            {fullName}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <p
              className={`text-[10px] ${config.text} opacity-70 uppercase tracking-tighter`}
            >
              Total Spending
            </p>
            <p className={`text-lg font-mono tracking-wider ${config.text}`}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalSpending)}
            </p>
          </div>
          <p className={`text-[10px] ${config.text} opacity-60 font-mono`}>
            VALID UNTIL 12/26
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MembershipCard;
