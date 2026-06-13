import mongoose, { Schema, Document } from "mongoose";

export interface IClub extends Document {
  name: string;
  description: string;
  leader?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    leader: { type: Schema.Types.ObjectId, ref: "Student" },
  },
  { timestamps: true }
);

export const Club = mongoose.models.Club || mongoose.model<IClub>("Club", ClubSchema);
export default Club;
