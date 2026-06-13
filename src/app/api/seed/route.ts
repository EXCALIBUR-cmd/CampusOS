import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Teacher } from "@/models/Teacher";
import { Assignment } from "@/models/Assignment";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectToDatabase();

    // --- Create a teacher account if none exists ---
    let teacher = await Teacher.findOne();
    if (!teacher) {
      const hashedPassword = await bcrypt.hash("teacher123", 10);
      const teacherUser = new User({
        email: "prof.nova@campusos.local",
        password: hashedPassword,
        role: "teacher",
        isActive: true,
      });
      await teacherUser.save();

      teacher = new Teacher({
        user: teacherUser._id,
        name: "Prof. Nova Sterling",
        department: "Computer Science",
        designation: "Associate Professor",
      });
      await teacher.save();
    }

    // --- Skip if assignments already exist ---
    const existingCount = await Assignment.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already seeded with ${existingCount} assignments. No changes made.`,
      });
    }

    // --- Seed sample assignments ---
    const now = new Date();
    const inDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    const assignments = [
      {
        teacher: teacher._id,
        subject: "Data Structures & Algorithms",
        code: "CS201",
        title: "Binary Search Tree Implementation",
        desc: "Implement a BST with insert, delete, search, and traversal operations. Submit your code file with test cases.",
        due: inDays(5),
        xpReward: 500,
      },
      {
        teacher: teacher._id,
        subject: "Web Development",
        code: "CS305",
        title: "REST API Design Project",
        desc: "Design and implement a RESTful API for a task management app using Node.js and Express. Include authentication and CRUD operations.",
        due: inDays(7),
        xpReward: 650,
      },
      {
        teacher: teacher._id,
        subject: "Database Management Systems",
        code: "CS302",
        title: "ER Diagram & Normalization",
        desc: "Create an ER diagram for a university management system and normalize it to 3NF. Submit a PDF with explanations.",
        due: inDays(3),
        xpReward: 400,
      },
      {
        teacher: teacher._id,
        subject: "Operating Systems",
        code: "CS401",
        title: "Process Scheduling Simulator",
        desc: "Build a simulator that demonstrates FCFS, SJF, Round Robin, and Priority scheduling algorithms with Gantt chart output.",
        due: inDays(10),
        xpReward: 700,
      },
      {
        teacher: teacher._id,
        subject: "Machine Learning",
        code: "CS501",
        title: "Linear Regression Analysis",
        desc: "Perform linear regression on a provided dataset. Include data preprocessing, model training, evaluation metrics, and visualization.",
        due: inDays(14),
        xpReward: 550,
      },
    ];

    await Assignment.insertMany(assignments);

    return NextResponse.json({
      success: true,
      message: `Seeded ${assignments.length} assignments + 1 teacher (Prof. Nova Sterling)`,
      data: {
        teacherEmail: "prof.nova@campusos.local",
        teacherPassword: "teacher123",
        assignmentCount: assignments.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
