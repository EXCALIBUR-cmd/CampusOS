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
    } else if (data.role === "teacher") {
      const teacher = new Teacher({
        user: user._id,
        name: data.name,
        department: data.department,
        designation: data.designation || "Assistant Professor",
      });
      await teacher.save();
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

  // --- Auto-register if user doesn't exist ---
  if (!user) {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const email = identifier.includes("@") ? identifier.toLowerCase() : `${identifier.toLowerCase()}@campusos.local`;

    user = new User({
      email,
      password: hashedPassword,
      role: "student",
      isActive: true,
    });
    await user.save();

    // Create a matching Student profile
    const commanderId = identifier.includes("@") ? identifier.split("@")[0] : identifier;
    const student = new Student({
      user: user._id,
      commanderId,
      name: commanderId.charAt(0).toUpperCase() + commanderId.slice(1),
      department: "General",
      semester: 1,
    });
    await student.save();

    return { userId: user._id.toString(), role: user.role };
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
