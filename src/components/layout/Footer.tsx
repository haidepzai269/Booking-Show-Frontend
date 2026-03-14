"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Info,
  Tag,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type Tab = "features" | "pricing" | "about" | "";

export default function Footer() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTab = (tab: Tab) => {
    setActiveTab(activeTab === tab ? "" : tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "features":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold text-white mb-2">{mounted ? t('footer.feature_1_title') : '...'}</h4>
              <p className="text-sm">{mounted ? t('footer.feature_1_desc') : '...'}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold text-white mb-2">{mounted ? t('footer.feature_2_title') : '...'}</h4>
              <p className="text-sm">{mounted ? t('footer.feature_2_desc') : '...'}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold text-white mb-2">{mounted ? t('footer.feature_3_title') : '...'}</h4>
              <p className="text-sm">{mounted ? t('footer.feature_3_desc') : '...'}</p>
            </div>
          </div>
        );
      case "pricing":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1a1c23] p-6 rounded-2xl border border-white/10 text-center">
              <h4 className="text-gray-400 font-bold uppercase text-xs mb-2">Standard</h4>
              <p className="text-3xl font-black text-white">80.000đ</p>
            </div>
            <div className="bg-primary/20 p-6 rounded-2xl border border-primary/40 text-center">
              <h4 className="text-primary font-bold uppercase text-xs mb-2">VIP</h4>
              <p className="text-3xl font-black text-white">150.000đ</p>
            </div>
            <div className="bg-[#1a1c23] p-6 rounded-2xl border border-white/10 text-center">
              <h4 className="text-gray-400 font-bold uppercase text-xs mb-2">Combo</h4>
              <p className="text-sm text-gray-400">{t('footer.pricing_combo')}</p>
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
