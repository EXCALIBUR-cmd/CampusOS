import { User } from "@/models/User";
import { Teacher } from "@/models/Teacher";
import { Assignment } from "@/models/Assignment";
import bcrypt from "bcryptjs";

let seeded = false;

export async function seedIfEmpty() {
  if (seeded) return;
  seeded = true;

  try {
    const count = await Assignment.countDocuments();
    if (count > 0) return; // Already has data, skip

    console.log("[Seed] Empty database detected — seeding sample data...");

    // Create teacher account
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
    console.log(`[Seed] ✓ Created ${assignments.length} assignments + teacher (Prof. Nova Sterling)`);
  } catch (error: any) {
    console.warn("[Seed] Auto-seed skipped:", error.message);
  }
}
