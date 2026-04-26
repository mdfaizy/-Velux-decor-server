import { v2 as cloudinary } from "cloudinary";
import config from "./environment";

const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: config.CLOUDINARY.cloud_name,
      api_key: config.CLOUDINARY.api_key,
      api_secret: config.CLOUDINARY.api_secret,
    });

    // Log a success message to the console
    console.log("Connected to Cloudinary successfully!");
    console.log("Cloudinary Config:", config.CLOUDINARY);
  } catch (error: any) {
    // Log any errors that occur during configuration
    console.error("Error connecting to Cloudinary:", error.message);
  }
};

export default cloudinaryConnect;
