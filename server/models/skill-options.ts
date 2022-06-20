import { Schema, model } from "mongoose";

export interface SkillOption {
  code: string;
  description: string;
  category: string;
}

export const SkillOptionModel = model<SkillOption>('SkillOption', new Schema({
  code: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }
}, {
  timestamps: {
    createdAt: "createdDate"
  }
}));