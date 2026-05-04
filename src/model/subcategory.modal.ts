import mongoose, { Schema, Document } from "mongoose";

export interface ISubCategory extends Document {
  name: string;
  slug: string; // ✅ ADD THIS
  description:string;

  category: mongoose.Types.ObjectId;
  image?: string;
  isActive: boolean;
}

const SubCategorySchema = new Schema(
  {
    name: { type: String, required: true },
slug: {
  type: String,
  unique: true,
},
description: { type: String, default: "" }, // ✅ ADD THIS
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    image: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISubCategory>(
  "SubCategory",
  SubCategorySchema
);