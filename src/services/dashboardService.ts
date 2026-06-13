import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { Assignment } from "@/models/Assignment";
import { AssignmentSubmission } from "@/models/AssignmentSubmission";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { Badge } from "@/models/Badge";
import { Notification } from "@/models/Notification";

export async function getDashboardData(userId: string) {
  await connectToDatabase();

  // Find the student linked to user ID
  const student = await Student.findOne({ user: userId });
  if (!student) {
    throw new Error("Student dossier not found for this account");
  }

  const studentId = student._id.toString();

  // 1. Core Profile Details
  const totalXp = student.totalXp;
  const level = student.level;
  const streak = student.streak;
  const cgpa = student.cgpa;

  // 2. Achievements
  const achievementsCount = await Badge.countDocuments({ student: studentId });

  // 3. Attendance Rate Calculation
  const presentCount = await AttendanceRecord.countDocuments({ student: studentId, status: "present" });
  const lateCount = await AttendanceRecord.countDocuments({ student: studentId, status: "late" });
  const absentCount = await AttendanceRecord.countDocuments({ student: studentId, status: "absent" });
  
  const totalLectures = presentCount + lateCount + absentCount;
  const attendedCount = presentCount + lateCount;
  const attendanceRate = totalLectures > 0 ? Math.round((attendedCount / totalLectures) * 100) : 100;

  // 4. Pending Assignments Count
  const allAssignments = await Assignment.find();
  const submissions = await AssignmentSubmission.find({ student: studentId });
  const submittedAssignmentIds = new Set(submissions.map((s) => s.assignment.toString()));

  const pendingAssignmentsCount = allAssignments.filter(
    (assign) => !submittedAssignmentIds.has(assign._id.toString())
  ).length;

  // 5. Unread Notifications
  const notifications = await Notification.find({ recipient: userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    student: {
      id: studentId,
      commanderId: student.commanderId,
      name: student.name,
      avatarUrl: student.avatarUrl,
      department: student.department,
      semester: student.semester,
    },
    metrics: {
      xp: totalXp,
      level,
      streak,
      cgpa,
      attendance: `${attendanceRate}%`,
      achievements: `${achievementsCount}/4`, // out of 4 total seeded
      pendingAssignments: pendingAssignmentsCount,
    },
    notifications,
  };
}
