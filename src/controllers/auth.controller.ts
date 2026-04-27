import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../model";
import { sendEmail } from "../config/mailer";
// Helper to create JWT
const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "1d",
  });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password ,role } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = signToken(newUser._id.toString());

    res.status(201).json({
      status: "success",
      token,
      data: { user: newUser },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // 2. Find user & explicitly select password (because select: false in schema)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password!))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // 3. Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id.toString());

    res.status(200).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    // 🔥 token generate
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    // 🔥 FRONTEND URL
    // const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    const resetURL = `https://velux-decor-up6r.vercel.app/reset-password/${resetToken}`;

    // 🔥 EMAIL TEMPLATE
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetURL}" target="_blank">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    // 🔥 SEND EMAIL
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html,
    });

    res.status(200).json({
      success: true,
      message: "Reset link sent to email",
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    // 1. Get user based on hashed token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token.toString())
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    // 2. Update password and clear reset fields
    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // 3. Log user in
    const token = signToken(user._id.toString());
    res.status(200).json({ status: "success", token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  // Assuming your protect middleware attaches user to req.user
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select("-password") // 🔥 password hide
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });

  } catch (error: any) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role, status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        role,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
