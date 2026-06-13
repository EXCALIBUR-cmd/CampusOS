import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { PlacementProfile } from "@/models/PlacementProfile";
import { uploadFile } from "@/services/imagekitService";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "student") {
      return NextResponse.json({ success: false, error: "Only students have placement profiles" }, { status: 403 });
    }

    await connectToDatabase();

    const student = await Student.findOne({ user: userId });
    if (!student) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    let placement = await PlacementProfile.findOne({ student: student._id });
    if (!placement) {
      placement = new PlacementProfile({
        student: student._id,
        readinessScore: 0,
      });
      await placement.save();
    }

    let score = 0;
    if (placement.resumeUrl) score += 20;
    score += Math.min(student.skills.length * 5, 25);
    score += Math.min(student.projects.length * 15, 30);
    score += Math.min(student.certifications.length * 15, 30);
    score = Math.min(score, 100);

    if (placement.readinessScore !== score) {
      placement.readinessScore = score;
      await placement.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: placement,
        readinessScore: score,
        skillsCount: student.skills.length,
        projectsCount: student.projects.length,
        certificationsCount: student.certifications.length,
        isPlaced: placement.isPlaced,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "student") {
      return NextResponse.json({ success: false, error: "Only students can update placement profile" }, { status: 403 });
    }

    await connectToDatabase();

    const student = await Student.findOne({ user: userId });
    if (!student) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { resumeBase64, resumeFileName, isPlaced } = body;

    let placement = await PlacementProfile.findOne({ student: student._id });
    if (!placement) {
      placement = new PlacementProfile({ student: student._id });
    }

    if (resumeBase64 && resumeFileName) {
      const uploadResult = await uploadFile(resumeBase64, resumeFileName, "resumes");
      if (!uploadResult.success || !uploadResult.url) {
        return NextResponse.json({ success: false, error: uploadResult.error || "File upload failed" }, { status: 500 });
      }
      placement.resumeUrl = uploadResult.url;
    }

    if (isPlaced !== undefined) {
      placement.isPlaced = isPlaced;
    }

    let score = 0;
    if (placement.resumeUrl) score += 20;
    score += Math.min(student.skills.length * 5, 25);
    score += Math.min(student.projects.length * 15, 30);
    score += Math.min(student.certifications.length * 15, 30);
    score = Math.min(score, 100);

    placement.readinessScore = score;
    await placement.save();

    return NextResponse.json({ success: true, data: placement });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
