"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
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

        <div className="relative">
          <span className="material-symbols-outlined text-on-surface-variant p-2 glass-card rounded-full cursor-pointer hover:text-primary hover:border-primary/40 transition-all text-[20px]">
            notifications
          </span>
          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-primary-container rounded-full neon-glow border-2 border-background"></span>
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
