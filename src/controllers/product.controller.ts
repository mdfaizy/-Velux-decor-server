// import { Request, Response } from "express";
// import { Product } from "../model";
// import { deleteImageFromCloudinary , uploadImageToCloudinary } from "../utils/cloudinary";
// import Category from "../model/category.model";
// export const getAllProducts = async (req: Request, res: Response) => {
//   try {
//     const products = await Product.find()
//     .populate("category", "name") // ✅ relation
//       .sort({ createdAt: -1 }); 
//     res.status(200).json({
//       message: "Products fetched successfully",
//       data: products,
//       success: true,
//     });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({
//       message: "Something went wrong while fetching products",
//       success: false,
//     });
//   }
// };

// export const getProductById = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const product = await Product.findById(id)
//     .populate("category", "name");
//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found",
//         success: false,
//       });
//     }
//     res.status(200).json({
//       message: "Product fetched successfully",
//       data: product,
//       success: true,
//     });
//   } catch (error) {
//     console.error("Error fetching product by ID:", error);
//     res.status(500).json({
//       message: "Something went wrong while fetching the product",
//       success: false,
//     });
//   }
// };


// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const { name, category, description, price, stock, isAvailable, features } =
//       req.body;

//     // 🔥 CATEGORY VALIDATION
//     const categoryExists = await Category.findById(category);
//     if (!categoryExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid category",
//       });
//     }

//     // IMAGE UPLOAD
//     const uploadFiles = req.files?.image;
//     if (!uploadFiles) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one image is required",
//       });
//     }

//     const filesArray = Array.isArray(uploadFiles)
//       ? uploadFiles
//       : [uploadFiles];

//     const imageUrls: string[] = (
//       await Promise.all(
//         filesArray.map(async (file) => {
//           const url = await uploadImageToCloudinary(file);
//           return url;
//         })
//       )
//     ).filter((url): url is string => url !== null);

//     const newProduct = new Product({
//       name,
//       category,
//       description,
//       price,
//       stock,
//       isAvailable,
//       features:
//         typeof features === "string" ? JSON.parse(features) : features,
//       images: imageUrls,
//     });

//     const savedProduct = await newProduct.save();

//     // 🔥 POPULATE
//     const populatedProduct = await savedProduct.populate("category", "name");

//     res.status(201).json({
//       message:
//         "Product created successfully with " + imageUrls.length + " images",
//       data: populatedProduct,
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

// // export const createProduct = async (req: Request, res: Response) => {
// //   try {
// //     const { name, category, description, price, stock, isAvailable, features } =
// //       req.body;

// //     // 1. Normalize files into an array
// //     const uploadFiles = req.files?.image;
// //     if (!uploadFiles) {
// //       return res
// //         .status(400)
// //         .json({ success: false, message: "At least one image is required" });
// //     }

// //     // Ensure we are always dealing with an array, even if only one file is uploaded
// //     const filesArray = Array.isArray(uploadFiles) ? uploadFiles : [uploadFiles];

// //     // 2. Upload all files to Cloudinary in parallel
// //     // We use Promise.all to map every file to an upload promise
// //     const imageUrls: string[] = (
// //       await Promise.all(
// //         filesArray.map(async (file) => {
// //           const url = await uploadImageToCloudinary(file);
// //           return url; // This returns the secure_url string
// //         }),
// //       )
// //     ).filter((url): url is string => url !== null);

// //     // 3. Create Product Instance with the array of URLs
// //     const newProduct = new Product({
// //       name,
// //       category,
// //       description,
// //       price,
// //       stock,
// //       isAvailable,
// //       // Parse features if they come in as a stringified JSON array from FormData
// //       features: typeof features === "string" ? JSON.parse(features) : features,
// //       images: imageUrls, // Now storing the full array of strings
// //     });

// //     // 4. Save to Database
// //     const savedProduct = await newProduct.save();

// //     res.status(201).json({
// //       message:
// //         "Product created successfully with " + imageUrls.length + " images",
// //       data: savedProduct,
// //       success: true,
// //     });
// //   } catch (error: any) {
// //     console.error("Error creating product:", error);
// //     res.status(500).json({
// //       message: "Something went wrong while creating the product",
// //       error: error.message,
// //       success: false,
// //     });
// //   }
// // };

