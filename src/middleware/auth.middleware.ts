import { Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config/environment";

export const authenticateToken = async (
  req: any,
  res: Response,
  next: Function,
) => {
  try {
    // console.log(req.headers);
    const token =
      req.cookies.jwt ||
      req.body.token ||
      req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token in cookie", success: false });
    }
    const decode = jwt.verify(token, config.JWT.SECRET);
    console.log(decode);
    req.user = decode;
    next();
  } catch (error: any) {
    // console.log(error);
    return res
      .status(401)
      .json({ message: "Invalid token", success: false, err: error.message });
  }
};
