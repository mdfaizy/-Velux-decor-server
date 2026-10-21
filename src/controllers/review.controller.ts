import { Request, Response } from "express";
import { Review } from "../model";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// reviews without a status were created before moderation existed → visible
const PUBLIC_FILTER = {
  status: { $nin: ["pending", "rejected"] as ("pending" | "rejected")[] },
};

/* ================= PUBLIC: CUSTOMER SUBMITS A REVIEW ================= */
export const createReview = async (req: Request, res: Response) => {
  try {
    const { reviewerName, location, rating, title, project, website } = req.body;

    // honeypot: hidden field that only bots fill in
    if (website) {
      return res.status(201).json({ success: true });
    }

    const name = String(reviewerName || "").trim();
    const text = String(title || "").trim();
    const place = String(location || "").trim();
    const work = String(project || "").trim();
    const stars = Number(rating);

    if (!name || !text || !place || !work) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill in all required fields" });
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5 stars" });
    }
    if (name.length > 60 || place.length > 80 || work.length > 100 || text.length > 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Some fields are too long" });
    }

    let imageUrl = "";
    const file: any = Array.isArray(req.files?.image) ? req.files?.image[0] : req.files?.image;
    if (file) {
      if (!String(file.mimetype).startsWith("image/") || file.size > MAX_IMAGE_BYTES) {
        return res
          .status(400)
          .json({ success: false, message: "Photo must be an image under 5 MB" });
      }
      imageUrl = (await uploadImageToCloudinary(file)) || "";
    }

    const review = await Review.create({
      reviewerName: name,
      location: place,
      rating: stars,
      title: text,
      project: work,
      image: imageUrl,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your review will appear once approved.",
      data: { _id: review._id },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= PUBLIC: APPROVED REVIEWS ================= */
export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.find(PUBLIC_FILTER).sort({ createdAt: -1 });
    res.status(200).json({
      message: "Reviews retrieved successfully",
      data: reviews,
      success: true,
    });
  } catch (error: any) {
    console.error("Error retrieving reviews:", error);
    res.status(500).json({
      message: "Something went wrong while retrieving reviews",
      error: error.message,
      success: false,
    });
  }
};

export const getAReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const review = await Review.findOne({ _id: id, ...PUBLIC_FILTER });
    if (!review) {
      return res.status(404).json({
        message: "Review not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "Review retrieved successfully",
      data: review,
      success: true,
    });
  } catch (error: any) {
    console.error("Error retrieving review:", error);
    res.status(500).json({
      message: "Something went wrong while retrieving the review",
      error: error.message,
      success: false,
    });
  }
};

/* ================= ADMIN: ALL REVIEWS (pending first) ================= */
export const getAllReviewsAdmin = async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    const order = (s?: string) => (s === "pending" ? 0 : 1);
    reviews.sort((a: any, b: any) => order(a.status) - order(b.status));

    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: APPROVE / REJECT ================= */
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: DELETE ================= */
export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({
        message: "Review not found",
        success: false,
      });
    }
    if (deletedReview.image) await deleteImageFromCloudinary(deletedReview.image);

    res.status(200).json({
      message: "Review deleted successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      message: "Something went wrong while deleting the review",
      error: error.message,
      success: false,
    });
  }
};
