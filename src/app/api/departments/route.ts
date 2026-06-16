import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Department } from "@/models/Department";

export async function GET() {
  try {
    await connectToDatabase();
    const departments = await Department.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: departments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const role = headersList.get("x-user-role");

    if (role !== "admin") {
      return NextResponse.json({ success: false, error: "Only admins can manage departments" }, { status: 403 });
    }

    await connectToDatabase();
    const data = await request.json();

    const existingDept = await Department.findOne({ $or: [{ name: data.name }, { code: data.code }] });
    if (existingDept) {
      return NextResponse.json({ success: false, error: "Department with this name or code already exists" }, { status: 400 });
    }

    const newDept = new Department({
      name: data.name,
      code: data.code,
      headOfDepartment: data.headOfDepartment || "",
      description: data.description || "",
    });

    await newDept.save();

    return NextResponse.json({ success: true, data: newDept });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
