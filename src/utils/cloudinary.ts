import { v2 as cloudinary } from "cloudinary";

// utils/cloudinary.ts
export const uploadImageToCloudinary = async (file: any) => {
  if (!file || !file.tempFilePath) return null;

  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "velux",
  });
  return result.secure_url;
};

// utils/cloudinary.ts
export const deleteImage = async (imageUrl: string) => {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234/velux/sample.jpg
    // 1. Get the part after the last '/' -> 'sample.jpg'
    const fileNameWithExtension = imageUrl.split("/").pop() || "";

    // 2. Remove the extension -> 'sample'
    const publicId = fileNameWithExtension.split(".")[0];

    // 3. Add the folder prefix (match what you used in uploadImageToCloudinary)
    const fullPublicId = `velux/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error: any) {
    console.error("Cloudinary Delete Error:", error.message);
  }
};
