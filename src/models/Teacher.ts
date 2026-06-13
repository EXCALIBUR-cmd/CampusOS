import mongoose, { Schema, Document } from "mongoose";

export interface ITeacher extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  department: string;
  designation: string;
  subjects: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true, index: true },
    designation: { type: String, required: true },
    subjects: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Teacher = mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);
export default Teacher;
