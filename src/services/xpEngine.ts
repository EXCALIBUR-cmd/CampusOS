import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { XPTransaction } from "@/models/XPTransaction";
import { Notification } from "@/models/Notification";
import { checkAchievements } from "@/services/achievementEngine";

const ACTION_XP_MAP: Record<string, number> = {
  "Assignment Submission": 450,
  "Lecture Check-in": 100,
  "Attendance Streak": 250,
  "Event Participation": 500,
  "Club Participation": 300,
  "Resource Contribution": 200,
  "Achievement Unlock": 1000,
};

export async function awardXP(userId: string, action: string, customAmount?: number) {
  await connectToDatabase();

  const amount = customAmount ?? ACTION_XP_MAP[action] ?? 100;

  // Find student linked to user ID
  const student = await Student.findOne({ user: userId });
  if (!student) return null;

  const currentLevel = student.level;
  const newXp = student.totalXp + amount;
  const newLevel = Math.floor(newXp / 10000) + 1;
  const levelIncreased = newLevel > currentLevel;

  // Save transaction
  const transaction = new XPTransaction({
    student: student._id,
    amount,
    action,
  });
  await transaction.save();

  // Update student profile
  student.totalXp = newXp;
  student.level = newLevel;
  await student.save();

  // Create XP Notification
  const xpNotification = new Notification({
    recipient: student.user,
    title: "XP Calibrated",
    message: `You earned +${amount} XP for action: ${action}.`,
    type: "XP",
  });
  await xpNotification.save();

  if (levelIncreased) {
    // Create Level-Up Notification
    const levelNotification = new Notification({
      recipient: student.user,
      title: "System Calibrated",
      message: `Congratulations! Your system level has increased from ${currentLevel} to ${newLevel}.`,
      type: "System",
    });
    await levelNotification.save();
  }

  // Trigger achievement checks
  await checkAchievements(student._id.toString());

  return { amount, levelIncreased, currentLevel, newLevel, totalXp: newXp };
}
