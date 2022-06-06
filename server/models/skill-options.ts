import { Schema, model } from "mongoose";

const schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }
}, {
  timestamps: {
    createdAt: "createdDate"
  }
});

const SkillOptionModel = model("SkillOption", schema, "SkillOption");

export default SkillOptionModel;