import mongoose from "mongoose";

// One row per WhatsApp message sent, updated by Meta's status webhook
const messageLogSchema = new mongoose.Schema(
  {
    wamid: {
      type: String, // message id returned by Meta
      required: true,
      unique: true,
    },
    broadcast: {
      type: mongoose.Schema.Types.ObjectId, // null for test messages
      ref: "Broadcast",
      default: null,
    },
    phone: {
      type: String,
    },
    status: {
      type: String,
      enum: ["accepted", "sent", "delivered", "read", "failed"],
      default: "accepted",
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const MessageLog = mongoose.model("MessageLog", messageLogSchema);
