import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { AssignmentSubmission } from "@/models/AssignmentSubmission";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const assignments = await Assignment.find().sort({ due: 1 }).populate("teacher", "name designation");

    if (role === "student") {
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return NextResponse.json({ success: false, error: "Student dossier not found" }, { status: 404 });
      }

      const submissions = await AssignmentSubmission.find({ student: student._id });
      const submissionMap = new Map(
        submissions.map((sub) => [sub.assignment.toString(), sub])
      );

      const enhancedAssignments = assignments.map((assign) => {
        const sub = submissionMap.get(assign._id.toString());
        let status = "pending";
        if (sub) {
          status = sub.status === "complete" ? "complete" : "overdue";
        } else if (new Date() > new Date(assign.due)) {
          status = "overdue";
        }

        return {
          id: assign._id.toString(),
          subject: assign.subject,
          code: assign.code,
          title: assign.title,
          desc: assign.desc,
          due: assign.due,
          xp: `+${assign.xpReward} XP`,
          status,
          submission: sub ? { fileUrl: sub.fileUrl, fileName: sub.fileName, submittedAt: sub.submittedAt } : null,
        };
      });

      return NextResponse.json({ success: true, data: enhancedAssignments });
    }

    // For teachers, return lists augmented with submission counters
    const enhancedAssignments = await Promise.all(
      assignments.map(async (assign) => {
        const count = await AssignmentSubmission.countDocuments({ assignment: assign._id });
        return {
          id: assign._id.toString(),
          subject: assign.subject,
          code: assign.code,
          title: assign.title,
          desc: assign.desc,
          due: assign.due,
          xpReward: assign.xpReward,
          submissionsCount: count,
        };
      })
    );

    return NextResponse.json({ success: true, data: enhancedAssignments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "teacher") {
      return NextResponse.json({ success: false, error: "Only educators can issue directives" }, { status: 403 });
    }

    await connectToDatabase();

    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) {
      return NextResponse.json({ success: false, error: "Teacher profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { subject, code, title, desc, due, xpReward } = body;

    if (!subject || !code || !title || !desc || !due) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const assignment = new Assignment({
      teacher: teacher._id,
      subject,
      code,
      title,
      desc,
      due: new Date(due),
      xpReward: xpReward || 450,
    });

    await assignment.save();
    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
