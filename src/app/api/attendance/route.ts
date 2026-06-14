import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";
import { Attendance } from "@/models/Attendance";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { awardXP } from "@/services/xpEngine";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    if (role === "student") {
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return NextResponse.json({ success: false, error: "Student dossier not found" }, { status: 404 });
      }

      const courses = await Attendance.find();
      const records = await AttendanceRecord.find({ student: student._id });

      const courseBreakdown = courses.map((course) => {
        const courseRecords = records.filter(
          (rec) => rec.attendance.toString() === course._id.toString()
        );
        const presentCount = courseRecords.filter((rec) => rec.status === "present").length;
        const lateCount = courseRecords.filter((rec) => rec.status === "late").length;
        const absentCount = courseRecords.filter((rec) => rec.status === "absent").length;

        const totalLectures = presentCount + lateCount + absentCount;
        const attended = presentCount + lateCount;
        const percentage = totalLectures > 0 ? Math.round((attended / totalLectures) * 100) : 100;

        return {
          id: course._id.toString(),
          subject: course.subject,
          code: course.code,
          percent: percentage,
          attended,
          total: totalLectures,
          absent: absentCount,
        };
      });

      return NextResponse.json({ success: true, data: courseBreakdown });
    }

    const courses = await Attendance.find().populate("teacher", "name");
    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "teacher") {
      return NextResponse.json({ success: false, error: "Only teachers can mark attendance" }, { status: 403 });
    }

    await connectToDatabase();

    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) {
      return NextResponse.json({ success: false, error: "Teacher profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { studentId, attendanceId, status, date } = body;

    if (!studentId || !attendanceId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return NextResponse.json({ success: false, error: "Attendance setup not found" }, { status: 404 });
    }

    const recordDate = date ? new Date(date) : new Date();

    const record = new AttendanceRecord({
      student: studentId,
      attendance: attendanceId,
      status,
      date: recordDate,
    });
    await record.save();

    attendance.totalLectures = (attendance.totalLectures || 0) + 1;
    await attendance.save();

    if (status === "present" || status === "late") {
      const targetStudent = await Student.findById(studentId);
      if (targetStudent) {
        await awardXP(targetStudent.user.toString(), "Lecture Check-in");
      }
    }

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
