import mongoose from "mongoose";

const codeBlockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], required: true },
  language: { type: String, required: true },
  snippets: {
    type: [
      {
        title: { type: String, required: true },
        code: { type: String, required: true },
        filename: { type: String, required: true },
      },
    ],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  type: { type: String, required: true },
});

export const codeBlockModel = mongoose.model("CodeBlock", codeBlockSchema);
