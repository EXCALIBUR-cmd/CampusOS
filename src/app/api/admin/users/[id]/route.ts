import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";
import { Admin } from "@/models/Admin";
import { Course } from "@/models/Course";
import { Attendance } from "@/models/Attendance";
import { SupportTicket } from "@/models/SupportTicket";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    
    const user = await User.findById(resolvedParams.id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 1. Delete all support tickets created by the user
    await SupportTicket.deleteMany({ user: resolvedParams.id });

    // 2. Clean up specific profiles and references
    if (user.role === "student" && user.studentProfile) {
      // Remove student from all enrolled courses
      await Course.updateMany(
        { students: user.studentProfile },
        { $pull: { students: user.studentProfile } }
      );
      // Delete all attendance records for this student
      await Attendance.deleteMany({ student: user.studentProfile });
      
      await Student.findByIdAndDelete(user.studentProfile);
    } else if (user.role === "teacher" && user.teacherProfile) {
      // Remove teacher from all assigned courses
      await Course.updateMany(
        { teachers: user.teacherProfile },
        { $pull: { teachers: user.teacherProfile } }
      );
      
      await Teacher.findByIdAndDelete(user.teacherProfile);
    } else if (user.role === "admin" && user.adminProfile) {
      await Admin.findByIdAndDelete(user.adminProfile);
    }

    await User.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const data = await request.json();

    let user = await User.findById(resolvedParams.id);
    
    if (!user) {
       return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // --- 1. Role Transition Logic ---
    if (data.role && data.role !== user.role) {
      // A. Delete old profile & associated records safely
      if (user.role === "student" && user.studentProfile) {
        await Course.updateMany(
          { students: user.studentProfile },
          { $pull: { students: user.studentProfile } }
        );
        await Attendance.deleteMany({ student: user.studentProfile });
        await Student.findByIdAndDelete(user.studentProfile);
        user.studentProfile = undefined;
      } else if (user.role === "teacher" && user.teacherProfile) {
        await Course.updateMany(
          { teachers: user.teacherProfile },
          { $pull: { teachers: user.teacherProfile } }
        );
        await Teacher.findByIdAndDelete(user.teacherProfile);
        user.teacherProfile = undefined;
      } else if (user.role === "admin" && user.adminProfile) {
        await Admin.findByIdAndDelete(user.adminProfile);
        user.adminProfile = undefined;
      }

      // B. Update user role
      user.role = data.role;

      // C. Create brand new profile
      if (data.role === "student") {
        const commanderId = `student_${Math.floor(100 + Math.random() * 900)}`;
        const student = new Student({
          user: user._id,
          commanderId,
          name: data.name,
          department: data.department,
          semester: data.semester || 1,
        });
        await student.save();
        user.studentProfile = student._id;
      } else if (data.role === "teacher") {
        const teacher = new Teacher({
          user: user._id,
          name: data.name,
          department: data.department,
          designation: data.designation || "Assistant Professor",
        });
        await teacher.save();
        user.teacherProfile = teacher._id;
      } else if (data.role === "admin") {
        const admin = new Admin({
          user: user._id,
          name: data.name,
          department: data.department || "Management",
        });
        await admin.save();
        user.adminProfile = admin._id;
      }
    } else {
      // --- 2. Standard Profile Update (No Role Change) ---
      if (user.role === "student" && user.studentProfile) {
        await Student.findByIdAndUpdate(user.studentProfile, {
          name: data.name,
          department: data.department,
          semester: data.semester,
        });
      } else if (user.role === "teacher" && user.teacherProfile) {
        await Teacher.findByIdAndUpdate(user.teacherProfile, {
          name: data.name,
          department: data.department,
          designation: data.designation,
        });
      } else if (user.role === "admin" && user.adminProfile) {
        await Admin.findByIdAndUpdate(user.adminProfile, {
          name: data.name,
          department: data.department,
        });
      }
    }

    // --- 3. Core User Data Update ---
    if (data.email) user.email = data.email;
    if (data.isActive !== undefined) user.isActive = data.isActive;
    
    // Process new password if provided
    if (data.password && data.password.trim() !== "") {
      user.password = await bcrypt.hash(data.password, 10);
    }

    await user.save();

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
