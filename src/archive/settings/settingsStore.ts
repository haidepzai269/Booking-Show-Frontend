import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/lib/i18n';
import { apiClient } from '@/lib/api';

interface SettingsState {
  theme: string;
  language: string;
  isSynced: boolean;
  setTheme: (theme: string) => void;
  setLanguage: (language: string) => void;
  syncWithBackend: (theme: string, language: string) => void;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'vi',
      isSynced: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
      syncWithBackend: (theme, language) => {
        i18n.changeLanguage(language);
        set({ theme, language, isSynced: true });
      },
      fetchSettings: async () => {
        try {
          const res = await apiClient.get('/user/settings');
          if (res && (res as any).theme && (res as any).language) {
            const data = res as any;
            const current = get();
            
            // Chỉ cập nhật nếu có sự thay đổi thực tế
            if (current.theme !== data.theme || current.language !== data.language) {
              i18n.changeLanguage(data.language);
              set({ theme: data.theme, language: data.language, isSynced: true });
            } else if (!current.isSynced) {
              set({ isSynced: true });
            }
          }
        } catch (error) {
          console.error('Failed to fetch settings:', error);
        }
      },
    }),
    {
      name: 'user-settings',
    }
  )
);
