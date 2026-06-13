import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { Achievement } from "@/models/Achievement";
import { Badge } from "@/models/Badge";
import { Notification } from "@/models/Notification";
import { AssignmentSubmission } from "@/models/AssignmentSubmission";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { awardXP } from "./xpEngine";

export async function checkAchievements(studentId: string) {
  await connectToDatabase();

  const student = await Student.findById(studentId);
  if (!student) return;

  // Fetch all achievements
  const achievements = await Achievement.find();

  // Fetch already unlocked badges for this student
  const unlockedBadges = await Badge.find({ student: studentId });
  const unlockedAchievementIds = new Set(unlockedBadges.map((b) => b.achievement.toString()));

  // Fetch statistics to check achievements
  // 1. Total assignments submitted
  const assignmentsSubmittedCount = await AssignmentSubmission.countDocuments({
    student: studentId,
    status: "complete",
  });

  // 2. Attendance check-ins
  const attendanceCheckInCount = await AttendanceRecord.countDocuments({
    student: studentId,
    status: "present",
  });

  // 3. Current total XP
  const currentXp = student.totalXp;

  for (const ach of achievements) {
    // Skip if already unlocked
    if (unlockedAchievementIds.has(ach._id.toString())) continue;

    let criterionMet = false;
    const { type, target } = ach.criteria;

    if (type === "assignments") {
      criterionMet = assignmentsSubmittedCount >= target;
    } else if (type === "attendance") {
      criterionMet = attendanceCheckInCount >= target;
    } else if (type === "xp") {
      criterionMet = currentXp >= target;
    }

    if (criterionMet) {
      // Unlock badge
      const badge = new Badge({
        student: studentId,
        achievement: ach._id,
      });
      await badge.save();

      // Create Notification
      const notification = new Notification({
        recipient: student.user,
        title: "Achievement Unlocked",
        message: `Unlocked badge: ${ach.name}! ${ach.desc}`,
        type: "Badge",
      });
      await notification.save();

      // Award XP for unlocking (avoid recursive loops by calling awardXP with Custom Action)
      await awardXP(student.user.toString(), "Achievement Unlock", ach.xpReward);
    }
  }
}

export async function seedAchievements() {
  const count = await Achievement.countDocuments();
  if (count > 0) return;

  const defaultAchievements = [
    {
      name: "Code Warrior",
      desc: "Successfully submit 10 programming assignments on time.",
      xpReward: 800,
      icon: "terminal",
      category: "academic",
      rarity: "common",
      criteria: { type: "assignments", target: 10 },
    },
    {
      name: "Early Bird",
      desc: "Check-in to lectures before start time 10 times consecutively.",
      xpReward: 600,
      icon: "alarm",
      category: "participation",
      rarity: "common",
      criteria: { type: "attendance", target: 10 },
    },
    {
      name: "Perfect Presence",
      desc: "Maintain 100% attendance in all enrolled courses for 30 days.",
      xpReward: 1500,
      icon: "workspace_premium",
      category: "participation",
      rarity: "rare",
      criteria: { type: "attendance", target: 30 },
    },
    {
      name: "Apex Scholar",
      desc: "Achieve a semester CGPA rating of 3.8 or higher.",
      xpReward: 2000,
      icon: "auto_stories",
      category: "academic",
      rarity: "legendary",
      criteria: { type: "xp", target: 40000 },
    },
  ];

  await Achievement.insertMany(defaultAchievements);
}
