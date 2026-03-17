"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";

export interface AdminNotification {
  id: string; // local unique id
  type: string;
  order_id: string;
  user_name: string;
  movie_title: string;
  amount: number;
  seats: number;
  created_at: string;
  read: boolean;
}

const MAX_NOTIFICATIONS = 20;

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [toastQueue, setToastQueue] = useState<AdminNotification[]>([]);
  const { token } = useAuthStore();
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use function declaration for hoisting/recursive calls
  const connectSse = useCallback(() => {
    function connect() {
      if (!token || typeof window === "undefined") return;

      // Đóng connection cũ nếu có
      if (esRef.current) {
        esRef.current.close();
      }

      const BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const url = `${BASE_URL}/admin/notifications/stream?token=${token}`;
      const es = new EventSource(url);

      esRef.current = es;

      es.addEventListener("notification", (e) => {
        try {
          const data = JSON.parse(e.data) as Omit<
            AdminNotification,
            "id" | "read"
          >;
          const notif: AdminNotification = {
            ...data,
            id: `${data.order_id}-${Date.now()}`,
            read: false,
          };
          setNotifications((prev) => {
            const updated = [notif, ...prev];
            return updated.slice(0, MAX_NOTIFICATIONS);
          });
          setToastQueue((prev) => [...prev, notif]);
        } catch {
          // ignore parse errors
        }
      });

      es.onerror = () => {
        es.close();
        // Auto reconnect sau 5s
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

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToastQueue((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAllRead, toastQueue, dismissToast };
}
