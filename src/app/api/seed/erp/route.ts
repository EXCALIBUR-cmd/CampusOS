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
    const depts = [
      { name: "Computer Science and Engineering", code: "CSE", headOfDepartment: "Dr. Maninder Singh", description: "Computing, AI, and Software Engineering." },
      { name: "Mechanical Engineering", code: "ME", headOfDepartment: "Dr. Rajesh Kumar", description: "Thermodynamics, Robotics, and Mechanics." },
      { name: "Electrical Engineering", code: "EE", headOfDepartment: "Dr. Anita Desai", description: "Power systems, circuits, and electronics." },
      { name: "Civil Engineering", code: "CE", headOfDepartment: "Dr. Vikram Malhotra", description: "Infrastructure, materials, and construction." }
    ];

    for (const d of depts) {
      await Department.findOneAndUpdate({ code: d.code }, d, { upsert: true, new: true });
    }

    // Helper to get or create user
    const getOrCreateUser = async (userData: any) => {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        await registerUser(userData);
        user = await User.findOne({ email: userData.email });
      }
      return user;
    };

    // 2. Seed Teachers
    const teacherData = [
      { email: "maninder@campus.os", password: "password123", role: "teacher", name: "Dr. Maninder Singh", department: "Computer Science and Engineering", designation: "Professor", commanderId: "" },
      { email: "rajesh@campus.os", password: "password123", role: "teacher", name: "Dr. Rajesh Kumar", department: "Mechanical Engineering", designation: "Associate Professor", commanderId: "" },
      { email: "anita@campus.os", password: "password123", role: "teacher", name: "Dr. Anita Desai", department: "Electrical Engineering", designation: "Professor", commanderId: "" },
      { email: "vikram@campus.os", password: "password123", role: "teacher", name: "Dr. Vikram Malhotra", department: "Civil Engineering", designation: "Assistant Professor", commanderId: "" }
    ];

    const teacherDocs: any = {};
    for (const t of teacherData) {
      const u = await getOrCreateUser(t);
      teacherDocs[t.email] = await Teacher.findOne({ user: u._id });
    }

    // 3. Seed Students
    const studentData = [
      { email: "anugrah@campus.os", password: "password123", role: "student", name: "Anugrah Singh", department: "Computer Science and Engineering", semester: 6, commanderId: "CS_001", designation: "" },
      { email: "riya@campus.os", password: "password123", role: "student", name: "Riya Sharma", department: "Computer Science and Engineering", semester: 6, commanderId: "CS_002", designation: "" },
      { email: "rahul@campus.os", password: "password123", role: "student", name: "Rahul Verma", department: "Mechanical Engineering", semester: 4, commanderId: "ME_001", designation: "" },
      { email: "sneha@campus.os", password: "password123", role: "student", name: "Sneha Patel", department: "Electrical Engineering", semester: 8, commanderId: "EE_001", designation: "" },
      { email: "karan@campus.os", password: "password123", role: "student", name: "Karan Kapoor", department: "Civil Engineering", semester: 2, commanderId: "CE_001", designation: "" }
    ];

    const studentDocs: any = {};
    for (const s of studentData) {
      const u = await getOrCreateUser(s);
      studentDocs[s.email] = await Student.findOne({ user: u._id });
    }

    // 4. Seed Courses
    const courseData = [
      { code: "CS-301", name: "Data Structures & Algorithms", department: "Computer Science and Engineering", credits: 4, teachers: [teacherDocs["maninder@campus.os"]?._id], students: [studentDocs["anugrah@campus.os"]?._id, studentDocs["riya@campus.os"]?._id] },
      { code: "CS-405", name: "Artificial Intelligence", department: "Computer Science and Engineering", credits: 3, teachers: [teacherDocs["maninder@campus.os"]?._id], students: [studentDocs["anugrah@campus.os"]?._id] },
      { code: "ME-201", name: "Thermodynamics & Heat Transfer", department: "Mechanical Engineering", credits: 4, teachers: [teacherDocs["rajesh@campus.os"]?._id], students: [studentDocs["rahul@campus.os"]?._id] },
      { code: "EE-305", name: "Advanced Circuit Analysis", department: "Electrical Engineering", credits: 3, teachers: [teacherDocs["anita@campus.os"]?._id], students: [studentDocs["sneha@campus.os"]?._id] },
      { code: "CE-102", name: "Structural Mechanics", department: "Civil Engineering", credits: 3, teachers: [teacherDocs["vikram@campus.os"]?._id], students: [studentDocs["karan@campus.os"]?._id] },
    ];

    const courseDocs: any = {};
    for (const c of courseData) {
      const doc = await Course.findOneAndUpdate(
        { code: c.code },
        { name: c.name, code: c.code, department: c.department, credits: c.credits, teachers: c.teachers.filter(Boolean), students: c.students.filter(Boolean) },
        { upsert: true, new: true }
      );
      courseDocs[c.code] = doc;

      // Sync back to teachers
      for (const tId of doc.teachers) {
        await Teacher.findByIdAndUpdate(tId, { $addToSet: { courses: doc._id } });
      }
      // Sync back to students
      for (const sId of doc.students) {
        await Student.findByIdAndUpdate(sId, { $addToSet: { courses: doc._id } });
      }
    }

    // 5. Seed Attendance
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const yesterday = new Date(startOfDay);
    yesterday.setDate(yesterday.getDate() - 1);

    const markAttendance = async (studentEmail: string, courseCode: string, teacherEmail: string, date: Date, status: string) => {
      const student = studentDocs[studentEmail];
      const course = courseDocs[courseCode];
      const teacherUser = await User.findOne({ email: teacherEmail });
      
      if (student && course && teacherUser) {
        await Attendance.findOneAndUpdate(
          { student: student._id, course: course._id, date: date },
          { status: status, markedBy: teacherUser._id },
          { upsert: true }
        );
      }
    };

    // CS Attendance
    await markAttendance("anugrah@campus.os", "CS-301", "maninder@campus.os", startOfDay, "present");
    await markAttendance("riya@campus.os", "CS-301", "maninder@campus.os", startOfDay, "present");
    await markAttendance("anugrah@campus.os", "CS-301", "maninder@campus.os", yesterday, "late");
    
    // ME Attendance
    await markAttendance("rahul@campus.os", "ME-201", "rajesh@campus.os", startOfDay, "absent");
    
    // EE Attendance
    await markAttendance("sneha@campus.os", "EE-305", "anita@campus.os", startOfDay, "present");
    await markAttendance("sneha@campus.os", "EE-305", "anita@campus.os", yesterday, "present");

    // CE Attendance
    await markAttendance("karan@campus.os", "CE-102", "vikram@campus.os", startOfDay, "late");

    // 6. Seed Support Tickets
    const createTicket = async (email: string, subject: string, message: string, status: "open" | "resolved", reply?: string) => {
      const user = await User.findOne({ email });
      if (user) {
        await SupportTicket.findOneAndUpdate(
          { subject: subject },
          { user: user._id, message: message, status: status, reply: reply || "" },
          { upsert: true }
        );
      }
    };

    await createTicket("anugrah@campus.os", "Wi-Fi Issue in CS Dept", "The eduroam network in the CS wing is constantly dropping connections during labs.", "open");
    await createTicket("riya@campus.os", "ID Card Replacement", "I lost my ID card yesterday, how can I request a new one?", "resolved", "Please visit the admin block between 10 AM - 2 PM with Rs. 500 fee receipt.");
    await createTicket("rajesh@campus.os", "Lab Equipment Maintenance", "The CNC machine in ME Lab 2 needs calibration urgently before next week's practicals.", "open");

    return NextResponse.json({ success: true, message: "Comprehensive Indian Engineering ERP Seed Data Generated Successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
