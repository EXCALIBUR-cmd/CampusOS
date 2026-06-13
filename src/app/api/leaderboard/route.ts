import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const semester = searchParams.get("semester");

    const filter: any = {};
    if (department && department !== "all" && department !== "") {
      // Handle simple casing mapping
      if (department.toLowerCase() === "alpha") {
        filter.department = "Alpha Squad";
      } else if (department.toLowerCase() === "cyber") {
        filter.department = "Cyber Knights";
      } else if (department.toLowerCase() === "beta") {
        filter.department = "Beta Void";
      } else {
        filter.department = department;
      }
    }
    if (semester && semester !== "all" && semester !== "") {
      filter.semester = parseInt(semester);
    }

    const students = await Student.find(filter)
      .sort({ totalXp: -1 })
      .select("commanderId name avatarUrl department semester totalXp level user");

    const rankings = students.map((std, idx) => ({
      rank: idx + 1,
      id: std._id.toString(),
      commanderId: std.commanderId,
      name: std.name,
      avatarUrl: std.avatarUrl,
      department: std.department,
      semester: std.semester,
      xp: std.totalXp,
      level: std.level,
      isUser: std.user.toString() === userId,
    }));

    return NextResponse.json({ success: true, data: rankings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
