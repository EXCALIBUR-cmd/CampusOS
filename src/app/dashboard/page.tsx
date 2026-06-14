"use client";

import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";
import { XPProgress } from "@/components/XPProgress";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [hoveredData, setHoveredData] = useState<{ x: string; y: number } | null>(null);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<number[]>([]);
  const [rankings, setRankings] = useState<any[]>([
    { rank: "01", name: "Ace_Pilot", xp: "98.2k", isUser: false },
    { rank: "02", name: "NovaCore", xp: "94.1k", isUser: false },
    { rank: "03", name: "Flux_Zero", xp: "92.8k", isUser: false },
  ]);
  const [userRankRecord, setUserRankRecord] = useState<any>({
    rank: 12,
    name: "Commander Sterling",
    xp: "42.5k",
  });

  useEffect(() => {
    // Generate only on client side to prevent hydration mismatches
    setHeatmapData(Array.from({ length: 238 }, () => Math.floor(Math.random() * 5)));
    async function loadData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setDashboardData(json.data);
          }
        }

        const leaderRes = await fetch("/api/leaderboard");
        if (leaderRes.ok) {
          const leaderJson = await leaderRes.json();
          if (leaderJson.success && leaderJson.data) {
            const top3 = leaderJson.data.slice(0, 3).map((r: any) => ({
              rank: String(r.rank).padStart(2, "0"),
              name: r.name,
              xp: `${(r.xp / 1000).toFixed(1)}k`,
              isUser: r.isUser,
            }));
            if (top3.length > 0) {
              setRankings(top3);
            }

            const userRecord = leaderJson.data.find((r: any) => r.isUser);
            if (userRecord) {
              setUserRankRecord({
                rank: userRecord.rank,
                name: userRecord.name,
                xp: `${(userRecord.xp / 1000).toFixed(1)}k`,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { name: "Attendance", value: dashboardData?.metrics?.attendance ?? "92%", diff: "Optimal", border: "border-l-primary", text: "text-primary" },
    { name: "CGPA", value: dashboardData?.metrics?.cgpa ? dashboardData.metrics.cgpa.toFixed(1) : "3.8", diff: "Academic", border: "border-l-secondary", text: "text-secondary" },
    { name: "Assignments", value: dashboardData?.metrics?.pendingAssignments !== undefined ? String(dashboardData.metrics.pendingAssignments) : "12", diff: "Pending", border: "border-l-error", text: "text-error" },
    { name: "Productivity", value: "High", diff: "Active", border: "border-l-tertiary", text: "text-tertiary" },
  ];

  const commandLogs = [
    {
      id: 1,
      type: "submit",
      title: "Assignment Submitted",
      desc: "AI Ethics Module 4",
      xp: "+450 XP",
      time: "2 minutes ago",
      icon: "add_task",
      color: "text-primary border-primary bg-primary/20",
    },
    {
      id: 2,
      type: "achievement",
      title: "Achievement Unlocked",
      desc: "Perfect Attendance Streak",
      xp: "+1,200 XP",
      time: "1 hour ago",
      icon: "military_tech",
      color: "text-secondary border-secondary bg-secondary/20",
    },
    {
      id: 3,
      type: "level",
      title: "Level Calibrated",
      desc: "Reached Level 42",
      xp: "System Calibration Complete",
      time: "3 hours ago",
      icon: "settings_suggest",
      color: "text-tertiary border-tertiary bg-tertiary/20",
    },
  ];

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-surface-container-highest";
      case 1:
        return "bg-primary-container/20";
      case 2:
        return "bg-primary-container/40";
      case 3:
        return "bg-primary-container/70";
      case 4:
        return "bg-primary-container neon-glow";
      default:
        return "bg-surface-container-highest";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Side Navigation */}
      <SideNavBar />

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Header Row */}
        <Header title="System Core" subtitle="Operational Status: Optimal" />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Hero Card (Span 8) */}
          <section className="col-span-12 lg:col-span-8 glass-card p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[240px]">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <span
                  className="material-symbols-outlined text-secondary-fixed text-4xl text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <h2 className="font-geist text-2xl font-bold tracking-tight text-on-surface">
                  Welcome back, {dashboardData?.student?.name ? `Commander ${dashboardData.student.name}` : "Commander"}
                </h2>
              </div>
              <p className="text-on-surface-variant font-body-lg text-sm max-w-lg">
                Your academic trajectory is up 12% this month. The final guild project is due in 48 hours.
              </p>
            </div>
            <div className="relative z-10 mt-auto">
              <XPProgress 
                level={dashboardData?.metrics?.level ?? 1} 
                currentXp={dashboardData?.metrics?.xp ? (dashboardData.metrics.xp % 10000) : 0} 
                maxXp={10000} 
                streak={dashboardData?.metrics?.streak ?? 0} 
              />
            </div>
          </section>

          {/* Leaderboard Widget (Span 4) */}
          <aside className="col-span-12 lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col justify-between h-[240px] lg:h-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface">
                Global Rankings
              </h3>
              <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
            </div>
            <div className="space-y-3 flex-1">
              {rankings.map((r) => (
                <div
                  key={r.rank}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-mono text-tertiary">{r.rank}</span>
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-bold text-[10px]">
                      {r.name[0]}
                    </div>
                    <span className="font-sans text-on-surface">{r.name}</span>
                  </div>
                  <span className="font-mono text-on-surface-variant">{r.xp} XP</span>
                </div>
              ))}
              <div className="my-2 border-t border-dashed border-outline-variant"></div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5 font-mono text-primary font-bold">{userRankRecord.rank}</span>
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
                    {userRankRecord.name[0]}
                  </div>
                  <span className="font-sans text-on-surface font-bold">{userRankRecord.name}</span>
                </div>
                <span className="font-mono text-primary font-bold">{userRankRecord.xp} XP</span>
              </div>
            </div>
          </aside>

          {/* Analytics Row */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.name} className={`glass-card p-5 rounded-2xl border-l-4 ${s.border}`}>
                <p className="font-mono text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest">
                  {s.name}
                </p>
                <div className="flex items-end justify-between">
                  <h4 className="font-geist text-2xl font-bold text-on-surface">{s.value}</h4>
                  <span className={`${s.text} text-[11px] font-mono tracking-wider font-bold`}>
                    {s.diff}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Charts & Heatmap (Span 8) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Academic Performance Chart Container */}
            <div className="glass-card p-6 rounded-2xl h-[300px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface">
                  Academic Performance
                </h3>
                <div className="flex gap-4 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span className="font-mono text-on-surface-variant uppercase tracking-wider">
                      You
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                    <span className="font-mono text-on-surface-variant uppercase tracking-wider">
                      Class Avg
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full relative group">
                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                  {/* Background Grid Lines */}
                  <line stroke="#FFFFFF08" strokeWidth="0.5" x1="0" x2="400" y1="20" y2="20"></line>
                  <line stroke="#FFFFFF08" strokeWidth="0.5" x1="0" x2="400" y1="50" y2="50"></line>
                  <line stroke="#FFFFFF08" strokeWidth="0.5" x1="0" x2="400" y1="80" y2="80"></line>
                  <line stroke="#FFFFFF08" strokeWidth="0.5" x1="0" x2="400" y1="110" y2="110"></line>

                  {/* Class Average Line (Static) */}
                  <path
                    d="M0,85 Q60,70 120,80 T240,75 T360,82 L400,80"
                    fill="none"
                    stroke="#3b494c"
                    strokeDasharray="4"
                    strokeWidth="2"
                  ></path>

                  {/* User Performance Line (Gradient blue/purple glow) */}
                  <path
                    className="glow-rare cursor-pointer"
                    d="M0,90 Q60,50 120,65 T240,35 T360,25 L400,15"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                  ></path>

                  <defs>
                    <linearGradient id="lineGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" stopColor="#00daf3"></stop>
                      <stop offset="100%" stopColor="#f3aeff"></stop>
                    </linearGradient>
                  </defs>
                </svg>

                {/* Interactive Tooltip Simulator on Hover */}
                <div className="absolute top-8 left-[75%] -translate-x-1/2 -translate-y-1/2 glass-card px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border-primary/50 pointer-events-none">
                  <p className="font-mono text-[9px] text-primary uppercase tracking-widest">
                    Current Mastery
                  </p>
                  <p className="font-geist text-sm font-bold text-on-surface">94% (Grade A)</p>
                </div>
              </div>
            </div>

            {/* Contribution Heatmap */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface">
                  Contribution Activity
                </h3>
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                  Last 12 Months: 1,432 Actions
                </p>
              </div>
              <div className="flex flex-col gap-1 overflow-x-auto pb-2">
                <div className="flex gap-[3px] min-w-[650px] justify-between">
                  {/* Render 34 columns, each containing 7 rows */}
                  {Array.from({ length: 34 }).map((_, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }).map((_, rowIndex) => {
                        const intensity = heatmapData[colIndex * 7 + rowIndex];
                        return (
                          <div
                            key={rowIndex}
                            className={`heatmap-cell ${getHeatmapColor(intensity)}`}
                          ></div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
                  <span>Less</span>
                  <div className="flex gap-1.5">
                    <div className="heatmap-cell bg-surface-container-highest"></div>
                    <div className="heatmap-cell bg-primary-container/20"></div>
                    <div className="heatmap-cell bg-primary-container/40"></div>
                    <div className="heatmap-cell bg-primary-container/70"></div>
                    <div className="heatmap-cell bg-primary-container"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed & Achievements (Span 4) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Command Feed */}
            <div className="glass-card p-6 rounded-2xl flex flex-col h-[482px]">
              <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface mb-6">
                Command Feed
              </h3>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                {commandLogs.map((log, i) => (
                  <div key={log.id} className="flex gap-4 relative">
                    {i < commandLogs.length - 1 && (
                      <div className="absolute left-[13px] top-8 bottom-[-24px] w-[2px] bg-outline-variant/30"></div>
                    )}
                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 z-10 ${log.color}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {log.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-on-surface leading-normal">
                        <span className="font-bold">{log.title}</span>: {log.desc}
                      </p>
                      <p className="text-[10px] font-mono text-secondary mt-1 tracking-wide uppercase font-semibold">
                        {log.xp}
                      </p>
                      <p className="text-[9px] font-mono text-on-surface-variant mt-0.5 uppercase tracking-wider">
                        {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
