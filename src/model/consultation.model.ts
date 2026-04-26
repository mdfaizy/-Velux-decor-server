import { Schema, model, Document } from "mongoose";

export interface ConsultationDocument extends Document {
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  city: string;
  preferredDate: Date;
}

const consultationSchema = new Schema<ConsultationDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Consultation = model<ConsultationDocument>(
  "Consultation",
  consultationSchema,
);

export default Consultation;
