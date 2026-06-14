import mongoose, { Schema, Document } from "mongoose";

export interface IBadge extends Document {
  student: mongoose.Types.ObjectId;
  achievement: mongoose.Types.ObjectId;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    achievement: { type: Schema.Types.ObjectId, ref: "Achievement", required: true, index: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BadgeSchema.index({ student: 1, achievement: 1 }, { unique: true });

export const Badge = mongoose.models.Badge || mongoose.model<IBadge>("Badge", BadgeSchema);
export default Badge;
