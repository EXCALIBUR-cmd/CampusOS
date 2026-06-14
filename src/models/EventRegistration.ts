import mongoose, { Schema, Document } from "mongoose";

export interface IEventRegistration extends Document {
  event: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  registeredAt: Date;
  attended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    registeredAt: { type: Date, default: Date.now },
    attended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

export const EventRegistration =
  mongoose.models.EventRegistration || mongoose.model<IEventRegistration>("EventRegistration", EventRegistrationSchema);
export default EventRegistration;
