import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { SupportTicket } from "@/models/SupportTicket";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();

    let query = {};
    if (role !== "admin") {
      query = { user: userId };
    }

    const tickets = await SupportTicket.find(query)
      .populate("user", "email role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    await connectToDatabase();
    const data = await request.json();

    const newTicket = new SupportTicket({
      user: userId,
      subject: data.subject,
      message: data.message,
    });

    await newTicket.save();

    return NextResponse.json({ success: true, data: newTicket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
