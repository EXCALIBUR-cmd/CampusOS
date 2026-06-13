import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Student } from "@/models/Student";
import { AssignmentSubmission } from "@/models/AssignmentSubmission";
import { uploadFile } from "@/services/imagekitService";
import { awardXP } from "@/services/xpEngine";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "student") {
      return NextResponse.json({ success: false, error: "Only students can submit assignments" }, { status: 403 });
    }

    await connectToDatabase();

    const student = await Student.findOne({ user: userId });
    if (!student) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const { id } = await params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    const body = await request.json();
    const { fileBase64, fileName } = body;

    if (!fileBase64 || !fileName) {
      return NextResponse.json({ success: false, error: "Submission file is required" }, { status: 400 });
    }

    // 1. Upload file to ImageKit
    const uploadResult = await uploadFile(fileBase64, fileName, "Assignments");
    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json({ success: false, error: uploadResult.error || "File upload failed" }, { status: 500 });
    }

    // 2. Evaluate deadlines
    const isOverdue = new Date() > new Date(assignment.due);
    const status = isOverdue ? "overdue" : "complete";

    // 3. Save submission record
    const submission = new AssignmentSubmission({
      assignment: assignment._id,
      student: student._id,
      fileUrl: uploadResult.url,
      fileName: fileName,
      status,
    });
    await submission.save();

    // 4. Award XP points
    const xpResult = await awardXP(userId, "Assignment Submission", assignment.xpReward);

    return NextResponse.json({
      success: true,
      data: {
        submission,
        xpEarned: assignment.xpReward,
        levelUp: xpResult?.levelIncreased || false,
        newLevel: xpResult?.newLevel,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "You have already submitted this assignment" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
