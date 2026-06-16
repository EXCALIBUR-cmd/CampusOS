import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";
import { Admin } from "@/models/Admin";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    
    // Resolve the params promise (Next.js 15+ standard for dynamic routes)
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId)
      .populate({
        path: "studentProfile",
        populate: {
          path: "courses",
          populate: { path: "teachers" }
        }
      })
      .populate({
        path: "teacherProfile",
        populate: { path: "courses" }
      })
      .populate("adminProfile")
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
