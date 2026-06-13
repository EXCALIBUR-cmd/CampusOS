interface XPProgressProps {
  level: number;
  currentXp: number;
  maxXp: number;
  streak: number;
}

export function XPProgress({ level, currentXp, maxXp, streak }: XPProgressProps) {
  const percentage = Math.round((currentXp / maxXp) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] rounded-full uppercase tracking-wider">
            Level {level}
          </span>
          <div className="flex items-center gap-1 text-secondary">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="font-geist text-sm font-bold">{streak} Day Streak</span>
          </div>
        </div>
        <span className="font-mono text-on-surface-variant text-[11px] tracking-wide">
          {currentXp.toLocaleString()} / {maxXp.toLocaleString()} XP ({percentage}%)
        </span>
      </div>
      <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
        <div
          className="h-full bg-gradient-to-r from-primary-container to-secondary-container xp-shimmer neon-glow transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
