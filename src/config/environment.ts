// src/config/environment.ts
import dotenv from "dotenv";

// Determine environment
const NODE_ENV = process.env.NODE_ENV || "development";
console.log(`🌍 Loading environment: ${NODE_ENV}`);

// Load environment-specific configuration
dotenv.config({ path: `.env.${NODE_ENV}` });
dotenv.config({ path: ".env" }); // Fallback to base .env

// 1. Define Config with defaults (Mutable, removed 'as const')
export const config = {
  // Environment
  NODE_ENV,

  // Server Configuration
  PORT: Number(process.env.PORT) || 8080,

  // Frontend URLs
  FRONTEND_URL: process.env.FRONTEND_URL || "https://velux-decor-6ebi-git-main-md-faizys-projects.vercel.app",

  // Api Base URL
  API_BASE_URL: process.env.API_BASE_URL,

  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || "default_secret",
    COOKIE_NAME: process.env.JWT_COOKIE_NAME || "token",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "90d",
  },

  // Database
  DB_CNN: process.env.DB_CNN || "mongodb://velux_user:velux123@cluster0.n3q82b6.mongodb.net/velux-decor",

  CLOUDINARY: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  },
};

export default config;
