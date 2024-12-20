import mongoose from "mongoose";

const snippetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description:{ type: String, required: true },
  tags: { type: [String], required: true },
  language: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  code: { type: String },
  filename: { type: String },
  type: { type: String, required: true },
});

export const snippetModel = mongoose.model("Snippet", snippetSchema);
