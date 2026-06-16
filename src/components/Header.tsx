"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setNotifications(json.data.notifications);
            setUnreadCount(json.data.unreadCount);
          }
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const markAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="font-geist text-[32px] font-semibold text-on-surface tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-on-surface-variant text-sm font-medium italic opacity-85 mt-1">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="material-symbols-outlined text-on-surface-variant p-2 glass-card rounded-full cursor-pointer hover:text-primary hover:border-primary/40 transition-all text-[20px] select-none"
        >
          {theme === "dark" ? "light_mode" : "dark_mode"}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="material-symbols-outlined text-on-surface-variant p-2 glass-card rounded-full cursor-pointer hover:text-primary hover:border-primary/40 transition-all text-[20px] relative flex items-center justify-center"
          >
            notifications
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full neon-glow border-2 border-background"></span>
            )}
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden glass-card">
              <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest/50">
                <h3 className="font-geist font-bold text-sm text-on-surface">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAsRead} className="text-[10px] font-mono text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant text-xs italic">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div key={notif._id} className={`p-3 rounded-xl flex gap-3 items-start transition-all ${notif.isRead ? 'opacity-70 hover:bg-surface-container-highest/30' : 'bg-primary/5 border border-primary/10'}`}>
                      <span className={`material-symbols-outlined text-[16px] mt-0.5 ${notif.isRead ? 'text-on-surface-variant' : 'text-primary'}`}>
                        {notif.type === 'System' ? 'info' : 'notifications_active'}
                      </span>
                      <div>
                        <h4 className={`text-xs font-semibold ${notif.isRead ? 'text-on-surface-variant' : 'text-on-surface'}`}>{notif.title}</h4>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
        <Link
          href="/"
          className="px-6 py-2 bg-white/5 border border-primary/20 text-primary font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all"
        >
          Log Out
        </Link>
      </div>
    </header>
  );
}
