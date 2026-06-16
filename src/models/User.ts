import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  role: "student" | "teacher" | "admin";
  isActive: boolean;
  studentProfile?: mongoose.Types.ObjectId;
  teacherProfile?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student", index: true },
    isActive: { type: Boolean, default: true },
    studentProfile: { type: Schema.Types.ObjectId, ref: "Student" },
    teacherProfile: { type: Schema.Types.ObjectId, ref: "Teacher" },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
