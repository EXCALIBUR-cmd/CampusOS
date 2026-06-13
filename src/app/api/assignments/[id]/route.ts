import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Assignment } from "@/models/Assignment";
import { Teacher } from "@/models/Teacher";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "teacher") {
      return NextResponse.json({ success: false, error: "Only educators can update directives" }, { status: 403 });
    }

    await connectToDatabase();

    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) {
      return NextResponse.json({ success: false, error: "Teacher profile not found" }, { status: 404 });
    }

    const { id } = await params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.teacher.toString() !== teacher._id.toString()) {
      return NextResponse.json({ success: false, error: "Forbidden: You do not own this assignment" }, { status: 403 });
    }

    const body = await request.json();
    const { subject, code, title, desc, due, xpReward } = body;

    if (subject !== undefined) assignment.subject = subject;
    if (code !== undefined) assignment.code = code;
    if (title !== undefined) assignment.title = title;
    if (desc !== undefined) assignment.desc = desc;
    if (due !== undefined) assignment.due = new Date(due);
    if (xpReward !== undefined) assignment.xpReward = xpReward;

    await assignment.save();
    return NextResponse.json({ success: true, data: assignment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "teacher") {
      return NextResponse.json({ success: false, error: "Only educators can delete directives" }, { status: 403 });
    }

    await connectToDatabase();

    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) {
      return NextResponse.json({ success: false, error: "Teacher profile not found" }, { status: 404 });
    }

    const { id } = await params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.teacher.toString() !== teacher._id.toString()) {
      return NextResponse.json({ success: false, error: "Forbidden: You do not own this assignment" }, { status: 403 });
    }

    await Assignment.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Assignment deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
