import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { SupportTicket } from "@/models/SupportTicket";
import { Notification } from "@/models/Notification";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const role = headersList.get("x-user-role");
    const resolvedParams = await params;

    if (role !== "admin") {
      return NextResponse.json({ success: false, error: "Only admins can resolve tickets" }, { status: 403 });
    }

    await connectToDatabase();
    const data = await request.json();

    const ticket = await SupportTicket.findById(resolvedParams.id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    if (data.status !== undefined) ticket.status = data.status;
    if (data.reply !== undefined) ticket.reply = data.reply;

    await ticket.save();

    await Notification.create({
      recipient: ticket.user,
      title: "Support Ticket Updated",
      message: `Your ticket regarding "${ticket.subject}" has been updated.`,
      type: "System",
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
