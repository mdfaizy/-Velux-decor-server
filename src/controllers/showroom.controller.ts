import { Request, Response } from "express";
import { Showroom } from "../model/showroomModel";
import { v2 as cloudinary } from "cloudinary";
/* ================= CREATE ================= */
export const createShowroom = async (req: any, res: Response) => {
  try {
    const { title } = req.body;

    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Video & thumbnail required ❌",
      });
    }

    const videoFile = req.files.video;
    const thumbnailFile = req.files.thumbnail;

    /* 🔥 Upload Video */
    const videoUpload = await cloudinary.uploader.upload(
      videoFile.tempFilePath,
      {
        resource_type: "video",
        folder: "showrooms/videos",
      }
    );

    /* 🔥 Upload Thumbnail */
    const thumbnailUpload = await cloudinary.uploader.upload(
      thumbnailFile.tempFilePath,
      {
        folder: "showrooms/thumbnails",
      }
    );

    /* 🔥 Save in DB */
    const video = await Showroom.create({
      title,
      src: videoUpload.secure_url,
      thumbnail: thumbnailUpload.secure_url,
    });

    res.status(201).json({
      success: true,
      data: video,
    });

  } catch (error: any) {
    console.error("Showroom Upload Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ALL ================= */
export const getShowrooms = async (req: Request, res: Response) => {
  try {
    const videos = await Showroom.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: videos,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};