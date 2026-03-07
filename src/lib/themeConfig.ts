export type ThemeType = 'dark' | 'midnight' | 'light' | 'emerald';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  bgMain: string;
  bgSidebar: string;
  bgCard: string;
  bgHeader: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  chartGradStart: string;
  chartGradEnd: string;
}

export const themes: Record<ThemeType, ThemeColors> = {
  dark: {
    primary: '#e50914',
    primaryHover: '#b80710',
    bgMain: '#0d0d0d',
    bgSidebar: '#111111',
    bgCard: 'rgba(255, 255, 255, 0.03)',
    bgHeader: 'rgba(13, 13, 13, 0.8)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    chartGradStart: '#e50914',
    chartGradEnd: 'rgba(229, 9, 20, 0)',
  },
  midnight: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    bgMain: '#020617',
    bgSidebar: '#0f172a',
    bgCard: 'rgba(30, 41, 59, 0.5)',
    bgHeader: 'rgba(2, 6, 23, 0.8)',
    textPrimary: '#f8fafc',
    textSecondary: 'rgba(148, 163, 184, 0.8)',
    borderColor: 'rgba(51, 65, 85, 0.5)',
    chartGradStart: '#0ea5e9',
    chartGradEnd: 'rgba(14, 165, 233, 0)',
  },
  light: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    bgMain: '#f8fafc',
    bgSidebar: '#ffffff',
    bgCard: '#ffffff',
    bgHeader: 'rgba(248, 250, 252, 0.8)',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    borderColor: '#e2e8f0',
    chartGradStart: '#6366f1',
    chartGradEnd: 'rgba(99, 102, 241, 0)',
  },
  emerald: {
    primary: '#10b981',
    primaryHover: '#059669',
    bgMain: '#064e3b',
    bgSidebar: '#065f46',
    bgCard: 'rgba(6, 78, 59, 0.6)',
    bgHeader: 'rgba(6, 78, 59, 0.8)',
    textPrimary: '#ecfdf5',
    textSecondary: 'rgba(167, 243, 208, 0.7)',
    borderColor: 'rgba(20, 184, 166, 0.2)',
    chartGradStart: '#10b981',
    chartGradEnd: 'rgba(16, 185, 129, 0)',
  },
};
