import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
 category: mongoose.Types.ObjectId;
  description: string;
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
   category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
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
    images: [
      {
        type: String, // URLs to your image storage (e.g., S3 or Cloudinary)
      },
    ],
    // features: [
    //   {
    //     type: String,
    //   },
    // ],
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
    timestamps: true, // Automatically handles createdAt and updatedAt
  },
);

// Optional: Add index for search optimization
ProductSchema.index({ name: "text", category: "text" });

const Product = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
