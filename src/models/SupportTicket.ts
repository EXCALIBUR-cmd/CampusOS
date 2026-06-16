import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
  user: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: "open" | "resolved";
  reply: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    reply: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
export default SupportTicket;
