import { Request, Response } from "express";
import { Product } from "../model";
import { deleteImage, uploadImageToCloudinary } from "../utils/cloudinary";
import Category from "../model/category.model";
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
    .populate("category", "name") // ✅ relation
      .sort({ createdAt: -1 }); 
    res.status(200).json({
      message: "Products fetched successfully",
      data: products,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Something went wrong while fetching products",
      success: false,
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id)
    .populate("category", "name");
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "Product fetched successfully",
      data: product,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      message: "Something went wrong while fetching the product",
      success: false,
    });
  }
};


export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, category, description, price, stock, isAvailable, features } =
      req.body;

    // 🔥 CATEGORY VALIDATION
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // IMAGE UPLOAD
    const uploadFiles = req.files?.image;
    if (!uploadFiles) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const filesArray = Array.isArray(uploadFiles)
      ? uploadFiles
      : [uploadFiles];

    const imageUrls: string[] = (
      await Promise.all(
        filesArray.map(async (file) => {
          const url = await uploadImageToCloudinary(file);
          return url;
        })
      )
    ).filter((url): url is string => url !== null);

    const newProduct = new Product({
      name,
      category,
      description,
      price,
      stock,
      isAvailable,
      features:
        typeof features === "string" ? JSON.parse(features) : features,
      images: imageUrls,
    });

    const savedProduct = await newProduct.save();

    // 🔥 POPULATE
    const populatedProduct = await savedProduct.populate("category", "name");

    res.status(201).json({
      message:
        "Product created successfully with " + imageUrls.length + " images",
      data: populatedProduct,
      success: true,
    });

  } catch (error: any) {
    console.error("Error creating product:", error);

    res.status(500).json({
      message: "Something went wrong while creating the product",
      error: error.message,
      success: false,
    });
  }
};

// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const { name, category, description, price, stock, isAvailable, features } =
//       req.body;

//     // 1. Normalize files into an array
//     const uploadFiles = req.files?.image;
//     if (!uploadFiles) {
//       return res
//         .status(400)
//         .json({ success: false, message: "At least one image is required" });
//     }

//     // Ensure we are always dealing with an array, even if only one file is uploaded
//     const filesArray = Array.isArray(uploadFiles) ? uploadFiles : [uploadFiles];

//     // 2. Upload all files to Cloudinary in parallel
//     // We use Promise.all to map every file to an upload promise
//     const imageUrls: string[] = (
//       await Promise.all(
//         filesArray.map(async (file) => {
//           const url = await uploadImageToCloudinary(file);
//           return url; // This returns the secure_url string
//         }),
//       )
//     ).filter((url): url is string => url !== null);

//     // 3. Create Product Instance with the array of URLs
//     const newProduct = new Product({
//       name,
//       category,
//       description,
//       price,
//       stock,
//       isAvailable,
//       // Parse features if they come in as a stringified JSON array from FormData
//       features: typeof features === "string" ? JSON.parse(features) : features,
//       images: imageUrls, // Now storing the full array of strings
//     });

//     // 4. Save to Database
//     const savedProduct = await newProduct.save();

//     res.status(201).json({
//       message:
//         "Product created successfully with " + imageUrls.length + " images",
//       data: savedProduct,
//       success: true,
//     });
//   } catch (error: any) {
//     console.error("Error creating product:", error);
//     res.status(500).json({
//       message: "Something went wrong while creating the product",
//       error: error.message,
//       success: false,
//     });
//   }
// };

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 1. Find the product first to get the image URLs
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    // 2. Delete all images from Cloudinary
    // We use Promise.all to delete them concurrently
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((imageUrl: string) => deleteImage(imageUrl)),
      );
    }

    // 3. Delete the product from the database
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      message: "Product and associated images deleted successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Something went wrong while deleting the product",
      error: error.message,
      success: false,
    });
  }
};


export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { name, price, stock, description } = req.body;

    let updatedData: any = {
      name,
      price,
      stock,
      description,
    };

    // 🔥 IMAGE HANDLE
    if (req.files?.image) {
      const files = Array.isArray(req.files.image)
        ? req.files.image
        : [req.files.image];

      const imageUrls = await Promise.all(
        files.map((file: any) => uploadImageToCloudinary(file))
      );

      updatedData.images = imageUrls;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};