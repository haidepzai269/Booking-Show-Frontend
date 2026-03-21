import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, X, Ticket, CheckCheck, Trash2, ChevronDown, Loader2 } from "lucide-react";
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

// Nhóm thông báo theo ngày
function groupNotifications(notifs: AdminNotification[]) {
  const groups: { [key: string]: AdminNotification[] } = {
    "Hôm nay": [],
    "Hôm qua": [],
    "Trước đó": [],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifs.forEach((n) => {
    const d = new Date(n.created_at);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) {
      groups["Hôm nay"].push(n);
    } else if (d.getTime() === yesterday.getTime()) {
      groups["Hôm qua"].push(n);
    } else {
      groups["Trước đó"].push(n);
    }
  });

  return groups;
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
  const { 
    notifications, 
    unreadCount, 
    markAllRead, 
    toastQueue, 
    dismissToast,
    deleteNotification,
    clearAll,
    loadMore,
    hasMore,
    loading 
  } = useAdminNotifications();

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
      setTimeout(markAllRead, 1500);
    }
  };

  const grouped = useMemo(() => groupNotifications(notifications), [notifications]);
  const hasNotifications = notifications.length > 0;

  return (
    <>
      {/* Toast Portal */}
      {toastQueue.length > 0 && (
        <div className="fixed top-20 right-4 z-[9999] flex lg:hidden flex-col gap-3 pointer-events-none">
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
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div>
              <h3 className="text-white font-medium text-sm">Thông báo</h3>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mt-0.5">
                {unreadCount} chưa đọc
              </p>
            </div>
            {hasNotifications && (
              <button
                onClick={() => {
                   if(confirm("Xóa toàn bộ thông báo?")) clearAll();
                }}
                className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                title="Xóa tất cả"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {!hasNotifications ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-white/10" />
                </div>
                <p className="text-white/30 text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              Object.entries(grouped).map(([title, items]) => (
                items.length > 0 && (
                  <div key={title}>
                    <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{title}</span>
                    </div>
                    {items.map((n) => (
                      <div
                        key={n.id}
                        className={`group relative p-4 border-b border-white/5 hover:bg-white/[0.04] transition-colors ${
                          !n.is_read ? "bg-[var(--primary)]/[0.02]" : "opacity-80"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-[var(--primary)]/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                            <Ticket size={14} className="text-[var(--primary)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/90 leading-snug">
                              <span className="font-semibold text-white">
                                {n.user_name}
                              </span>{" "}
                              vừa mua{" "}
                              <span className="text-[var(--primary)] font-bold">
                                {n.seats} vé
                              </span>
                            </p>
                            <p className="text-[11px] text-white/40 truncate mt-0.5 italic">
                              📽️ {n.movie_title}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs text-green-400 font-bold bg-green-400/10 px-1.5 py-0.5 rounded">
                                +{n.amount.toLocaleString("vi-VN")}đ
                              </span>
                              <span className="text-[10px] text-white/20 font-medium">
                                {formatRelativeTime(n.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             {!n.is_read && (
                                <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                              )}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ))
            )}

            {/* Load More Button */}
            {hasMore && hasNotifications && (
              <div className="p-3 text-center border-t border-white/5">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Xem thêm thông báo cũ
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {hasNotifications && (
            <div className="p-3 bg-white/[0.04] border-t border-white/5 flex items-center justify-center">
              <button
                onClick={markAllRead}
                className="text-[11px] font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5"
              >
                <CheckCheck size={14} />
                ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
