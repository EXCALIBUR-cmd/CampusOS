import mongoose, { Schema, Document } from "mongoose";

export interface ICertification {
  name: string;
  issuer: string;
  date: Date;
  url?: string;
}

export interface IProject {
  title: string;
  desc: string;
  url?: string;
  image?: string;
}

export interface IStudent extends Document {
  user: mongoose.Types.ObjectId;
  commanderId: string;
  name: string;
  avatarUrl: string;
  department: string;
  semester: number;
  bio: string;
  skills: string[];
  totalXp: number;
  level: number;
  streak: number;
  cgpa: number;
  certifications: ICertification[];
  projects: IProject[];
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema = new Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: Date, required: true },
  url: { type: String },
});

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  url: { type: String },
  image: { type: String },
});

const StudentSchema = new Schema<IStudent>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    commanderId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    department: { type: String, required: true, index: true },
    semester: { type: Number, required: true, index: true },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    totalXp: { type: Number, default: 0, index: true },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0.0 },
    certifications: { type: [CertificationSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
  },
  { timestamps: true }
);

export const Student = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
export default Student;
