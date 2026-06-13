import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  desc: string;
  organizer: string;
  date: Date;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    organizer: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    xpReward: { type: Number, default: 500 },
  },
  { timestamps: true }
);

export const Event = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
export default Event;
