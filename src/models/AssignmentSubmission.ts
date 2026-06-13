import mongoose, { Schema, Document } from "mongoose";

export interface IAssignmentSubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  submittedAt: Date;
  status: "complete" | "overdue";
  graded: boolean;
  grade?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: "Assignment", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["complete", "overdue"], default: "complete" },
    graded: { type: Boolean, default: false },
    grade: { type: String },
  },
  { timestamps: true }
);

// Compound index to ensure a student submits only once per assignment
AssignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const AssignmentSubmission =
  mongoose.models.AssignmentSubmission ||
  mongoose.model<IAssignmentSubmission>("AssignmentSubmission", AssignmentSubmissionSchema);
export default AssignmentSubmission;
