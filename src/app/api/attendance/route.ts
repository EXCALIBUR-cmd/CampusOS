import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { Student } from "@/models/Student";
import { Course } from "@/models/Course";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const dateStr = searchParams.get("date");

    if (role === "student") {
      const student = await Student.findOne({ user: userId });
      if (!student) return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
      
      const records = await Attendance.find({ student: student._id }).populate("course", "name code credits").lean();
      return NextResponse.json({ success: true, data: records });
    }

    if (!courseId || !dateStr) {
      return NextResponse.json({ success: false, error: "Missing courseId or date" }, { status: 400 });
    }

    const dateObj = new Date(dateStr);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const records = await Attendance.find({
      course: courseId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("student", "name commanderId").lean();

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || (role !== "admin" && role !== "teacher")) {
      return NextResponse.json({ success: false, error: "Only admins and teachers can mark attendance" }, { status: 403 });
    }

    await connectToDatabase();
    const data = await request.json();
    const { courseId, date, records } = data; // records is array of { studentId, status }

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const dateObj = new Date(date);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));

    const operations = records.map((record: any) => ({
      updateOne: {
        filter: { student: record.studentId, course: courseId, date: startOfDay },
        update: { $set: { status: record.status, markedBy: userId } },
        upsert: true,
      }
    }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);

      // Grant XP based on attendance
      const xpUpdates = records.map((record: any) => {
        let xpGained = 0;
        if (record.status === "present") xpGained = 10;
        else if (record.status === "late") xpGained = 5;

        if (xpGained > 0) {
          return {
            updateOne: {
              filter: { _id: record.studentId },
              update: { $inc: { totalXp: xpGained } }
            }
          };
        }
        return null;
      }).filter(Boolean);

      if (xpUpdates.length > 0) {
        await Student.bulkWrite(xpUpdates);
      }
    }

    return NextResponse.json({ success: true, message: "Attendance saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
