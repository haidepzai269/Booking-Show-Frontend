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
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="flex items-start gap-3 bg-[#1a1a1a] border border-[#e50914]/30 rounded-xl p-4 shadow-2xl w-80 animate-slide-in-right">
      <div className="w-9 h-9 bg-[#e50914]/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Ticket size={16} className="text-[#e50914]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-tight">
          🎟️ {notif.user_name} vừa mua {notif.seats} vé
        </p>
        <p className="text-white/50 text-xs mt-0.5 truncate">
          📽️ {notif.movie_title}
        </p>
        <p className="text-[#e50914] text-xs font-medium mt-1">
          +{notif.amount.toLocaleString("vi-VN")}đ
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-white/30 hover:text-white shrink-0 mt-0.5 transition-colors"
      >
        <X size={14} />
      </button>
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
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e50914] rounded-full animate-pulse shadow-[0_0_6px_rgba(229,9,20,0.8)]" />
          )}
        </button>

        {/* Dropdown */}
        <div
          className={`absolute right-0 mt-3 w-80 bg-[#1a1a1a] shadow-2xl rounded-xl z-50 overflow-hidden origin-top-right border border-white/10 transition-all duration-300 ease-out ${
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
                <span className="text-xs bg-[#e50914]/20 text-[#e50914] font-medium px-2 py-0.5 rounded-full">
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
                    <div className="w-8 h-8 bg-[#e50914]/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Ticket size={14} className="text-[#e50914]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 leading-snug">
                        <span className="font-medium text-white">
                          {n.user_name}
                        </span>{" "}
                        vừa mua{" "}
                        <span className="text-[#e50914] font-medium">
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
                      <div className="w-2 h-2 rounded-full bg-[#e50914] mt-2 shrink-0" />
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
