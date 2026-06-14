import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceRecord extends Document {
  student: mongoose.Types.ObjectId;
  attendance: mongoose.Types.ObjectId;
  date: Date;
  status: "present" | "late" | "absent";
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    attendance: { type: Schema.Types.ObjectId, ref: "Attendance", required: true, index: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["present", "late", "absent"], required: true },
  },
  { timestamps: true }
);

AttendanceRecordSchema.index({ student: 1, attendance: 1, date: 1 });

export const AttendanceRecord =
  mongoose.models.AttendanceRecord || mongoose.model<IAttendanceRecord>("AttendanceRecord", AttendanceRecordSchema);
export default AttendanceRecord;
