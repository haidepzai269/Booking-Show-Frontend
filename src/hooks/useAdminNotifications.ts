"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";

export interface AdminNotification {
  id: number | string;
  type: string;
  order_id: string;
  user_name: string;
  movie_title: string;
  amount: number;
  seats: number;
  created_at: string;
  is_read: boolean;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [toastQueue, setToastQueue] = useState<AdminNotification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { token } = useAuthStore();
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial notifications from API
  const fetchNotifications = useCallback(async (p: number, isLoadMore = false) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/notifications?page=${p}&limit=10`) as any;
      if (res.success) {
        const newData = res.data as AdminNotification[];
        if (isLoadMore) {
          setNotifications(prev => [...prev, ...newData]);
        } else {
          setNotifications(newData);
        }
        setHasMore(newData.length === 10);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  const connectSse = useCallback(() => {
    function connect() {
      if (!token || typeof window === "undefined") return;

      if (esRef.current) {
        esRef.current.close();
      }

      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const url = `${BASE_URL}/admin/notifications/stream?token=${token}&t=${Date.now()}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("notification", (e) => {
        try {
          const rawData = JSON.parse(e.data);
          
          if (rawData.type === "room_updated") {
             window.dispatchEvent(new CustomEvent("room-updated", { detail: rawData }));
             return;
          }

          if (rawData.type !== "order_completed") return;

          const notif: AdminNotification = {
            ...rawData,
            id: `temp-${Date.now()}`, // Temporary ID for real-time until refresh
            is_read: false,
          };

          setNotifications((prev) => {
            if (prev.some((n) => n.order_id === rawData.order_id)) return prev;
            return [notif, ...prev];
          });
          
          setToastQueue((prev) => {
            if (prev.some((n) => n.order_id === rawData.order_id)) return prev;
            return [...prev, notif];
          });

          window.dispatchEvent(new CustomEvent("admin-notification", { detail: notif }));
        } catch (err) {
          console.error("SSE Parse Error:", err);
        }
      });

      es.onerror = () => {
        es.close();
        reconnectTimerRef.current = setTimeout(() => connect(), 5000);
      };
    }
    connect();
  }, [token]);

  useEffect(() => {
    connectSse();
    return () => {
      esRef.current?.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [connectSse]);

  const markAllRead = useCallback(async () => {
    try {
      await apiClient.put("/admin/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number | string) => {
    if (typeof id === 'string' && id.startsWith('temp-')) {
       setNotifications(prev => prev.filter(n => n.id !== id));
       return;
    }
    try {
      await apiClient.delete(`/admin/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await apiClient.delete("/admin/notifications/all");
      setNotifications([]);
      setHasMore(false);
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  }, []);

  const dismissToast = useCallback((id: number | string) => {
    setToastQueue((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { 
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
  };
}
