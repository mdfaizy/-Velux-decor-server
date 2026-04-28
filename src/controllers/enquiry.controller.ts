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