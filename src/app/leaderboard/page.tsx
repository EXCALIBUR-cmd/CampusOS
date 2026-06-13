"use client";

import { SideNavBar } from "@/components/SideNavBar";
import { Header } from "@/components/Header";
import { useState } from "react";

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  guild: string;
  isUser: boolean;
  avatar: string;
}

export default function LeaderboardPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const podium: LeaderboardUser[] = [
    { rank: 1, name: "Ace_Pilot", xp: 98200, guild: "Alpha Squad", isUser: false, avatar: "A" },
    { rank: 2, name: "NovaCore", xp: 94100, guild: "Cyber Knights", isUser: false, avatar: "N" },
    { rank: 3, name: "Flux_Zero", xp: 92800, guild: "Beta Void", isUser: false, avatar: "F" },
  ];

  const players: LeaderboardUser[] = [
    { rank: 4, name: "SkyNet_V2", xp: 88500, guild: "Cyber Knights", isUser: false, avatar: "S" },
    { rank: 5, name: "CyberKnight", xp: 82400, guild: "Alpha Squad", isUser: false, avatar: "C" },
    { rank: 6, name: "VoidRunner", xp: 79000, guild: "Beta Void", isUser: false, avatar: "V" },
    { rank: 7, name: "GridPro", xp: 74200, guild: "Alpha Squad", isUser: false, avatar: "G" },
    { rank: 8, name: "Helix_DNA", xp: 68100, guild: "Delta Bio", isUser: false, avatar: "H" },
    { rank: 9, name: "Quantum_Q", xp: 61000, guild: "Beta Void", isUser: false, avatar: "Q" },
    { rank: 10, name: "Neon_Ghost", xp: 54300, guild: "Alpha Squad", isUser: false, avatar: "N" },
    { rank: 11, name: "Matrix_M", xp: 48900, guild: "Cyber Knights", isUser: false, avatar: "M" },
    { rank: 12, name: "Commander Sterling", xp: 42500, guild: "Alpha Squad", isUser: true, avatar: "S" },
    { rank: 13, name: "Sigma_Root", xp: 39100, guild: "Delta Bio", isUser: false, avatar: "S" },
    { rank: 14, name: "Bit_Crusher", xp: 35000, guild: "Cyber Knights", isUser: false, avatar: "B" },
  ];

  // Filter & Search Logic
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "all" ||
      (category === "alpha" && player.guild === "Alpha Squad") ||
      (category === "cyber" && player.guild === "Cyber Knights") ||
      (category === "beta" && player.guild === "Beta Void");
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Side Navigation */}
      <SideNavBar />

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Header title="Global Rankings" subtitle="Hall of Fame: Commander Standings" />

        {/* Podium Graphics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end pt-6">
          {/* 2nd Place */}
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-between text-center relative h-[210px] md:h-[220px] order-2 md:order-1 border-t-4 border-t-outline">
            <span className="font-mono text-xs text-on-surface-variant font-bold">02</span>
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline flex items-center justify-center font-bold text-lg mb-2 relative">
              {podium[1].avatar}
              <span className="absolute -top-2 -right-2 text-outline material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                military_tech
              </span>
            </div>
            <div>
              <h4 className="font-geist text-sm font-bold text-on-surface leading-tight">
                {podium[1].name}
              </h4>
              <p className="font-mono text-[10px] text-on-surface-variant uppercase mt-0.5">
                {podium[1].guild}
              </p>
            </div>
            <span className="font-mono text-[11px] text-outline font-bold mt-2">
              {podium[1].xp.toLocaleString()} XP
            </span>
          </div>

          {/* 1st Place */}
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-between text-center relative h-[250px] order-1 md:order-2 border-t-4 border-t-primary scale-105 neon-glow">
            <span className="font-mono text-xs text-primary font-bold">01</span>
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center font-bold text-2xl mb-2 relative">
              {podium[0].avatar}
              <span className="absolute -top-4 -right-3 text-primary material-symbols-outlined text-[28px] animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
            </div>
            <div>
              <h4 className="font-geist text-base font-bold text-on-surface leading-tight">
                {podium[0].name}
              </h4>
              <p className="font-mono text-[10px] text-primary uppercase mt-0.5">
                {podium[0].guild}
              </p>
            </div>
            <span className="font-mono text-xs text-primary font-bold mt-2">
              {podium[0].xp.toLocaleString()} XP
            </span>
          </div>

          {/* 3rd Place */}
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-between text-center relative h-[200px] order-3 border-t-4 border-t-secondary">
            <span className="font-mono text-xs text-on-surface-variant font-bold">03</span>
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-secondary/50 flex items-center justify-center font-bold text-lg mb-2 relative">
              {podium[2].avatar}
              <span className="absolute -top-2 -right-2 text-secondary material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                military_tech
              </span>
            </div>
            <div>
              <h4 className="font-geist text-sm font-bold text-on-surface leading-tight">
                {podium[2].name}
              </h4>
              <p className="font-mono text-[10px] text-on-surface-variant uppercase mt-0.5">
                {podium[2].guild}
              </p>
            </div>
            <span className="font-mono text-[11px] text-secondary font-bold mt-2">
              {podium[2].xp.toLocaleString()} XP
            </span>
          </div>
        </section>

        {/* Filter and Table Section */}
        <section className="glass-card p-6 rounded-2xl">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Commander..."
                className="w-full bg-surface-container-low pl-10 pr-4 py-2 border border-outline-variant/50 focus:border-primary text-on-surface font-sans text-xs rounded-lg focus:outline-none transition-all placeholder:text-outline/40"
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex gap-2">
              {["all", "alpha", "cyber", "beta"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                    category === cat
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-surface-container-low border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/40"
                  }`}
                >
                  {cat === "all" ? "All Guilds" : `${cat} Guild`}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant font-mono uppercase tracking-widest text-[9px]">
                  <th className="pb-3 font-semibold">Rank</th>
                  <th className="pb-3 font-semibold">Commander</th>
                  <th className="pb-3 font-semibold">Guild Team</th>
                  <th className="pb-3 font-semibold text-right">XP Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-sans">
                {filteredPlayers.map((player) => (
                  <tr
                    key={player.rank}
                    className={`transition-colors ${
                      player.isUser
                        ? "bg-primary/5 hover:bg-primary/10 font-bold border-y border-primary/20"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="py-3 font-mono font-bold text-on-surface-variant">
                      {player.rank < 10 ? `0${player.rank}` : player.rank}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            player.isUser
                              ? "bg-primary/20 border border-primary text-primary"
                              : "bg-surface-container-high border border-outline-variant"
                          }`}
                        >
                          {player.avatar}
                        </div>
                        <span
                          className={player.isUser ? "text-primary font-bold" : "text-on-surface"}
                        >
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-wide">
                      {player.guild}
                    </td>
                    <td className={`py-3 text-right font-mono font-bold ${player.isUser ? "text-primary" : "text-on-surface"}`}>
                      {player.xp.toLocaleString()} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
