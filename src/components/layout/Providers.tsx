'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <div className={mounted ? "opacity-100" : "opacity-0 transition-none"}>
        {children}
      </div>
    </I18nextProvider>
  );
}
