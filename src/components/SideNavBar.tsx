"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function CampusOSLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 5L90 28.1V74.4L50 95L10 74.4V28.1L50 5Z"
        stroke="#00e5ff"
        strokeWidth="6"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
      />
      <path
        d="M50 20L78 36.2V68.8L50 85L22 68.8V36.2L50 20Z"
        stroke="#7c0599"
        strokeWidth="4"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_8px_rgba(124,5,153,0.6)]"
      />
      <circle
        cx="50"
        cy="50"
        r="12"
        fill="#90fffe"
        className="drop-shadow-[0_0_12px_rgba(144,255,254,1)]"
      />
    </svg>
  );
}

export function SideNavBar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRole(data.data.role);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const allNavItems = [
    {
      name: "Dashboard",
      icon: "dashboard",
      href: "/dashboard",
      label: "System Core",
    },
    {
      name: "Attendance",
      icon: "calendar_today",
      href: "/attendance",
      label: "System Presence",
    },
    {
      name: "The Vault",
      icon: "military_tech",
      href: "/vault",
      label: "Achievements",
    },
    {
      name: "Leaderboard",
      icon: "leaderboard",
      href: "/leaderboard",
      label: "Hall of Fame",
    },
    {
      name: "Profile",
      icon: "person",
      href: "/profile",
      label: "Commander dossier",
    },
    {
      name: "Missions",
      icon: "assignment",
      href: "/missions",
      label: "Missions control",
    },
    {
      name: "AI Command",
      icon: "smart_toy",
      href: "/ai-command",
      label: "Academic Intel",
    },
    {
      name: "Course Mgmt",
      icon: "library_books",
      href: "/courses-admin",
      label: "Syllabus Registry",
    },
    {
      name: "Departments",
      icon: "domain",
      href: "/departments-admin",
      label: "Divisions",
    },
    {
      name: "Admin Portal",
      icon: "admin_panel_settings",
      href: "/admin",
      label: "System Mgmt",
    },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.name === "AI Command" && role !== "student") return false;
    if (item.name === "Admin Portal" && role !== "admin") return false;
    if (item.name === "Course Mgmt" && role === "student") return false;
    if (item.name === "Departments" && role !== "admin") return false;
    if (item.name === "The Vault" && role === "admin") return false;
    return true;
  });

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest/80 backdrop-blur-xl border-r border-outline-variant flex flex-col py-8 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <CampusOSLogo className="w-10 h-10" />
        <div>
          <span className="font-geist font-extrabold text-[20px] tracking-tight bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            CAMPUSOS
          </span>
          <p className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest leading-none">
            Student OS v1.5
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-3 transition-all font-medium border-l-2 ${
                isActive
                  ? "text-primary border-primary bg-primary/10"
                  : "text-on-surface-variant border-transparent hover:text-primary hover:border-primary hover:bg-primary/5"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <div className="flex flex-col">
                <span className="font-geist text-sm font-semibold tracking-wide leading-tight">
                  {item.name}
                </span>
                <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider leading-none">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pt-4 border-t border-outline-variant space-y-3">
        <Link
          className="flex items-center gap-4 text-on-surface-variant font-medium hover:text-primary transition-all text-xs"
          href="/support"
        >
          <span className="material-symbols-outlined text-[18px]">contact_support</span>
          <span className="font-mono uppercase tracking-wider">Support</span>
        </Link>
      </div>
    </aside>
  );
}
