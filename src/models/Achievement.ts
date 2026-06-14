import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
  name: string;
  desc: string;
  xpReward: number;
  icon: string;
  category: "academic" | "participation" | "speed";
  rarity: "common" | "rare" | "legendary";
  criteria: {
    type: "attendance" | "assignments" | "xp";
    target: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    name: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    xpReward: { type: Number, required: true },
    icon: { type: String, required: true },
    category: { type: String, enum: ["academic", "participation", "speed"], required: true },
    rarity: { type: String, enum: ["common", "rare", "legendary"], required: true },
    criteria: {
      type: { type: String, enum: ["attendance", "assignments", "xp"], required: true },
      target: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export const Achievement =
  mongoose.models.Achievement || mongoose.model<IAchievement>("Achievement", AchievementSchema);
export default Achievement;
