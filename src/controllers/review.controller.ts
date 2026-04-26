import { Request, Response } from "express";
import { Review } from "../model";
import { uploadImageToCloudinary } from "../utils/cloudinary";

// export const createReview = async (req: Request, res: Response) => {
//   try {
//     const { reviewerName, title, location, rating } = req.body;

//     const newReview = new Review({
//       reviewerName,
//       title,
//       location,
//       // testimonial,
//       rating,
//     });

//     const savedReview = await newReview.save();

//     res.status(201).json({
//       message: "Review created successfully",
//       data: savedReview,
//       success: true,
//     });
//   } catch (error: any) {
//     console.error("Error creating review:", error);
//     res.status(500).json({
//       message: "Something went wrong while creating the consultation request",
//       error: error.message,
//       success: false,
//     });
//   }
// };


export const createReview = async (req: Request, res: Response) => {
  try {
    const { reviewerName, location, rating, title, project } = req.body;

    let imageUrl: string = "";

    if (req.files?.image) {
      const file = Array.isArray(req.files.image)
        ? req.files.image[0]
        : req.files.image;

      const uploaded = await uploadImageToCloudinary(file);
      imageUrl = uploaded || "";
    }

    const review = await Review.create({
      reviewerName,
      location,
      rating,
      title,
      project,
      image: imageUrl, // ✅ SAVE IMAGE
    });

    res.status(201).json({
      success: true,
      data: review,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
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

export const getAReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const review = await Review.findById(id);
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
