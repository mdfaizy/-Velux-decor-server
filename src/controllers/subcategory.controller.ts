import { Request, Response } from "express";
import SubCategory from "../model/subcategory.modal";
import Category from "../model/category.model";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary";
const generateSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-");
// ✅ CREATE SUB CATEGORY
export const createSubCategory = async (req: Request, res: Response) => {
  try {
    const { name, category, description } = req.body;

    // ✅ validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name & Category required",
      });
    }

    // ✅ check category exists
    const categoryData = await Category.findById(category);
    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    // ✅ duplicate name check (optional but good)
    const existing = await SubCategory.findOne({ name, category });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "SubCategory already exists in this category",
      });
    }

    // ✅ image upload
    let imageUrl = "";

    if (req.files && (req.files as any).image) {
      const file = (req.files as any).image;

      // 🔥 optional validation
      if (!file.mimetype.startsWith("image")) {
        return res.status(400).json({
          success: false,
          message: "Only image files allowed",
        });
      }

      const uploaded = await uploadImageToCloudinary(file);
      if (uploaded) imageUrl = uploaded;
    }

    // ✅ safe slug generate
    let slug = name.toLowerCase().replace(/\s+/g, "-");
    let exists = await SubCategory.findOne({ slug });

    let counter = 1;
    while (exists) {
      slug = `${slug}-${counter}`;
      exists = await SubCategory.findOne({ slug });
      counter++;
    }

    // ✅ create
    const sub = await SubCategory.create({
      name,
      slug,
      category,
      description, // 🔥 ADD THIS
      image: imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "SubCategory created successfully",
      data: sub,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSubByCategorySlug = async (req: Request, res: Response) => {
  try {
    const { categorySlug } = req.params;

    // ✅ find category by slug
    const category = await Category.findOne({ slug: categorySlug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // ✅ get subcategories
    const subs = await SubCategory.find({
      category: category._id,
      isActive: true,
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: subs,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllSubCategories = async (req: Request, res: Response) => {
  try {
    const data = await SubCategory.find()
      .populate("category", "name slug") // 🔥 important
      .sort({ createdAt: -1 });

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
// ✅ GET SUB BY CATEGORY
export const getSubByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    const subs = await SubCategory.find({
  category: categoryId,
  isActive: true,
})
  .populate("category", "name slug") // 🔥 ADD THIS
  .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: subs,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ✅ UPDATE SUB CATEGORY (WITH IMAGE DELETE 🔥)
export const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;

    const sub = await SubCategory.findById(id);

    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    if (name) {
      sub.name = name;
      sub.slug = await generateSlug(name);
    }

    if (category) sub.category = category;
    if (description) sub.description = description;

    if (req.files && (req.files as any).image) {
      if (sub.image) {
        await deleteImageFromCloudinary(sub.image);
      }

      const uploaded = await uploadImageToCloudinary(
        (req.files as any).image
      );

      if (uploaded) sub.image = uploaded;
    }

    await sub.save();

    return res.json({
      success: true,
      message: "SubCategory updated",
      data: sub,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ✅ DELETE SUB CATEGORY (WITH IMAGE DELETE 🔥)
export const deleteSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sub = await SubCategory.findById(id);

    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    // delete image
    if (sub.image) {
      await deleteImageFromCloudinary(sub.image);
    }

    await SubCategory.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "SubCategory deleted",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ✅ TOGGLE SUB CATEGORY
export const toggleSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sub = await SubCategory.findById(id);

    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    sub.isActive = !sub.isActive;
    await sub.save();

    return res.json({
      success: true,
      data: sub,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};