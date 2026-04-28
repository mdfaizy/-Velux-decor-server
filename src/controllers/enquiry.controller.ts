import { Request, Response } from "express";
import Enquiry from "../model/enquiry.model";
import Product from "../model/product.model";

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const { productId, name, phone, message } = req.body;

    // 🔥 Product check
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const enquiry = await Enquiry.create({
      product: product._id,
      name,
      phone,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: enquiry,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllEnquiries = async (req: Request, res: Response) => {
  try {
    const enquiries = await Enquiry.find()
      .populate("product", "name")   // ✅ important
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: enquiries,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteEnquiry = async (req: Request, res: Response) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};