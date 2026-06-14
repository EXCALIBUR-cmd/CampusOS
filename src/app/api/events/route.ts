import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/Event";
import { Student } from "@/models/Student";
import { EventRegistration } from "@/models/EventRegistration";
import { awardXP } from "@/services/xpEngine";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const events = await Event.find().sort({ date: 1 });

    if (role === "student") {
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
      }

      const registrations = await EventRegistration.find({ student: student._id });
      const registeredEventIds = new Set(registrations.map((r) => r.event.toString()));

      const enhancedEvents = events.map((ev) => ({
        id: ev._id.toString(),
        title: ev.title,
        desc: ev.desc,
        organizer: ev.organizer,
        date: ev.date,
        xpReward: ev.xpReward,
        registered: registeredEventIds.has(ev._id.toString()),
      }));

      return NextResponse.json({ success: true, data: enhancedEvents });
    }

    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();

    if (role === "student") {
      const { eventId } = body;
      if (!eventId) {
        return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
      }

      const student = await Student.findOne({ user: userId });
      if (!student) {
        return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
      }

      const registration = new EventRegistration({
        event: eventId,
        student: student._id,
        attended: true,
      });
      await registration.save();

      const xpResult = await awardXP(userId, "Event Participation", event.xpReward);

      return NextResponse.json({
        success: true,
        data: {
          registration,
          xpEarned: event.xpReward,
          levelUp: xpResult?.levelIncreased || false,
          newLevel: xpResult?.newLevel,
        },
      });
    }

    // Teacher or admin creating a new event
    const { title, desc, organizer, date, xpReward } = body;
    if (!title || !desc || !organizer || !date) {
      return NextResponse.json({ success: false, error: "Missing required event fields" }, { status: 400 });
    }

    const event = new Event({
      title,
      desc,
      organizer,
      date: new Date(date),
      xpReward: xpReward || 500,
    });
    await event.save();

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "You are already registered for this event" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
