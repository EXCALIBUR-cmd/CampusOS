import mongoose, { Schema, Document } from "mongoose";

export interface IPlacementProfile extends Document {
  student: mongoose.Types.ObjectId;
  resumeUrl?: string;
  readinessScore: number;
  isPlaced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlacementProfileSchema = new Schema<IPlacementProfile>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    resumeUrl: { type: String },
    readinessScore: { type: Number, default: 0 },
    isPlaced: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PlacementProfile =
  mongoose.models.PlacementProfile || mongoose.model<IPlacementProfile>("PlacementProfile", PlacementProfileSchema);
export default PlacementProfile;
