import { NextResponse } from "next/server";
import { registerUser } from "@/services/authService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerUser(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
