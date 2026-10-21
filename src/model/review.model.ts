import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  reviewerName: string;
  title: string;
  location: string;
  // testimonial: string;
  project: string;
   image?: string;
  rating: number;
  status?: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewerName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    // testimonial: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5, default: 5 },
    
      project: { type: String, required: true },
     image: {
      type: String, // ✅ ADD THIS
      default: "",
    },
    // customer reviews wait for admin approval; older reviews have no status and count as approved
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },
  },
  {
    timestamps: true,
  },
);

const Review: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) ||
  mongoose.model<IReview>("Review", reviewSchema);

export default Review;
