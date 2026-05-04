// import { v2 as cloudinary } from "cloudinary";

// // utils/cloudinary.ts
// export const uploadImageToCloudinary = async (file: any) => {
//   if (!file || !file.tempFilePath) return null;

//   const result = await cloudinary.uploader.upload(file.tempFilePath, {
//     folder: "velux",
//   });
//   return result.secure_url;
// };

// // utils/cloudinary.ts
// export const deleteImage = async (imageUrl: string) => {
//   try {
//     // Example URL: https://res.cloudinary.com/demo/image/upload/v1234/velux/sample.jpg
//     // 1. Get the part after the last '/' -> 'sample.jpg'
//     const fileNameWithExtension = imageUrl.split("/").pop() || "";

//     // 2. Remove the extension -> 'sample'
//     const publicId = fileNameWithExtension.split(".")[0];

//     // 3. Add the folder prefix (match what you used in uploadImageToCloudinary)
//     const fullPublicId = `velux/${publicId}`;

//     await cloudinary.uploader.destroy(fullPublicId);
//   } catch (error: any) {
//     console.error("Cloudinary Delete Error:", error.message);
//   }
// };


import { v2 as cloudinary } from "cloudinary";

/**
 * ✅ UPLOAD IMAGE (SAFE + TS FRIENDLY)
 */
export const uploadImageToCloudinary = async (
  file: any
): Promise<string> => {
  try {
    if (!file || !file.tempFilePath) return "";

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "velux",
      resource_type: "image",
    });

    return result.secure_url || "";
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error.message);
    return "";
  }
};

/**
 * ✅ EXTRACT PUBLIC ID FROM URL (IMPORTANT)
 */
const getPublicIdFromUrl = (imageUrl: string): string => {
  try {
    // Example:
    // https://res.cloudinary.com/demo/image/upload/v1234/velux/sample.jpg

    const parts = imageUrl.split("/");
    const fileWithExt = parts.pop() || ""; // sample.jpg
    const folder = parts.slice(parts.indexOf("upload") + 2).join("/"); 
    // velux/

    const fileName = fileWithExt.split(".")[0]; // sample

    return folder ? `${folder}/${fileName}` : fileName;
  } catch {
    return "";
  }
};

/**
 * ✅ DELETE IMAGE (SAFE)
 */
export const deleteImageFromCloudinary = async (
  imageUrl: string
): Promise<void> => {
  try {
    if (!imageUrl) return;

    const publicId = getPublicIdFromUrl(imageUrl);

    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error("Cloudinary Delete Error:", error.message);
  }
};