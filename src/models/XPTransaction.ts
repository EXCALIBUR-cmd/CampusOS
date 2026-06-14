import mongoose, { Schema, Document } from "mongoose";

export interface IXPTransaction extends Document {
  student: mongoose.Types.ObjectId;
  amount: number;
  action: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const XPTransactionSchema = new Schema<IXPTransaction>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    amount: { type: Number, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const XPTransaction =
  mongoose.models.XPTransaction || mongoose.model<IXPTransaction>("XPTransaction", XPTransactionSchema);
export default XPTransaction;
