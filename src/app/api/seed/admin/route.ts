import { NextResponse } from "next/server";
import { registerUser } from "@/services/authService";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    
    const adminEmail = "admin@campusos.local";
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      return NextResponse.json({ success: true, message: "Admin already exists." });
    }

    const newAdmin = await registerUser({
      email: adminEmail,
      password: "admin123",
      role: "admin",
      name: "Master Admin",
      department: "System Administration"
    });

    return NextResponse.json({ success: true, message: "Master Admin seeded successfully", data: newAdmin });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
