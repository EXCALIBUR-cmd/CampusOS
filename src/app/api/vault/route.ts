import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { Achievement } from "@/models/Achievement";
import { Badge } from "@/models/Badge";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const student = await Student.findOne({ user: userId });
    if (!student) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const achievements = await Achievement.find();
    const badges = await Badge.find({ student: student._id });

    const unlockedAchievementIds = new Set(badges.map((b) => b.achievement.toString()));
    const badgeUnlockDates = new Map(
      badges.map((b) => [b.achievement.toString(), b.unlockedAt])
    );

    const mergedAchievements = achievements.map((ach) => {
      const isUnlocked = unlockedAchievementIds.has(ach._id.toString());
      const unlockDate = badgeUnlockDates.get(ach._id.toString());

      return {
        id: ach._id.toString(),
        name: ach.name,
        desc: ach.desc,
        xp: `+${ach.xpReward.toLocaleString()} XP`,
        icon: ach.icon,
        unlocked: isUnlocked,
        date: isUnlocked && unlockDate ? new Date(unlockDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }) : undefined,
        category: ach.category,
        rarity: ach.rarity,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        achievements: mergedAchievements,
        level: student.level,
        totalXp: student.totalXp,
        streak: student.streak,
        completedCount: badges.length,
        totalCount: achievements.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
