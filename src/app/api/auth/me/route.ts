import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const role = headersList.get("x-user-role");

  if (!userId || !role) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: { userId, role } });
}
