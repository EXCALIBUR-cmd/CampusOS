import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Department } from "@/models/Department";
import { Course } from "@/models/Course";
import { Teacher } from "@/models/Teacher";
import { Student } from "@/models/Student";
import { User } from "@/models/User";
import { Attendance } from "@/models/Attendance";
import { SupportTicket } from "@/models/SupportTicket";
import { registerUser } from "@/services/authService";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Seed Departments
    const deptCS = await Department.findOneAndUpdate(
      { code: "CSE" },
      { name: "Computer Science and Engineering", code: "CSE", headOfDepartment: "Dr. Alan Turing", description: "Computing, AI, and Software Engineering." },
      { upsert: true, new: true }
    );
    const deptME = await Department.findOneAndUpdate(
      { code: "ME" },
      { name: "Mechanical Engineering", code: "ME", headOfDepartment: "Dr. James Watt", description: "Thermodynamics, Robotics, and Mechanics." },
      { upsert: true, new: true }
    );

    // 2. Seed Teachers
    // Create users first using registerUser
    let teacherCSUser = await User.findOne({ email: "turing@campus.os" });
    if (!teacherCSUser) {
      await registerUser({ email: "turing@campus.os", password: "password123", role: "teacher", name: "Dr. Alan Turing", department: "Computer Science and Engineering", designation: "Professor", commanderId: "" });
      teacherCSUser = await User.findOne({ email: "turing@campus.os" });
    }
    const teacherCS = await Teacher.findOne({ user: teacherCSUser?._id });

    let teacherMEUser = await User.findOne({ email: "watt@campus.os" });
    if (!teacherMEUser) {
      await registerUser({ email: "watt@campus.os", password: "password123", role: "teacher", name: "Dr. James Watt", department: "Mechanical Engineering", designation: "Associate Professor", commanderId: "" });
      teacherMEUser = await User.findOne({ email: "watt@campus.os" });
    }
    const teacherME = await Teacher.findOne({ user: teacherMEUser?._id });

    // 3. Seed Students
    let studentCSUser = await User.findOne({ email: "alice@campus.os" });
    if (!studentCSUser) {
      await registerUser({ email: "alice@campus.os", password: "password123", role: "student", name: "Alice Hacker", department: "Computer Science and Engineering", semester: 3, commanderId: "ALICE_01", designation: "" });
      studentCSUser = await User.findOne({ email: "alice@campus.os" });
    }
    const studentCS = await Student.findOne({ user: studentCSUser?._id });

    let studentMEUser = await User.findOne({ email: "bob@campus.os" });
    if (!studentMEUser) {
      await registerUser({ email: "bob@campus.os", password: "password123", role: "student", name: "Bob Builder", department: "Mechanical Engineering", semester: 5, commanderId: "BOB_02", designation: "" });
      studentMEUser = await User.findOne({ email: "bob@campus.os" });
    }
    const studentME = await Student.findOne({ user: studentMEUser?._id });

    // 4. Seed Courses
    const courseDSA = await Course.findOneAndUpdate(
      { code: "CS-201" },
      { 
        name: "Data Structures & Algorithms", 
        code: "CS-201", 
        department: "Computer Science and Engineering", 
        credits: 4, 
        teachers: teacherCS ? [teacherCS._id] : [],
        students: studentCS ? [studentCS._id] : []
      },
      { upsert: true, new: true }
    );
    
    const courseThermo = await Course.findOneAndUpdate(
      { code: "ME-301" },
      { 
        name: "Thermodynamics", 
        code: "ME-301", 
        department: "Mechanical Engineering", 
        credits: 3, 
        teachers: teacherME ? [teacherME._id] : [],
        students: studentME ? [studentME._id] : []
      },
      { upsert: true, new: true }
    );

    // Sync courses back to Teachers and Students
    if (teacherCS) await Teacher.findByIdAndUpdate(teacherCS._id, { $addToSet: { courses: courseDSA._id } });
    if (studentCS) await Student.findByIdAndUpdate(studentCS._id, { $addToSet: { courses: courseDSA._id } });
    
    if (teacherME) await Teacher.findByIdAndUpdate(teacherME._id, { $addToSet: { courses: courseThermo._id } });
    if (studentME) await Student.findByIdAndUpdate(studentME._id, { $addToSet: { courses: courseThermo._id } });

    // 5. Seed Attendance
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const yesterday = new Date(startOfDay);
    yesterday.setDate(yesterday.getDate() - 1);

    if (studentCS && teacherCSUser) {
      await Attendance.findOneAndUpdate(
        { student: studentCS._id, course: courseDSA._id, date: startOfDay },
        { status: "present", markedBy: teacherCSUser._id },
        { upsert: true }
      );
      await Attendance.findOneAndUpdate(
        { student: studentCS._id, course: courseDSA._id, date: yesterday },
        { status: "late", markedBy: teacherCSUser._id },
        { upsert: true }
      );
    }

    if (studentME && teacherMEUser) {
      await Attendance.findOneAndUpdate(
        { student: studentME._id, course: courseThermo._id, date: startOfDay },
        { status: "absent", markedBy: teacherMEUser._id },
        { upsert: true }
      );
    }

    // 6. Seed Support Tickets
    if (studentCSUser) {
      await SupportTicket.findOneAndUpdate(
        { subject: "Lab Computers Outdated" },
        { user: studentCSUser._id, message: "The computers in CS Lab 3 are running very slowly and crashing during compilation.", status: "open" },
        { upsert: true }
      );
    }

    if (teacherMEUser) {
      await SupportTicket.findOneAndUpdate(
        { subject: "Projector Broken in Room 204" },
        { user: teacherMEUser._id, message: "The projector in ME Lecture Hall 204 has a blown bulb.", status: "resolved", reply: "Maintenance team has replaced the bulb this morning." },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, message: "Engineering ERP Seed Data Generated Successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
