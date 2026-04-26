import mongoose, { Schema, Document } from "mongoose";

// Enums for strict type safety
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  DESIGNER = "designer",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional if using OAuth like Google Login
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  verificationToken?: string; // For email verification
  resetPasswordToken?: string; // For password reset
  resetPasswordExpire?: Date; // For password reset
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Prevents password from being returned in queries by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    avatar: {
      type: String,
      default: "", // URL to profile picture
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
