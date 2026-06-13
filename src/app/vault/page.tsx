"use client";

import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";
import { XPProgress } from "@/components/XPProgress";
import { useState, useEffect } from "react";

interface Achievement {
  id: string;
  name: string;
  desc: string;
  xp: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  category: "academic" | "participation" | "speed";
  rarity: "common" | "rare" | "legendary";
}

export default function VaultPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    level: 1,
    totalXp: 0,
    maxXp: 10000,
    streak: 0,
    completedCount: 0,
    totalCount: 0,
  });

  useEffect(() => {
    async function loadVault() {
      try {
        const res = await fetch("/api/vault");
        const json = await res.json();
        if (json.success && json.data) {
          setAchievements(json.data.achievements);
          
          const currentLevel = json.data.level;
          const currentXpInLevel = json.data.totalXp % 10000;
          const maxXp = 10000;

          setStats({
            level: currentLevel,
            totalXp: currentXpInLevel,
            maxXp,
            streak: json.data.streak,
            completedCount: json.data.completedCount,
            totalCount: json.data.totalCount,
          });
        } else {
          setError(json.error || "Failed to load achievements data");
        }
      } catch (err: any) {
        setError(err.message || "Failed to establish secure link to system core");
      } finally {
        setLoading(false);
      }
    }
    loadVault();
  }, []);

  const getRarityStyles = (rarity: "common" | "rare" | "legendary", unlocked: boolean) => {
    if (!unlocked) return "border-outline-variant/30 text-on-surface-variant/40 opacity-40";
    switch (rarity) {
      case "legendary":
        return "border-secondary text-secondary glow-legendary";
      case "rare":
        return "border-primary text-primary glow-rare";
      default:
        return "border-tertiary text-tertiary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex relative">
        <SideNavBar />
        <main className="flex-1 ml-64 p-8 flex flex-col items-center justify-center font-mono text-xs text-primary animate-pulse">
          Retrieving Achievement Records...
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex relative">
        <SideNavBar />
        <main className="flex-1 ml-64 p-8 flex flex-col items-center justify-center font-mono text-xs text-error">
          <span className="material-symbols-outlined text-4xl mb-2">error</span>
          <span>{error}</span>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Side Navigation */}
      <SideNavBar />

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Header title="The Vault" subtitle="Academic Achievements & XP Log" />

        <div className="space-y-6">
          {/* XP Progress Card */}
          <section className="glass-card p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]"></div>
            <div className="max-w-2xl relative z-10">
              <h3 className="font-geist text-lg font-bold text-on-surface mb-2">XP Progression Core</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Accumulate XP by submitting assignments, checking in on time, and completing courses.
                Level calibrations unlock exclusive privileges and ranks in the Global Hall of Fame.
              </p>
              <XPProgress level={stats.level} currentXp={stats.totalXp} maxXp={stats.maxXp} streak={stats.streak} />
            </div>
          </section>

          {/* Achievement Grid Section */}
          <section className="glass-card p-8 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-geist text-sm font-bold uppercase tracking-wider text-on-surface">
                Unlocked Achievements
              </h3>
              <div className="flex gap-2">
                <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded">
                  {stats.completedCount}/{stats.totalCount} Completed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  onClick={() => setSelectedBadge(ach)}
                  className={`glass-card p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center justify-between h-[180px] hover:-translate-y-1 transition-all ${
                    !ach.unlocked ? "hover:border-outline-variant" : ""
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shrink-0 mb-4 bg-surface-container-high/50 ${getRarityStyles(
                      ach.rarity,
                      ach.unlocked
                    )}`}
                  >
                    <span className="material-symbols-outlined text-[28px]">{ach.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-geist text-xs font-bold text-on-surface leading-tight">
                      {ach.name}
                    </h4>
                    <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">
                      {ach.xp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Slide-out details Drawer (Simulated in React) */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex justify-end">
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={() => setSelectedBadge(null)}
          ></div>
          <div className="w-96 h-full bg-surface-container-lowest border-l border-outline-variant p-8 flex flex-col justify-between z-10 shadow-2xl relative">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            <div className="space-y-8 mt-12 flex-1">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-24 h-24 rounded-full border-2 flex items-center justify-center shrink-0 mb-6 bg-surface-container-high/50 ${getRarityStyles(
                    selectedBadge.rarity,
                    selectedBadge.unlocked
                  )}`}
                >
                  <span className="material-symbols-outlined text-[48px]">
                    {selectedBadge.icon}
                  </span>
                </div>
                <h3 className="font-geist text-xl font-bold text-on-surface">{selectedBadge.name}</h3>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                  Category: {selectedBadge.category} // {selectedBadge.rarity}
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 rounded-xl bg-white/5 border border-outline-variant/30 space-y-1">
                  <p className="text-on-surface-variant uppercase tracking-widest text-[9px] font-mono">
                    Calibration Requirements
                  </p>
                  <p className="text-on-surface leading-relaxed">{selectedBadge.desc}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-outline-variant/30 space-y-1">
                  <p className="text-on-surface-variant uppercase tracking-widest text-[9px] font-mono">
                    XP Yield
                  </p>
                  <p className="text-primary font-bold text-sm font-mono">{selectedBadge.xp}</p>
                </div>

                {selectedBadge.unlocked ? (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                    <p className="text-primary uppercase tracking-widest text-[9px] font-mono">
                      Status: Unlocked
                    </p>
                    <p className="text-on-surface-variant font-mono">
                      Calibrated on {selectedBadge.date}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-error/10 border border-error/20 space-y-1">
                    <p className="text-error uppercase tracking-widest text-[9px] font-mono">
                      Status: Locked
                    </p>
                    <p className="text-on-surface-variant">Requirement unmet.</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-3 bg-white/5 border border-outline-variant text-on-surface font-mono text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-white/10 hover:border-primary/40 transition-all cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
