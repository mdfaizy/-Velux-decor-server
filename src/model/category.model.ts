import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 index for search
CategorySchema.index({ name: "text" });

const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;