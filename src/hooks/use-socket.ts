"use client";

import { useEffect, useState, useCallback } from "react";
import { getSocket, connectSocket, disconnectSocket, NotificationEvent } from "@/lib/socket";
import { useSession } from "next-auth/react";

export function useSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = connectSocket(session.user.id);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onNotification = (notification: NotificationEvent) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("notification", onNotification);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("notification", onNotification);
      disconnectSocket();
    };
  }, [session?.user?.id]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    isConnected,
    notifications,
    clearNotifications,
    markAsRead,
  };
}

// Hook for subscribing to specific events
export function useSocketEvent<T>(event: string, callback: (data: T) => void) {
  useEffect(() => {
    const socket = getSocket();

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
}
