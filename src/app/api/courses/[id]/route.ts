import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Course } from "@/models/Course";
import { Teacher } from "@/models/Teacher";
import { Student } from "@/models/Student";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");
    const resolvedParams = await params;

    if (!userId || (role !== "admin" && role !== "teacher")) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    
    const course = await Course.findById(resolvedParams.id);
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    // Role check for teachers
    if (role === "teacher") {
      const teacher = await Teacher.findOne({ user: userId });
      if (!teacher || !course.teachers.includes(teacher._id)) {
        return NextResponse.json({ success: false, error: "You are not assigned to this course" }, { status: 403 });
      }
    }

    const data = await request.json();

    // If teacher, they can only update students. Admin can update anything.
    if (role === "admin") {
      if (data.code !== undefined) course.code = data.code;
      if (data.name !== undefined) course.name = data.name;
      if (data.department !== undefined) course.department = data.department;
      if (data.credits !== undefined) course.credits = data.credits;
      if (data.description !== undefined) course.description = data.description;
      
      if (data.teachers !== undefined) {
        // Find removed teachers and remove course from them
        const removedTeachers = course.teachers.filter((t: any) => !data.teachers.includes(t.toString()));
        if (removedTeachers.length > 0) {
          await Teacher.updateMany({ _id: { $in: removedTeachers } }, { $pull: { courses: course._id } });
        }
        
        // Find added teachers and add course to them
        const addedTeachers = data.teachers.filter((t: string) => !course.teachers.includes(t as any));
        if (addedTeachers.length > 0) {
          await Teacher.updateMany({ _id: { $in: addedTeachers } }, { $addToSet: { courses: course._id } });
        }
        
        course.teachers = data.teachers;
      }
    }

    if (data.students !== undefined) {
      // Find removed students and remove course from them
      const removedStudents = course.students.filter((s: any) => !data.students.includes(s.toString()));
      if (removedStudents.length > 0) {
        await Student.updateMany({ _id: { $in: removedStudents } }, { $pull: { courses: course._id } });
      }
      
      // Find added students and add course to them
      const addedStudents = data.students.filter((s: string) => !course.students.includes(s as any));
      if (addedStudents.length > 0) {
        await Student.updateMany({ _id: { $in: addedStudents } }, { $addToSet: { courses: course._id } });
      }
      
      course.students = data.students;
    }

    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate("teachers", "name department")
      .populate("students", "name commanderId");

    return NextResponse.json({ success: true, data: populatedCourse });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const role = headersList.get("x-user-role");
    const resolvedParams = await params;

    if (role !== "admin") {
      return NextResponse.json({ success: false, error: "Only admins can delete courses" }, { status: 403 });
    }

    await connectToDatabase();
    
    const course = await Course.findById(resolvedParams.id);
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    // Clean up relationships
    if (course.teachers.length > 0) {
      await Teacher.updateMany({ _id: { $in: course.teachers } }, { $pull: { courses: course._id } });
    }
    if (course.students.length > 0) {
      await Student.updateMany({ _id: { $in: course.students } }, { $pull: { courses: course._id } });
    }

    await Course.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
