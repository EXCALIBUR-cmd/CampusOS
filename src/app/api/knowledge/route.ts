import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { Student } from "@/models/Student";
import { uploadFile } from "@/services/imagekitService";
import { awardXP } from "@/services/xpEngine";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subjectCode = searchParams.get("subjectCode");
    const query = searchParams.get("q");

    const filter: any = {};
    if (category) filter.category = category;
    if (subjectCode) filter.subjectCode = subjectCode.toUpperCase();
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { subjectCode: { $regex: query, $options: "i" } },
      ];
    }

    const resources = await Resource.find(filter)
      .populate("uploadedBy", "name commanderId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: resources });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "student") {
      return NextResponse.json({ success: false, error: "Only students can upload resources" }, { status: 403 });
    }

    await connectToDatabase();

    const student = await Student.findOne({ user: userId });
    if (!student) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, category, subjectCode, fileBase64, fileName } = body;

    if (!title || !category || !subjectCode || !fileBase64 || !fileName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const uploadResult = await uploadFile(fileBase64, fileName, "resources");
    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json({ success: false, error: uploadResult.error || "File upload failed" }, { status: 500 });
    }

    const resource = new Resource({
      title,
      category,
      subjectCode: subjectCode.toUpperCase(),
      fileUrl: uploadResult.url,
      uploadedBy: student._id,
    });
    await resource.save();

    const xpResult = await awardXP(userId, "Resource Contribution", 200);

    return NextResponse.json({
      success: true,
      data: {
        resource,
        xpEarned: 200,
        levelUp: xpResult?.levelIncreased || false,
        newLevel: xpResult?.newLevel,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
