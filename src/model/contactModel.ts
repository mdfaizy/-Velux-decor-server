import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    phone: {
      type: String,
      trim: true,
    },

    service: {
      type: String,
      enum: [
        "Interior Design",
        "Home Decor",
        "Office Setup",
        "Renovation",
        "Other",
      ],
      default: "Other",
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message too long"],
    },

    // 🔥 optional useful fields
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;