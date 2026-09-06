"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  Search,
  Bell,
  CheckCheck,
  UserCheck,
  FileText,
  CalendarCheck,
  Award,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { UserDropdown } from "./user-dropdown";
import {
  getEmployeeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/app/lib/notifications/actions";

interface TopNavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image_url: string | null;
  };
}

export function TopNavbar({ user }: TopNavbarProps) {
  const isManagement = user.role === "admin" || user.role === "manager";

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();
  const popoverRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      if (!user.id) return;
      setIsLoading(true);
      const data = await getEmployeeNotifications(user.id);
      if (isMounted) {
        setNotifications(data);
        setIsLoading(false);
      }
    }

    fetchNotifications();
 
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user.id]);
 
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  const handleMarkAsRead = (id: string, isAlreadyRead: boolean) => {
    if (isAlreadyRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    startTransition(async () => {
      await markNotificationAsRead(id);
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    startTransition(async () => {
      await markAllNotificationsAsRead(user.id);
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "review":
        return <Award className="w-4 h-4 text-purple-600" />;
      case "feedback":
      case "profile":
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case "request":
        return <CalendarCheck className="w-4 h-4 text-blue-600" />;
      case "document":
      default:
        return <FileText className="w-4 h-4 text-amber-600" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diff = Math.floor(
      (new Date().getTime() - new Date(isoString).getTime()) / 60000,
    );
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm backdrop-blur-md bg-white">
       
      <div className="flex flex-col text-left">
        <h2 className="text-base font-bold text-slate-900 leading-tight tracking-tight">
          {isManagement ? "Dashboard" : "Workspace"}
        </h2>
        <p className="text-[11px] text-slate-400 font-medium hidden sm:block mt-0.5">
          {isManagement
            ? "Workforce overview and pending approvals at a glance"
            : "Your operational dashboard shell updates"}
        </p>
      </div>
 
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#009473] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search employees, requests, documents..."
            className="w-full pl-9 pr-14 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#009473] focus:ring-2 focus:ring-[#eaf8f5] transition-all"
          />
        </div>
      </div>
 
      <div className="flex items-center gap-4 ml-auto md:ml-0" ref={popoverRef}> 
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="View notifications"
            className={`relative p-2 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none cursor-pointer ${
              isNotificationsOpen
                ? "bg-slate-100 text-slate-800"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white border-2 border-white ring-1 ring-rose-100 shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
 
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-8 flex items-center justify-center text-slate-400 gap-2 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    Loading updates...
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkAsRead(item.id, item.read)}
                      className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${
                        item.read
                          ? "bg-white opacity-75 hover:opacity-100"
                          : "bg-slate-50/60 hover:bg-slate-50"
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs shrink-0">
                        {getNotificationIcon(item.type)}
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs ${
                              item.read
                                ? "font-semibold text-slate-700"
                                : "font-bold text-slate-900"
                            }`}
                          >
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {formatTimeAgo(item.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {item.message}
                        </p>
                      </div>

                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No notifications right now.
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <a
                  href="/my-profile/notifications"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition"
                >
                  View Activity History
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
 
        <div className="h-6 w-px bg-slate-100 hidden sm:block" />
 
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
