import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  date: Date;
  status: "present" | "late" | "absent";
  markedBy: mongoose.Types.ObjectId; // Teacher or Admin who marked it
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "late", "absent"], required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Ensure a student can only have one attendance record per course per day
AttendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
export default Attendance;
