import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    title: {
      type: String, // optional big headline for the home page card, e.g. "Diwali Sale"
      trim: true,
      maxlength: 60,
    },
    image: {
      type: String, // optional Cloudinary URL, shown on the home page card
    },
    link: {
      type: String, // optional URL or site path, e.g. "/categories"
      trim: true,
    },
    linkLabel: {
      type: String, // e.g. "Shop now"
      trim: true,
      maxlength: 30,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date, // optional: offer shows from this date
    },
    endDate: {
      type: Date, // optional: offer hides after this date (also drives the countdown)
    },

    // where the offer appears on the website
    showInBar: {
      type: Boolean,
      default: true,
    },
    showOnHome: {
      type: Boolean,
      default: false,
    },
    showOnProduct: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId, // product pages: limit to this category (empty = all)
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Offer = mongoose.model("Offer", offerSchema);
