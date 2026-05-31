// import { Response } from "express";
// import jwt from "jsonwebtoken";
// import config from "../config/environment";

// export const authenticateToken = async (
//   req: any,
//   res: Response,
//   next: Function,
// ) => {
//   try {
//     // console.log(req.headers);
//     const token =
//       req.cookies.jwt ||
//       req.body.token ||
//       req.headers.authorization?.replace("Bearer ", "");
//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "No token in cookie", success: false });
//     }
//     const decode = jwt.verify(token, config.JWT.SECRET);
//     console.log(decode);
//     req.user = decode;
//     next();
//   } catch (error: any) {
//     // console.log(error);
//     return res
//       .status(401)
//       .json({ message: "Invalid token", success: false, err: error.message });
//   }
// };

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/environment";
import User from "../model/user.model";

export const authenticateToken = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {

    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    console.log("AUTH HEADER:", authHeader);
console.log("TOKEN:", token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    const decoded: any = jwt.verify(
      token,
      config.JWT.SECRET
    );
    console.log("DECODED:", decoded);
console.log("JWT SECRET EXISTS:", !!config.JWT.SECRET);
    const user = await User.findById(decoded.id)
      .select("-password");
      console.log("USER FOUND:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();

  } catch (error: any) {

    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });

  }
};