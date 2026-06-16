import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { AIConversation } from "@/models/AIConversation";
import { getAIProvider } from "@/services/ai";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "student") {
      return NextResponse.json({ success: false, error: "Only students can consult the Academic Intel" }, { status: 403 });
    }

    await connectToDatabase();

    const student = await Student.findOne({ user: userId });
    if (!student) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const thread = await AIConversation.findOne({ student: student._id });
    if (!thread || thread.messages.length === 0) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const formattedMessages = thread.messages.map((m: any) => ({
      id: m._id ? m._id.toString() : Math.random().toString(),
      sender: m.sender,
      text: m.text,
      time: new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

    return NextResponse.json({ success: true, messages: formattedMessages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    if (!userId || role !== "student") {
      return NextResponse.json({ success: false, error: "Only students can consult the Academic Intel" }, { status: 403 });
    }

    await connectToDatabase();

    const student = await Student.findOne({ user: userId });
    if (!student) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt directive is required" }, { status: 400 });
    }

    let thread = await AIConversation.findOne({ student: student._id });
    if (!thread) {
      thread = new AIConversation({ student: student._id, messages: [] });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queriesToday = thread.messages.filter(
      (m: any) => m.sender === "user" && new Date(m.time) >= today
    ).length;

    if (queriesToday >= 10) {
      return NextResponse.json(
        { success: false, error: "Daily AI query limit reached (10/10). Please return tomorrow." },
        { status: 429 }
      );
    }

    thread.messages.push({
      sender: "user",
      text: prompt,
      time: new Date(),
    });

    const conversationHistory = thread.messages.map((m: any) => ({
      role: m.sender === "ai" ? ("model" as const) : ("user" as const),
      content: m.text,
    }));

    // Slice history to avoid passing too many tokens while preserving system prompt
    const recentHistory = conversationHistory.slice(-20);

    const messagesForAI = [
      {
        role: "system" as const,
        content: `You are the CampusOS Academic Intel Matrix, a futuristic and cool AI companion. You assist student ${student.name} (Student ID: ${student.commanderId}, Semester: ${student.semester}, Department: ${student.department}).
- Talk naturally and conversationally. Answer general questions, code queries, or hold general discussions like a normal chat assistant.
- Maintain a clean, futuristic, and highly technical tone, but do NOT prefix every message with "System Check" or structure responses as rigid menu lists unless explicitly requested.
- Only reference specific student dossier properties (Semester, ID, Department) when they are directly relevant to the user's question.`,
      },
      ...recentHistory,
    ];

    const provider = getAIProvider();
    const aiResponseText = await provider.generateResponse(messagesForAI);

    thread.messages.push({
      sender: "ai",
      text: aiResponseText,
      time: new Date(),
    });

    await thread.save();

    return NextResponse.json({
      success: true,
      data: {
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

