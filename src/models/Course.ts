import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  code: string;
  name: string;
  department: string;
  credits: number;
  description: string;
  teachers: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    department: { type: String, required: true, index: true },
    credits: { type: Number, required: true, default: 3 },
    description: { type: String, default: "" },
    teachers: [{ type: Schema.Types.ObjectId, ref: "Teacher" }],
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true }
);

export const Course = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
export default Course;
