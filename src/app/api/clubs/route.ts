import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Club } from "@/models/Club";
import { Student } from "@/models/Student";
import { ClubMember } from "@/models/ClubMember";
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

    const clubs = await Club.find().populate("leader", "name");

    if (role === "student") {
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
      }

      const memberships = await ClubMember.find({ student: student._id });
      const memberClubIds = new Set(memberships.map((m) => m.club.toString()));

      const enhancedClubs = clubs.map((club) => ({
        id: club._id.toString(),
        name: club.name,
        description: club.description,
        leader: club.leader,
        isMember: memberClubIds.has(club._id.toString()),
      }));

      return NextResponse.json({ success: true, data: enhancedClubs });
    }

    return NextResponse.json({ success: true, data: clubs });
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
      const { clubId } = body;
      if (!clubId) {
        return NextResponse.json({ success: false, error: "Club ID is required" }, { status: 400 });
      }

      const student = await Student.findOne({ user: userId });
      if (!student) {
        return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
      }

      const club = await Club.findById(clubId);
      if (!club) {
        return NextResponse.json({ success: false, error: "Club not found" }, { status: 404 });
      }

      const membership = new ClubMember({
        club: clubId,
        student: student._id,
      });
      await membership.save();

      const xpResult = await awardXP(userId, "Club Participation", 300);

      return NextResponse.json({
        success: true,
        data: {
          membership,
          xpEarned: 300,
          levelUp: xpResult?.levelIncreased || false,
          newLevel: xpResult?.newLevel,
        },
      });
    }

    const { name, description } = body;
    if (!name || !description) {
      return NextResponse.json({ success: false, error: "Missing required club fields" }, { status: 400 });
    }

    const club = new Club({
      name,
      description,
    });
    await club.save();

    return NextResponse.json({ success: true, data: club }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "You are already a member of this club" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
