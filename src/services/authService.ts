import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";

export async function registerUser(data: {
  email: string;
  password?: string;
  role: "student" | "teacher" | "admin";
  name: string;
  department: string;
  commanderId?: string;
  semester?: number;
  designation?: string;
}) {
  await connectToDatabase();

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password || "12345678", 10);

  const user = new User({
    email: data.email,
    password: hashedPassword,
    role: data.role,
  });
  await user.save();

  try {
    if (data.role === "student") {
      const commanderId = data.commanderId || `student_${Math.floor(100 + Math.random() * 900)}`;
      const existingStudent = await Student.findOne({ commanderId });
      if (existingStudent) {
        throw new Error("Commander ID already in use");
      }

      const student = new Student({
        user: user._id,
        commanderId,
        name: data.name,
        department: data.department,
        semester: data.semester || 1,
      });
      await student.save();
      user.studentProfile = student._id;
      await user.save();
    } else if (data.role === "teacher") {
      const teacher = new Teacher({
        user: user._id,
        name: data.name,
        department: data.department,
        designation: data.designation || "Assistant Professor",
      });
      await teacher.save();
      user.teacherProfile = teacher._id;
      await user.save();
    }
  } catch (error) {
    // Cascade delete user credential if profile creation fails
    await User.findByIdAndDelete(user._id);
    throw error;
  }

  return { userId: user._id.toString(), email: user.email, role: user.role };
}

export async function loginUser(credentials: { email: string; password?: string }) {
  await connectToDatabase();

  const identifier = credentials.email.trim();
  const rawPassword = credentials.password || "12345678";

  // Try to find user by email or by commanderId
  let user = await User.findOne({ email: identifier.toLowerCase() });
  if (!user) {
    const student = await Student.findOne({ commanderId: identifier });
    if (student) {
      user = await User.findById(student.user);
    }
  }

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // --- Existing user: verify password ---
  if (!user.isActive) {
    throw new Error("Account is inactive. Contact your administrator.");
  }

  const isPasswordValid = await bcrypt.compare(rawPassword, user.password || "");
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return { userId: user._id.toString(), role: user.role };
}
