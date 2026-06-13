import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  teacher: mongoose.Types.ObjectId;
  subject: string;
  code: string;
  title: string;
  desc: string;
  due: Date;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    subject: { type: String, required: true },
    code: { type: String, required: true, index: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    due: { type: Date, required: true },
    xpReward: { type: Number, default: 450 },
  },
  { timestamps: true }
);

export const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>("Assignment", AssignmentSchema);
export default Assignment;
