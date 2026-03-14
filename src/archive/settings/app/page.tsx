'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const themes = [
  { id: 'light', name: 'Light', icon: Sun },
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'system', name: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme: currentTheme, setTheme } = useTheme();
  const { language, setLanguage, syncWithBackend } = useSettingsStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch settings from backend if authenticated
    if (user) {
      apiClient.get('/user/settings').then((res: any) => {
        if (res.theme && res.language) {
          syncWithBackend(res.theme, res.language);
          setTheme(res.theme);
        }
      });
    }
  }, [user, syncWithBackend, setTheme]);

  const handleUpdateSettings = async (newTheme?: string, newLang?: string) => {
    const updatedTheme = newTheme || currentTheme || 'dark';
    const updatedLang = newLang || language;

    if (newTheme) {
      setTheme(newTheme);
      useSettingsStore.getState().setTheme(newTheme);
    }
    if (newLang) {
      setLanguage(newLang);
    }

    if (user) {
      setSaving(true);
      try {
        await apiClient.patch('/user/settings', {
          theme: updatedTheme,
          language: updatedLang,
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.error('Failed to save settings', error);
      } finally {
        setSaving(false);
      }
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary"
        >
          {t('settings.title')}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-foreground/60 mt-2"
        >
          {t('settings.description')}
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
        {/* Theme Bento Box */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="md:col-span-2 row-span-2 glass-card rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group"
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-secondary" />
              {t('common.theme')}
            </h2>
            <p className="text-foreground/50 mt-1 max-w-sm">
              {t('settings.theme_description')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 relative z-10 mt-8">
            {themes.map((tItem) => {
              const Icon = tItem.icon;
              const isActive = currentTheme === tItem.id;
              return (
                <button
                  key={tItem.id}
                  onClick={() => handleUpdateSettings(tItem.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all duration-300 relative overflow-hidden",
                    isActive 
                      ? "bg-primary/20 text-primary border-primary/40 neon-shadow-primary" 
                      : "bg-foreground/5 hover:bg-foreground/10 border-transparent border"
                  )}
                >
                  <Icon className={cn("w-8 h-8 transition-transform duration-500", isActive && "scale-110")} />
                  <span className="font-medium">{t(`common.${tItem.id}`)}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-theme" 
                      className="absolute inset-0 border-2 border-primary rounded-2xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
        </motion.div>

        {/* Language Bento Box */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="md:col-span-1 row-span-2 glass-card rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group"
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="w-6 h-6 text-secondary" />
              {t('common.language')}
            </h2>
            <p className="text-foreground/50 mt-1">
              {t('settings.language_description')}
            </p>
          </div>

          <div className="flex flex-col gap-3 relative z-10 mt-6">
            {languages.map((lang) => {
              const isActive = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleUpdateSettings(undefined, lang.code)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-all duration-300 group/item",
                    isActive 
                      ? "bg-secondary/20 text-secondary border-secondary/40 neon-shadow-secondary" 
                      : "bg-foreground/5 hover:bg-foreground/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </div>
                  {isActive && <CheckCircle2 className="w-5 h-5" />}
                </button>
              );
            })}
          </div>

          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700" />
        </motion.div>

        {/* Account Sync Card (Conditional) */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-3 glass-dark border-secondary/30 rounded-3xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/20 rounded-2xl">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('settings.sync_guest')}</h3>
                <p className="text-foreground/60 text-sm">Đăng nhập để lưu cài đặt này vĩnh viễn.</p>
              </div>
            </div>
            <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
              Đăng nhập ngay
            </button>
          </motion.div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] glass-dark border-primary/30 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl"
          >
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold">
              {user ? t('common.sync_success') : t('common.save_success')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .glass-card {
          background: ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
        }
        .glass-dark {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
