import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";
import { Admin } from "@/models/Admin";
import { Course } from "@/models/Course";
import { Department } from "@/models/Department";
import { SupportTicket } from "@/models/SupportTicket";
import { Assignment } from "@/models/Assignment";
import { AssignmentSubmission } from "@/models/AssignmentSubmission";
import { Attendance } from "@/models/Attendance";
import { Badge } from "@/models/Badge";
import { Notification } from "@/models/Notification";
import { Achievement } from "@/models/Achievement";

export async function getDashboardData(userId: string) {
  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const notifications = await Notification.find({ recipient: userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(10);

  if (user.role === "admin") {
    const admin = await Admin.findOne({ user: userId });
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: "open" });

    return {
      role: "admin",
      profile: {
        id: admin?._id.toString() || userId,
        name: admin?.name || "Administrator",
      },
      metrics: {
        totalUsers,
        totalCourses,
        totalDepartments,
        openTickets,
      },
      notifications,
    };
  }

  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) throw new Error("Teacher dossier not found");

    const courses = await Course.find({ teachers: teacher._id });
    const assignedCourses = courses.length;
    const enrolledStudents = courses.reduce((acc, course) => acc + (course.students?.length || 0), 0);

    return {
      role: "teacher",
      profile: {
        id: teacher._id.toString(),
        name: teacher.name,
        department: teacher.department,
        designation: teacher.designation,
      },
      metrics: {
        assignedCourses,
        enrolledStudents,
        classesToday: 2, // Dummy value for gamified UI
      },
      notifications,
    };
  }

  // Student specific dashboard (Default)
  const student = await Student.findOne({ user: userId });
  if (!student) throw new Error("Student dossier not found for this account");

  const studentId = student._id.toString();

  const achievementsCount = await Badge.countDocuments({ student: studentId });
  const totalAchievementsCount = await Achievement.countDocuments();
  const presentCount = await Attendance.countDocuments({ student: studentId, status: "present" });
  const lateCount = await Attendance.countDocuments({ student: studentId, status: "late" });
  const absentCount = await Attendance.countDocuments({ student: studentId, status: "absent" });
  
  const totalLectures = presentCount + lateCount + absentCount;
  const attendedCount = presentCount + lateCount;
  const attendanceRate = totalLectures > 0 ? Math.round((attendedCount / totalLectures) * 100) : 100;

  const allAssignments = await Assignment.find();
  const submissions = await AssignmentSubmission.find({ student: studentId });
  const submittedAssignmentIds = new Set(submissions.map((s) => s.assignment.toString()));

  const pendingAssignmentsCount = allAssignments.filter(
    (assign) => !submittedAssignmentIds.has(assign._id.toString())
  ).length;

  // Heatmap Data for the last 238 days
  const heatmapData = new Array(238).fill(0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const past238Days = new Date(today);
  past238Days.setDate(today.getDate() - 237);
  past238Days.setHours(0, 0, 0, 0);

  const recentAttendance = await Attendance.find({
    student: studentId,
    date: { $gte: past238Days }
  });

  recentAttendance.forEach(record => {
    // calculate index (0 is oldest, 237 is today)
    const diffTime = record.date.getTime() - past238Days.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 238) {
      let val = 0;
      if (record.status === "present") val = 4;
      else if (record.status === "late") val = 2;
      else if (record.status === "absent") val = 1;
      
      if (val > heatmapData[diffDays]) {
        heatmapData[diffDays] = val;
      }
    }
  });

  return {
    role: "student",
    student: {
      id: studentId,
      commanderId: student.commanderId,
      name: student.name,
      avatarUrl: student.avatarUrl,
      department: student.department,
      semester: student.semester,
    },
    metrics: {
      xp: student.totalXp,
      level: student.level,
      streak: student.streak,
      cgpa: student.cgpa,
      attendance: `${attendanceRate}%`,
      achievements: `${achievementsCount}/${totalAchievementsCount}`,
      pendingAssignments: pendingAssignmentsCount,
      heatmapData,
    },
    notifications,
  };
}
