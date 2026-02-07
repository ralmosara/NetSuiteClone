"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useSocket } from "@/hooks/use-socket";

interface DisplayNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string | null;
  isRealTime?: boolean;
}

const getNotificationIcon = (type: string) => {
  const icons: Record<string, { icon: string; color: string; bg: string }> = {
    order: { icon: "shopping_cart", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    payment: { icon: "payments", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    inventory: { icon: "inventory_2", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    support: { icon: "support_agent", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    system: { icon: "settings", color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-800" },
    approval: { icon: "task_alt", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
    alert: { icon: "warning", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
    info: { icon: "info", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    warning: { icon: "warning", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    success: { icon: "check_circle", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    error: { icon: "error", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  };
  return icons[type] || icons.info;
};

function formatTimestamp(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString();
}

function isHighPriority(type: string): boolean {
  return ["alert", "approval", "error", "warning"].includes(type);
}

export function NotificationCenter() {
  const [activeTab, setActiveTab] = useState("all");
  const [open, setOpen] = useState(false);

  // Fetch notifications from the database
  const { data: dbNotifications, isLoading } = trpc.auth.getNotifications.useQuery(
    { limit: 30 },
    { refetchInterval: 60000 }
  );
  const { data: unreadData } = trpc.auth.getUnreadNotificationCount.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );

  const utils = trpc.useUtils();

  const markReadMutation = trpc.auth.markNotificationRead.useMutation({
    onSuccess: () => {
      utils.auth.getNotifications.invalidate();
      utils.auth.getUnreadNotificationCount.invalidate();
    },
  });

  const markAllReadMutation = trpc.auth.markAllNotificationsRead.useMutation({
    onSuccess: () => {
      utils.auth.getNotifications.invalidate();
      utils.auth.getUnreadNotificationCount.invalidate();
    },
  });

  // Get real-time notifications from socket (supplement to DB)
  const { isConnected, notifications: socketNotifications, markAsRead: socketMarkAsRead, clearNotifications } = useSocket();

  // Combine DB notifications with real-time socket notifications
  const allNotifications: DisplayNotification[] = useMemo(() => {
    const dbIds = new Set((dbNotifications || []).map((n: any) => n.id));

    // Socket notifications that aren't yet in the DB
    const realTimeNotifs: DisplayNotification[] = socketNotifications
      .filter((n) => !dbIds.has(n.id))
      .map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: formatTimestamp(n.createdAt),
        read: false,
        link: n.link,
        isRealTime: true,
      }));

    // DB notifications
    const dbNotifs: DisplayNotification[] = (dbNotifications || []).map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: formatTimestamp(n.createdAt),
      read: n.isRead,
      link: n.link,
    }));

    return [...realTimeNotifs, ...dbNotifs];
  }, [dbNotifications, socketNotifications]);

  const unreadCount = (unreadData?.count ?? 0) + socketNotifications.filter((n) => !(dbNotifications || []).some((d: any) => d.id === n.id)).length;

  const filteredNotifications = allNotifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    if (activeTab === "order") return n.type === "order";
    if (activeTab === "approval") return n.type === "approval";
    return true;
  });

  const markAsRead = (id: string) => {
    // If it's a socket-only notification, just remove from socket
    const isSocketOnly = socketNotifications.some((n) => n.id === id) &&
      !(dbNotifications || []).some((d: any) => d.id === id);
    if (isSocketOnly) {
      socketMarkAsRead(id);
      return;
    }
    // Otherwise mark as read in the database
    markReadMutation.mutate({ id });
  };

  const markAllAsRead = () => {
    markAllReadMutation.mutate();
    clearNotifications();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {isConnected && (
            <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500" title="Real-time connected" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {isConnected && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-[10px]">
                Live
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary/80"
              onClick={markAllAsRead}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-2 pt-2">
            <TabsList className="w-full grid grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="order" className="text-xs">Orders</TabsTrigger>
              <TabsTrigger value="approval" className="text-xs">Approvals</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="size-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-slate-400">notifications_off</span>
                  </div>
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => {
                    const iconConfig = getNotificationIcon(notification.type);
                    const hasLink = !!notification.link;
                    const NotificationWrapper = hasLink ? Link : "div";

                    return (
                      <NotificationWrapper
                        key={notification.id}
                        href={notification.link || "#"}
                        className={cn(
                          "flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                          !notification.read && "bg-primary/5",
                          notification.isRealTime && !notification.read && "border-l-2 border-l-primary"
                        )}
                        onClick={() => {
                          if (!notification.read) markAsRead(notification.id);
                        }}
                      >
                        <div className={cn("size-10 rounded-full flex items-center justify-center flex-shrink-0", iconConfig.bg)}>
                          <span className={cn("material-symbols-outlined text-[20px]", iconConfig.color)}>
                            {iconConfig.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-sm font-medium truncate", !notification.read && "text-primary")}>
                              {notification.title}
                            </p>
                            <div className="flex gap-1 shrink-0">
                              {notification.isRealTime && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
                                  New
                                </Badge>
                              )}
                              {isHighPriority(notification.type) && !notification.read && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-[10px]">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="size-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        )}
                      </NotificationWrapper>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="border-t p-2">
          <Link href="/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full text-sm">
              View all notifications
              <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
