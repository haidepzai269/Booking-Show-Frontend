"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, Ticket, CheckCheck } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import type { AdminNotification } from "@/hooks/useAdminNotifications";

function formatRelativeTime(isoStr: string): string {
  try {
    const diff = Date.now() - new Date(isoStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  } catch {
    return "vừa xong";
  }
}

// Toast popup hiện ở góc phải dưới
function ToastNotification({
  notif,
  onClose,
}: {
  notif: AdminNotification;
  onClose: () => void;
}) {
  const duration = 8000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onClose]);

  return (
    <div className="relative group overflow-hidden flex items-start gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-[340px] animate-slide-in-right transform transition-all hover:scale-[1.02] hover:bg-white/15">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-2xl" />
      
      <div className="relative w-11 h-11 bg-[var(--primary)]/20 border border-[var(--primary)]/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
        <div className="absolute inset-0 bg-[var(--primary)]/10 animate-pulse rounded-xl" />
        <Ticket size={20} className="text-[var(--primary)] relative z-10" />
      </div>
      
      <div className="relative flex-1 min-w-0">
        <p className="text-white text-[15px] font-semibold leading-tight tracking-tight">
          {notif.user_name}
        </p>
        <p className="text-white/80 text-sm mt-1 leading-snug">
          Vừa mua <span className="text-[var(--primary)] font-bold">{notif.seats} vé</span>
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
             <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider truncate max-w-[120px]">
              {notif.movie_title}
            </p>
          </div>
          <p className="text-green-400 text-sm font-bold bg-green-400/10 px-2 py-0.5 rounded-md border border-green-400/20">
            +{notif.amount.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="relative w-8 h-8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all shrink-0 -mr-2 -mt-2"
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-[var(--primary)] transition-all ease-linear" 
           style={{ width: `${progress}%` }} />
    </div>
  );
}

export default function AdminNotification() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllRead, toastQueue, dismissToast } =
    useAdminNotifications();

  // Click outside đóng dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Đánh dấu đã đọc khi mở dropdown
      setTimeout(markAllRead, 1000);
    }
  };

  const formatTime = formatRelativeTime;

  return (
    <>
      {/* Toast Portal – góc phải dưới */}
      {toastQueue.length > 0 && (
        <div className="fixed bottom-4 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
          {toastQueue.slice(-3).map((n) => (
            <div key={n.id} className="pointer-events-auto">
              <ToastNotification notif={n} onClose={() => dismissToast(n.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Bell Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleOpen}
          className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all relative"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse shadow-[0_0_6px_rgba(229,9,20,0.8)]" />
          )}
        </button>

        {/* Dropdown */}
        <div
          className={`absolute right-0 mt-3 w-80 bg-[var(--bg-sidebar)] shadow-2xl rounded-xl z-50 overflow-hidden origin-top-right border border-[var(--border-color)] transition-all duration-300 ease-out ${
            isOpen
              ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
              : "opacity-0 scale-95 pointer-events-none -translate-y-2"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white font-medium text-sm">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={24} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                    !n.read ? "bg-white/[0.03]" : "opacity-70"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-[var(--primary)]/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Ticket size={14} className="text-[var(--primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 leading-snug">
                        <span className="font-medium text-white">
                          {n.user_name}
                        </span>{" "}
                        vừa mua{" "}
                        <span className="text-[var(--primary)] font-medium">
                          {n.seats} vé
                        </span>
                      </p>
                      <p className="text-xs text-white/50 truncate mt-0.5">
                        📽️ {n.movie_title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-green-400 font-medium">
                          +{n.amount.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-[10px] text-white/30">
                          {formatTime(n.created_at)}
                        </span>
                      </div>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-white/40 hover:text-white transition-colors flex items-center gap-1.5 mx-auto"
              >
                <CheckCheck size={12} />
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