// export const deleteProduct = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   try {
//     // 1. Find the product first to get the image URLs
//     const product = await Product.findById(id);

//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found",
//         success: false,
//       });
//     }

//     // 2. Delete all images from Cloudinary
//     // We use Promise.all to delete them concurrently
//    await Promise.all(
//   product.images.map((imageUrl: string) =>
//     deleteImageFromCloudinary(imageUrl)
//   )
// );

//     // 3. Delete the product from the database
//     await Product.findByIdAndDelete(id);

//     res.status(200).json({
//       message: "Product and associated images deleted successfully",
//       success: true,
//     });
//   } catch (error: any) {
//     console.error("Error deleting product:", error);
//     res.status(500).json({
//       message: "Something went wrong while deleting the product",
//       error: error.message,
//       success: false,
//     });
//   }
// };


// export const updateProduct = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const { name, price, stock, description } = req.body;

//     const existingProduct = await Product.findById(id);

//     if (!existingProduct) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     let updatedData: any = {
//       name,
//       price,
//       stock,
//       description,
//     };

//     // 🔥 IMAGE HANDLE
//     if (req.files?.image) {
//       const files = Array.isArray(req.files.image)
//         ? req.files.image
//         : [req.files.image];

//       // ✅ 1. OLD IMAGES DELETE
//       if (existingProduct.images?.length) {
//         await Promise.all(
//           existingProduct.images.map((img: string) =>
//             deleteImageFromCloudinary(img)
//           )
//         );
//       }

//       // ✅ 2. NEW UPLOAD
//       const imageUrls = (
//         await Promise.all(
//           files.map((file: any) => uploadImageToCloudinary(file))
//         )
//       ).filter((url): url is string => Boolean(url));

//       updatedData.images = imageUrls;
//     }

//     const product = await Product.findByIdAndUpdate(
//       id,
//       updatedData,
//       { new: true }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Product updated successfully",
//       data: product,
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

