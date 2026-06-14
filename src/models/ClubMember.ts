import mongoose, { Schema, Document } from "mongoose";

export interface IClubMember extends Document {
  club: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  role: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClubMemberSchema = new Schema<IClubMember>(
  {
    club: { type: Schema.Types.ObjectId, ref: "Club", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    role: { type: String, default: "Member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ClubMemberSchema.index({ club: 1, student: 1 }, { unique: true });

export const ClubMember = mongoose.models.ClubMember || mongoose.model<IClubMember>("ClubMember", ClubMemberSchema);
export default ClubMember;
