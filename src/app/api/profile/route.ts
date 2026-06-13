import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";
import { uploadFile } from "@/services/imagekitService";

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
      return NextResponse.json({ success: true, data: student });
    } else if (role === "teacher") {
      const teacher = await Teacher.findOne({ user: userId });
      return NextResponse.json({ success: true, data: teacher });
    }

    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();

    if (role === "student") {
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
      }

      // Handle profile photo upload if provided
      if (body.avatarBase64 && body.avatarFileName) {
        const uploadResult = await uploadFile(body.avatarBase64, body.avatarFileName, "avatars");
        if (uploadResult.success && uploadResult.url) {
          student.avatarUrl = uploadResult.url;
        }
      }

      // Update fields
      if (body.bio !== undefined) student.bio = body.bio;
      if (body.skills !== undefined) student.skills = body.skills;
      if (body.certifications !== undefined) student.certifications = body.certifications;
      if (body.projects !== undefined) student.projects = body.projects;

      await student.save();
      return NextResponse.json({ success: true, data: student });
    } else if (role === "teacher") {
      const teacher = await Teacher.findOne({ user: userId });
      if (!teacher) {
        return NextResponse.json({ success: false, error: "Teacher not found" }, { status: 404 });
      }

      if (body.name !== undefined) teacher.name = body.name;
      if (body.designation !== undefined) teacher.designation = body.designation;
      if (body.subjects !== undefined) teacher.subjects = body.subjects;

      await teacher.save();
      return NextResponse.json({ success: true, data: teacher });
    }

    return NextResponse.json({ success: false, error: "Unauthorized role" }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
