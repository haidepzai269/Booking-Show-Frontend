import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  isFloatingVisible: boolean;
  isOpen: boolean;
  setFloatingVisible: (visible: boolean) => void;
  setOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isFloatingVisible: true,
      isOpen: false,
      setFloatingVisible: (visible) => set({ isFloatingVisible: visible }),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ isFloatingVisible: state.isFloatingVisible }), // Chỉ persist isFloatingVisible
    }
  )
);
