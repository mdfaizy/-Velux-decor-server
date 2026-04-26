import mongoose from "mongoose";

const showroomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    src: {
      type: String, // video URL
      required: true,
    },
    thumbnail: {
      type: String, // image URL
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Showroom = mongoose.model("Showroom", showroomSchema);