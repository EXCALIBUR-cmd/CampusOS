import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { registerUser } from "@/services/authService";

export async function GET() {
  try {
    await connectToDatabase();
    
    const users = await User.find()
      .populate("studentProfile")
      .populate("teacherProfile")
      .populate("adminProfile")
      .select("-password")
      .lean();

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    
    const newUser = await registerUser({
      email: data.email,
      password: data.password || "12345678",
      role: data.role,
      name: data.name,
      department: data.department || "General",
      commanderId: data.commanderId,
      semester: data.semester,
      designation: data.designation,
    });

    return NextResponse.json({ success: true, data: newUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
