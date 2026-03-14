import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  isFloatingVisible: boolean;
  setFloatingVisible: (visible: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isFloatingVisible: true,
      setFloatingVisible: (visible) => set({ isFloatingVisible: visible }),
    }),
    {
      name: 'chat-storage',
    }
  )
);
