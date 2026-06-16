import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Department } from "@/models/Department";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const role = headersList.get("x-user-role");
    const resolvedParams = await params;

    if (role !== "admin") {
      return NextResponse.json({ success: false, error: "Only admins can edit departments" }, { status: 403 });
    }

    await connectToDatabase();
    const data = await request.json();

    const dept = await Department.findById(resolvedParams.id);
    if (!dept) {
      return NextResponse.json({ success: false, error: "Department not found" }, { status: 404 });
    }

    if (data.name !== undefined) dept.name = data.name;
    if (data.code !== undefined) dept.code = data.code;
    if (data.headOfDepartment !== undefined) dept.headOfDepartment = data.headOfDepartment;
    if (data.description !== undefined) dept.description = data.description;

    await dept.save();

    return NextResponse.json({ success: true, data: dept });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const role = headersList.get("x-user-role");
    const resolvedParams = await params;

    if (role !== "admin") {
      return NextResponse.json({ success: false, error: "Only admins can delete departments" }, { status: 403 });
    }

    await connectToDatabase();
    
    const dept = await Department.findByIdAndDelete(resolvedParams.id);
    if (!dept) {
      return NextResponse.json({ success: false, error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Department deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
