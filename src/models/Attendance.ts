import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  subject: string;
  code: string;
  teacher: mongoose.Types.ObjectId;
  totalLectures: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    subject: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    totalLectures: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
export default Attendance;
