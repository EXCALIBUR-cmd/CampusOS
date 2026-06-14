import mongoose, { Schema, Document } from "mongoose";

export interface IAIMessage {
  sender: "user" | "ai";
  text: string;
  time: Date;
}

export interface IAIConversation extends Document {
  student: mongoose.Types.ObjectId;
  messages: IAIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema({
  sender: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

const AIConversationSchema = new Schema<IAIConversation>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    messages: { type: [AIMessageSchema], default: [] },
  },
  { timestamps: true }
);

export const AIConversation =
  mongoose.models.AIConversation || mongoose.model<IAIConversation>("AIConversation", AIConversationSchema);
export default AIConversation;
