import mongoose, { Schema, Document } from "mongoose";

export interface IEnquiry extends Document {
  product: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  message?: string;
}

const enquirySchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // 🔥 relation
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    message: String,
  },
  { timestamps: true }
);

export default mongoose.model<IEnquiry>("Enquiry", enquirySchema);