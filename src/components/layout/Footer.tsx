"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Layers,
  Tag,
  Info
} from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? "" : tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "features":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Layers className="w-4 h-4 text-primary"/> {mounted ? t('footer.fast_booking') : 'Đặt vé nhanh'}</h4>
              <p className="text-xs">{mounted ? t('footer.fast_booking_desc') : '...'}</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary"/> AI Assistant</h4>
              <p className="text-xs">{mounted ? t('footer.ai_desc') : '...'}</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-primary"/> Multi-language</h4>
              <p className="text-xs">{mounted ? t('footer.lang_desc') : '...'}</p>
            </div>
          </div>
        );
      case "pricing":
        return (
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 text-gray-300">
             <div className="text-center">
                <span className="text-5xl font-black text-white">85K</span>
                <p className="text-xs mt-2 uppercase tracking-widest">{mounted ? t('footer.standard_ticket') : 'Vé thường'}</p>
             </div>
             <div className="w-px h-12 bg-white/10 hidden md:block"></div>
             <div className="text-center">
                <span className="text-5xl font-black text-primary">120K</span>
                <p className="text-xs mt-2 uppercase tracking-widest">{mounted ? t('footer.vip_ticket') : 'Vé VIP'}</p>
             </div>
          </div>
        );
      case "about":
        return (
          <div className="flex flex-col md:flex-row items-center gap-10 text-gray-300">
            <div>
              <h3 className="text-3xl font-black text-white mb-4">
                {mounted ? t('footer.about_title') : 'Về'} <span className="text-primary">BookingShow</span>
              </h3>
              <p className="text-sm leading-loose">{mounted ? t('footer.about_desc') : '...'}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="w-full bg-[#1c1d21] relative z-20">
      {activeTab && (
        <div className="w-full border-t border-primary/20 bg-[#16171a] py-10">
          <div className="max-w-7xl mx-auto px-4 px-8 relative">
            <button onClick={() => setActiveTab("")} className="absolute top-0 right-4 text-gray-400 hover:text-white">X</button>
            {renderTabContent()}
          </div>
        </div>
      )}

      <div className="w-full border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-500 text-sm md:w-1/3 text-center md:text-left">&copy; 2025 BookingShow.</div>
          <div className="md:w-1/3 flex justify-center">
            <Link href="/" className="text-2xl font-black text-white tracking-widest hover:text-primary transition-colors">BookingShow</Link>
          </div>
          <nav className="flex items-center justify-end gap-4 md:w-1/3">
            <button onClick={() => toggleTab("features")} className="text-gray-400 hover:text-white flex items-center gap-1.5"><Layers className="w-4 h-4"/> {mounted ? t('footer.features') : 'Tính năng'}</button>
            <button onClick={() => toggleTab("pricing")} className="text-gray-400 hover:text-white flex items-center gap-1.5"><Tag className="w-4 h-4"/> {mounted ? t('footer.pricing') : 'Giá vé'}</button>
            <button onClick={() => toggleTab("about")} className="text-gray-400 hover:text-white flex items-center gap-1.5"><Info className="w-4 h-4"/> {mounted ? t('footer.about') : 'Về chúng tôi'}</button>
          </nav>
        </div>
      </div>
    </footer>
  );
}

// Helper icons specifically for footer if needed
const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

const Globe = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/></svg>
);
