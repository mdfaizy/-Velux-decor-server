// import mongoose, { Schema, Document } from "mongoose";

// export interface IProduct extends Document {
//   name: string;
//  category: mongoose.Types.ObjectId;
//   description: string;
//   price: number;
//   stock: number;
//   images: string[];
//   features: string[];
//   isAvailable: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const ProductSchema: Schema = new Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Product name is required"],
//       trim: true,
//     },
//    category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//     },
//     description: {
//       type: String,
//       required: [true, "Description is required"],
//     },
//     price: {
//       type: Number,
//       required: [true, "Price is required"],
//       min: 0,
//     },
//     stock: {
//       type: Number,
//       default: 0,
//     },
//     images: [
//       {
//         type: String, // URLs to your image storage (e.g., S3 or Cloudinary)
//       },
//     ],
//     // features: [
//     //   {
//     //     type: String,
//     //   },
//     // ],
//     features: {
//       type: [String],
//       default: [],
//     },  
//     isAvailable: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true, // Automatically handles createdAt and updatedAt
//   },
// );

// // Optional: Add index for search optimization
// ProductSchema.index({ name: "text", category: "text" });

// const Product = mongoose.model<IProduct>("Product", ProductSchema);

// export default Product;



import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  subCategory?: mongoose.Types.ObjectId | null; // ✅ NEW
  description: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  features: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
slug: {
  type: String,
  unique: true,
},
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // 🔥 NEW FIELD (IMPORTANT)
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    images: [{ type: String }],

    features: {
      type: [String],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ name: "text", category: "text" });

export default mongoose.model<IProduct>("Product", ProductSchema);