import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Course } from "@/models/Course";
import { Teacher } from "@/models/Teacher";
import { Student } from "@/models/Student";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || (role !== "admin" && role !== "teacher")) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();

    let query = {};
    if (role === "teacher") {
      const teacher = await Teacher.findOne({ user: userId });
      if (!teacher) {
        return NextResponse.json({ success: false, error: "Teacher profile not found" }, { status: 404 });
      }
      query = { teachers: teacher._id };
    }

    const courses = await Course.find(query)
      .populate("teachers", "name department")
      .populate("students", "name commanderId")
      .lean();

    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const role = headersList.get("x-user-role");

    if (role !== "admin") {
      return NextResponse.json({ success: false, error: "Only admins can create courses" }, { status: 403 });
    }

    await connectToDatabase();
    const data = await request.json();

    const existingCourse = await Course.findOne({ code: data.code });
    if (existingCourse) {
      return NextResponse.json({ success: false, error: "Course code already exists" }, { status: 400 });
    }

    const newCourse = new Course({
      code: data.code,
      name: data.name,
      department: data.department,
      credits: data.credits || 3,
      description: data.description || "",
      teachers: data.teachers || [],
      students: data.students || [],
    });

    await newCourse.save();

    // Synchronize many-to-many relationships
    if (data.teachers && data.teachers.length > 0) {
      await Teacher.updateMany(
        { _id: { $in: data.teachers } },
        { $addToSet: { courses: newCourse._id } }
      );
    }
    if (data.students && data.students.length > 0) {
      await Student.updateMany(
        { _id: { $in: data.students } },
        { $addToSet: { courses: newCourse._id } }
      );
    }

    const populatedCourse = await Course.findById(newCourse._id)
      .populate("teachers", "name department")
      .populate("students", "name commanderId");

    return NextResponse.json({ success: true, data: populatedCourse });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
