// import { Request, Response } from "express";
// import Category from "../model/category.model";


// // ✅ CREATE CATEGORY
// export const createCategory = async (req: Request, res: Response) => {
//   try {
//     const { name } = req.body;

//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: "Category name is required",
//       });
//     }

//     const existing = await Category.findOne({ name });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "Category already exists",
//       });
//     }

//     const category = await Category.create({ name });

//     return res.status(201).json({
//       success: true,
//       message: "Category created successfully",
//       data: category,
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// // ✅ GET ALL CATEGORIES
// export const getAllCategories = async (_req: Request, res: Response) => {
//   try {
//     const categories = await Category.find().sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       message: "Categories fetched successfully",
//       data: categories,
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// // ✅ UPDATE CATEGORY
// export const updateCategory = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { name } = req.body;

//     const category = await Category.findByIdAndUpdate(
//       id,
//       { name },
//       { new: true }
//     );

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Category updated successfully",
//       data: category,
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// // ✅ DELETE CATEGORY
// export const deleteCategory = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const category = await Category.findByIdAndDelete(id);

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Category deleted successfully",
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// // ✅ TOGGLE STATUS (ACTIVE / INACTIVE)
// export const toggleCategoryStatus = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const category = await Category.findById(id);

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     category.isActive = !category.isActive;
//     await category.save();

//     return res.status(200).json({
//       success: true,
//       message: "Category status updated",
//       data: category,
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

import { Request, Response } from "express";
import Category from "../model/category.model";
import SubCategory from "../model/subcategory.modal";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary";

// helper
const generateSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-");

// ✅ CREATE CATEGORY
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, badge, image, icon } = req.body;

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    // ✅ DEFAULT FROM BODY
    let imageUrl = image || "";
    let iconUrl = icon || "";

    // ✅ image upload override
    if (req.files && (req.files as any).image) {
      const uploaded = await uploadImageToCloudinary(
        (req.files as any).image
      );
      if (uploaded) imageUrl = uploaded;
    }

    // ✅ icon upload override
    if (req.files && (req.files as any).icon) {
      const uploaded = await uploadImageToCloudinary(
        (req.files as any).icon
      );
      if (uploaded) iconUrl = uploaded;
    }

    const category = await Category.create({
      name,
      description,
      badge,
      image: imageUrl,
      icon: iconUrl,
      slug: generateSlug(name),
    });

    return res.status(201).json({
      success: true,
      message: "Category created",
      data: category,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ✅ GET ALL CATEGORY
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const data = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ✅ GET CATEGORY WITH SUBCATEGORY
export const getCategoryWithSub = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).lean();

    const subs = await SubCategory.find({ isActive: true });

    const result = categories.map((cat) => ({
      ...cat,
      subCategories: subs.filter(
        (s) => s.category.toString() === cat._id.toString()
      ),
    }));

    return res.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ✅ UPDATE CATEGORY (WITH OLD IMAGE DELETE 🔥)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, badge } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // update text fields
    if (name) {
      category.name = name;
      category.slug = generateSlug(name);
    }

    if (description !== undefined) category.description = description;
    if (badge !== undefined) category.badge = badge;

    // ✅ update image + delete old
    if (req.files && (req.files as any).image) {
      if (category.image) {
        await deleteImageFromCloudinary(category.image);
      }

      const uploaded = await uploadImageToCloudinary(
        (req.files as any).image
      );

      if (uploaded) {
        category.image = uploaded;
      }
    }

    // ✅ update icon + delete old
    if (req.files && (req.files as any).icon) {
      if (category.icon) {
        await deleteImageFromCloudinary(category.icon);
      }

      const uploaded = await uploadImageToCloudinary(
        (req.files as any).icon
      );

      if (uploaded) {
        category.icon = uploaded;
      }
    }

    await category.save();

    return res.json({
      success: true,
      message: "Category updated",
      data: category,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ✅ DELETE CATEGORY (WITH IMAGE DELETE 🔥)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // delete images from cloudinary
    if (category.image) {
      await deleteImageFromCloudinary(category.image);
    }

    if (category.icon) {
      await deleteImageFromCloudinary(category.icon);
    }

    await Category.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Category deleted",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ✅ TOGGLE ACTIVE
export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cat = await Category.findById(id);

    if (!cat) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    cat.isActive = !cat.isActive;
    await cat.save();

    return res.json({
      success: true,
      data: cat,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};