import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  code: string;
  headOfDepartment: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true },
    headOfDepartment: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Department = mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);
export default Department;
