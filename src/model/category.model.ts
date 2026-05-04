// import mongoose, { Schema, Document } from "mongoose";

// export interface ICategory extends Document {
//   name: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const CategorySchema: Schema = new Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Category name is required"],
//       trim: true,
//       unique: true,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // 🔥 index for search
// CategorySchema.index({ name: "text" });

// const Category = mongoose.model<ICategory>("Category", CategorySchema);

// export default Category;

import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  badge?: string;
  slug?: string;
  isActive: boolean;
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },

    description: { type: String, default: "" },

    image: { type: String, default: "" }, // banner

    icon: { type: String, default: "" }, // small icon

    badge: { type: String, default: "" }, // dynamic

    slug: { type: String, unique: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>("Category", CategorySchema);