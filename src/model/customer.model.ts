import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String, // normalised: country code + number, digits only (e.g. 919876543210)
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    source: {
      type: String,
      enum: ["contact", "manual", "import"],
      default: "manual",
    },
    // WhatsApp only allows marketing messages to people who agreed to receive them
    whatsappOptIn: {
      type: Boolean,
      default: false,
    },
    optInAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Customer = mongoose.model("Customer", customerSchema);
