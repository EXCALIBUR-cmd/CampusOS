import mongoose, { Schema, Document } from "mongoose";

export interface IResource extends Document {
  title: string;
  category: "Notes" | "PDFs" | "PYQs" | "Research";
  subjectCode: string;
  fileUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ["Notes", "PDFs", "PYQs", "Research"], required: true },
    subjectCode: { type: String, required: true, index: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Resource = mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);
export default Resource;