import { Request, Response } from "express";
import Product from "../model/product.model";
import Category from "../model/category.model";
import SubCategory from "../model/subcategory.modal";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../utils/cloudinary";
const generateSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-");
// ✅ CREATE PRODUCT
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, category, subCategory, description, price, stock, features } = req.body;

    // CATEGORY VALIDATION
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    // OPTIONAL SUBCATEGORY VALIDATION
    if (subCategory) {
      const subExists = await SubCategory.findById(subCategory);
      if (!subExists) {
        return res.status(400).json({ success: false, message: "Invalid subcategory" });
      }
    }

    // IMAGE UPLOAD
    const uploadFiles = req.files?.image;
    if (!uploadFiles) {
      return res.status(400).json({ success: false, message: "Image required" });
    }

    const filesArray = Array.isArray(uploadFiles) ? uploadFiles : [uploadFiles];

    const imageUrls: string[] = await Promise.all(
      filesArray.map((file: any) => uploadImageToCloudinary(file))
    );

    const product = await Product.create({
  name,
  slug: generateSlug(name), // 🔥 ADD
  category,
  subCategory: subCategory || null,
  description,
  price,
  stock,
  features: typeof features === "string" ? JSON.parse(features) : features,
  images: imageUrls,
});

    const populated = await product.populate("category subCategory");

    return res.status(201).json({
      success: true,
      data: populated,
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// ✅ GET ALL PRODUCTS
export const getAllProducts = async (_req: Request, res: Response) => {
  const data = await Product.find()
    // .populate("category subCategory")
    .populate("category", "name slug")
.populate("subCategory", "name slug")
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { productSlug } = req.params;

    const product = await Product.findOne({ slug: productSlug })
      // .populate("category subCategory");
      .populate("category", "name slug")
.populate("subCategory", "name slug")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      data: product,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET PRODUCT BY ID
export const getProductById = async (req: Request, res: Response) => {
  const data = await Product.findById(req.params.id)
    // .populate("category subCategory");
    .populate("category", "name slug")
.populate("subCategory", "name slug")

  res.json({ success: true, data });
};



// ✅ FILTER BY SUBCATEGORY
export const getProductsBySubCategory = async (req: Request, res: Response) => {
  const { subCategoryId } = req.params;

  const data = await Product.find({ subCategory: subCategoryId })
    // .populate("category subCategory");
    .populate("category", "name slug")
.populate("subCategory", "name slug")

  res.json({ success: true, data });
};



// ✅ FILTER BY CATEGORY (NO SUBCATEGORY)
export const getProductsByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  const data = await Product.find({
    category: categoryId,
    subCategory: null, // 🔥 IMPORTANT
  });

  res.json({ success: true, data });
};



// ✅ DELETE PRODUCT
export const deleteProduct = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false });
  }

  await Promise.all(
    product.images.map((img) => deleteImageFromCloudinary(img))
  );

  await Product.findByIdAndDelete(req.params.id);

  res.json({ success: true });
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { name, category, subCategory, description, price, stock, features } =
      req.body;

    const product = await Product.findById(id);

    // ✅ FIRST CHECK (IMPORTANT)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ CATEGORY VALIDATION
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
      product.category = category;
    }

    // ✅ SUBCATEGORY VALIDATION
    if (subCategory) {
      const subExists = await SubCategory.findById(subCategory);
      if (!subExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid subcategory",
        });
      }
      product.subCategory = subCategory;
    }

    // ✅ BASIC FIELDS
    if (name) {
      product.name = name;
      product.slug = name.toLowerCase().replace(/\s+/g, "-");
    }

    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;

    if (features) {
      product.features =
        typeof features === "string" ? JSON.parse(features) : features;
    }

    // ✅ IMAGE UPDATE
    if (req.files?.image) {
      const files = Array.isArray(req.files.image)
        ? req.files.image
        : [req.files.image];

      // delete old
      if (product.images?.length) {
        await Promise.all(
          product.images.map((img: string) =>
            deleteImageFromCloudinary(img)
          )
        );
      }

      // upload new
      const imageUrls = await Promise.all(
        files.map((file: any) => uploadImageToCloudinary(file))
      );

      product.images = imageUrls;
    }

    await product.save();

    // ✅ FINAL POPULATE (CORRECT WAY)
    const updated = await Product.findById(product._id)
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    return res.json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductsBySlug = async (req: Request, res: Response) => {
  try {
    const { categorySlug, subCategorySlug } = req.params;

    const category = await Category.findOne({ slug: categorySlug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // ✅ SUBCATEGORY CASE
    if (subCategorySlug) {
      const subCategory = await SubCategory.findOne({
        slug: subCategorySlug,
        category: category._id,
      });

      if (!subCategory) {
        return res.json({
          success: true,
          data: [],
          message: "No subcategory found",
        });
      }

      const products = await Product.find({
        category: category._id,
        subCategory: subCategory._id,
      })
        .populate("category", "name slug")
        .populate("subCategory", "name slug");

      return res.json({
        success: true,
        data: products,
      });
    }

    // ✅ CATEGORY ONLY
    const products = await Product.find({
      category: category._id,
    })
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    return res.json({
      success: true,
      data: products,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// export const getProductsBySlug = async (req: Request, res: Response) => {
//   try {
//     const { categorySlug, subCategorySlug } = req.params;

//     // ✅ find category
//     const category = await Category.findOne({ slug: categorySlug });
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     // ✅ case 1: subcategory present
//     if (subCategorySlug) {
//       const subCategory = await SubCategory.findOne({
//         slug: subCategorySlug,
//         category: category._id,
//       });

//       if (!subCategory) {
//         return res.status(404).json({
//           success: false,
//           message: "SubCategory not found",
//         });
//       }

//       const products = await Product.find({
//         category: category._id,
//         subCategory: subCategory._id,
//       })
//         .populate("category", "name slug")
//         .populate("subCategory", "name slug");

//       return res.json({ success: true, data: products });
//     }

//     // ✅ case 2: only category (no subcategory)
//     const products = await Product.find({
//       category: category._id,
//       subCategory: null,
//     }).populate("category", "name slug");

//     return res.json({ success: true, data: products });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };