import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, default: "Management" },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
export default Admin;
