
import { Request, Response } from "express";
import { Consultation } from "../model";
import { sendEmail } from "../config/mailer";
import { consultationTemplate,userConfirmationTemplate  } from "../templates/consultation.template";

export const createConsultation = async (req: Request, res: Response) => {
  try {
    const { fullName, mobileNumber, emailAddress, city, preferredDate } =
      req.body;

    if (!fullName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Full name & mobile required ❌",
      });
    }

    const savedConsultation = await Consultation.create({
      fullName,
      mobileNumber,
      emailAddress,
      city,
      preferredDate,
    });

    res.status(201).json({
      success: true,
      message: "Consultation saved successfully ✅",
      data: savedConsultation,
    });

    // ✅ Admin Email
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.error("ADMIN_EMAIL missing ❌");
      return;
    }

    const adminHtml = consultationTemplate({
      fullName,
      mobileNumber,
      emailAddress,
      city,
      preferredDate,
    });

    sendEmail({
      to: adminEmail,
      subject: "New Consultation Booking 📅",
      html: adminHtml,
    }).catch(err => console.error("Admin email failed:", err));

    // ✅ User Email (using template)
    if (emailAddress) {
      const userHtml = userConfirmationTemplate(fullName);

      sendEmail({
        to: emailAddress,
        subject: "Consultation Confirmation ✅",
        html: userHtml,
      }).catch(err => console.error("User email failed:", err));
    }

  } catch (error: any) {
    console.error("Consultation Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllConsultations = async (req: Request, res: Response) => {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Consultation requests retrieved successfully",
      data: consultations,
      success: true,
    });
  } catch (error: any) {
    console.error("Error retrieving consultation requests:", error);
    res.status(500).json({
      message: "Something went wrong while retrieving consultation requests",
      error: error.message,
      success: false,
    });
  }
};

export const deleteConsultation = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedConsultation = await Consultation.findByIdAndDelete(id);
    if (!deletedConsultation) {
      return res.status(404).json({
        message: "Consultation request not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "Consultation request deleted successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting consultation request:", error);
    res.status(500).json({
      message: "Something went wrong while deleting the consultation request",
      error: error.message,
      success: false,
    });
  }
};

export const getAConsultation = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        message: "Consultation request not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "Consultation request retrieved successfully",
      data: consultation,
      success: true,
    });
  } catch (error: any) {
    console.error("Error retrieving consultation request:", error);
    res.status(500).json({
      message: "Something went wrong while retrieving the consultation request",
      error: error.message,
      success: false,
    });
  }
};
