import mongoose from "mongoose";
import config from "./environment";

const dbConnection = async () => {
  try {
    await mongoose.connect(config.DB_CNN);
    console.log("DB Online");
  } catch (error: any) {
    console.log(error.message);
    process.exit(1);
  }
};

export default dbConnection;
