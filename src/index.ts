import express, { Request, Response } from "express";
import config from "./config/environment";
import cors from "cors";
import cookieParser from "cookie-parser";
import AuthRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import consultationRoutes from "./routes/consultation.route";
import reviewRoutes from "./routes/review.route";
import fileUpload from "express-fileupload";
import categoryRoutes from "./routes/category.routes"
import contactRoutes from "./routes/contactRoutes"
import showroomRoutes from "./routes/showroom.routes";
import enquiryRoutes from "./routes/enquiry.route"
import subCategoryRoute from "./routes/subcategory.routes"
// Importing the Database Connection
import dbConnection from "./config/db";
dbConnection();

// Importing the Cloudinary Connection
import cloudinaryConnect from "./config/cloudinary";
cloudinaryConnect();

export async function bootstrap(): Promise<void> {
  const app = express();

  // Middlewares
  // app.use(
  //   cors({
  //     origin: [config.FRONTEND_URL],
  //     credentials: true,
  //   }),
  // );

  const allowedOrigins = [
  "http://localhost:5173",
  "https://velux-decor-up6r.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
      
    }),
  );

  app.get("/api", (_req: Request, res: Response) => {
    console.log("API endpoint hit");
    return res.json({
      message: "Backend API",
      environment: config.NODE_ENV,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/health", (_req: Request, res: Response) =>
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
    }),
  );

  app.use("/api/auth", AuthRoutes);

  app.use('/api/category',categoryRoutes);
  app.use("/api/subcategory",subCategoryRoute);
  app.use("/api/products", productRoutes);  
  
  app.use("/api/consultations", consultationRoutes);

  app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/showrooms", showroomRoutes);
app.use("/api/enquiry", enquiryRoutes);
  // app.listen(config.PORT, "127.0.0.1", () => {
  //   console.log(`Server running on port ${config.PORT}`);
  // });
  const PORT = process.env.PORT || config.PORT;


  
app.listen(Number(PORT), () => {
  console.log(`Server running on port ${PORT}`);
});
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
