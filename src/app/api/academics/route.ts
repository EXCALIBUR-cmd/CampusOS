import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";

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

    const academicsSummary = {
      cgpa: student.cgpa,
      semester: student.semester,
      department: student.department,
      courses: [
        { code: "CS-401", name: "Artificial Intelligence", grade: "A", score: 95, time: "Mon, Wed // 10:00 AM", instructor: "Dr. K. Vance" },
        { code: "CS-402", name: "Database Management", grade: "A-", score: 88, time: "Tue, Thu // 02:00 PM", instructor: "Prof. L. Croft" },
        { code: "MTH-302", name: "Linear Algebra", grade: "A", score: 92, time: "Mon, Wed // 09:00 AM", instructor: "Dr. E. Noether" },
        { code: "CS-405", name: "Software Engineering", grade: "B", score: 78, time: "Fri // 11:00 AM", instructor: "Prof. F. Brooks" },
      ],
    };

    return NextResponse.json({ success: true, data: academicsSummary });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
