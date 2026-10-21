import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      default: "en",
    },
    params: {
      type: [String], // values for {{1}}, {{2}}... in the template body
      default: [],
    },
    headerImage: {
      type: String, // only for templates with an image header
    },
    status: {
      type: String,
      enum: ["sending", "completed", "failed"],
      default: "sending",
    },
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 }, // accepted by Meta
    failed: { type: Number, default: 0 },
    // filled in later by Meta's status webhook
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    // first few failures, for troubleshooting
    failures: {
      type: [{ phone: String, error: String }],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Broadcast = mongoose.model("Broadcast", broadcastSchema);
