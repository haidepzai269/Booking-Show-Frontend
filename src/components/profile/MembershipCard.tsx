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
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 50 });
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 50, y: 50 });
  };

  // Holographic overlay styles
  const isHighRank = ["GOLD", "PLATINUM", "DIAMOND", "ADMIN"].includes(rank.toUpperCase());

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotateY: (mousePos.x - 50) / 4,
        rotateX: (50 - mousePos.y) / 4,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 1 }}
      style={{ 
        background: config.bg,
        transformStyle: "preserve-3d",
      }}
      className={`relative w-full max-w-md h-56 rounded-2xl p-7 ${config.border} border-2 ${config.glow} overflow-hidden flex flex-col justify-between group cursor-default transition-shadow duration-300`}
    >
      {/* Holographic Flare Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
          mixBlendMode: "overlay"
        }}
      />

      {/* Rainbow Foil Effect (For high ranks) */}
      {isHighRank && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-700 z-0"
          style={{
            background: `linear-gradient(${mousePos.x + mousePos.y}deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)`,
            backgroundSize: "200% 200%",
            backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
            mixBlendMode: "color-dodge",
          }}
        />
      )}

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

      <div className="flex justify-between items-start relative z-20" style={{ transform: "translateZ(30px)" }}>
        <div className="space-y-1">
          <p
            className={`text-[10px] font-black tracking-[0.3em] ${config.text} opacity-60 uppercase`}
          >
            Membership Card
          </p>
          <div className="flex items-center gap-3">
            <span className={`${config.text} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}>{config.icon}</span>
            <h3 className={`text-2xl font-black ${config.text} italic tracking-tighter`}>
              {config.name}
            </h3>
          </div>
        </div>
        <div className="w-12 h-9 bg-black/40 rounded-lg flex items-center justify-center border border-white/20 backdrop-blur-md overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-yellow-500/40 via-yellow-200/20 to-yellow-600/40 flex items-center justify-center">
             <span className="text-[7px] text-white/90 font-mono font-bold leading-none text-center">SECURE<br/>CHIP</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-20" style={{ transform: "translateZ(40px)" }}>
        <div className="flex flex-col">
          <p
            className={`text-[9px] ${config.text} opacity-50 uppercase font-black tracking-widest`}
          >
            Card Holder
          </p>
          <p
            className={`text-2xl font-black ${config.text} uppercase truncate drop-shadow-lg`}
          >
            {fullName}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <p
              className={`text-[9px] ${config.text} opacity-50 uppercase font-black tracking-widest`}
            >
              Accumulated
            </p>
            <p className={`text-xl font-mono font-black tracking-[0.1em] ${config.text} drop-shadow-md`}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalSpending)}
            </p>
          </div>
          <div className="flex flex-col items-end">
             <p className={`text-[8px] ${config.text} opacity-50 font-black uppercase tracking-widest mb-1`}>Expires</p>
             <p className={`text-[10px] ${config.text} opacity-90 font-mono font-bold bg-black/20 px-2 py-0.5 rounded`}>
                12 / 26
             </p>
          </div>
        </div>
      </div>

      {/* Reflection shine scanning */}
      <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] group-hover:left-[150%] transition-all duration-1000 ease-in-out pointer-events-none z-30" />
    </motion.div>
  );
};

export default MembershipCard;
