import { Request, Response } from "express";
import Contact from "../model/contactModel";
import { sendEmail } from "../config/mailer";
import { contactTemplate } from "../templates/contact.template";

/* ================= CONTROLLER ================= */
export const createContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, service, message } = req.body;

    /* ================= VALIDATION ================= */
    if (!firstName || !email || !message) {
      res.status(400).json({
        success: false,
        message: "Required fields missing ❌",
      });
      return;
    }

    /* ================= SAVE TO DB ================= */
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      service,
      message,
    });

    /* ================= ADMIN EMAIL ================= */
    const adminHtml = contactTemplate({
      firstName,
      lastName,
      email,
      phone,
      service,
      message,
    });

    console.log("ADMIN:", process.env.ADMIN_EMAIL);
console.log("USER:", email);
    await sendEmail({
      to: process.env.ADMIN_EMAIL!, // 👈 better than EMAIL_USER
      subject: "New Contact Message 🚀",
      html: adminHtml,
    });

    /* ================= USER AUTO-REPLY ================= */
    const userHtml = `
      <div style="font-family:Arial; padding:20px;">
        <h2>Hello ${firstName} 👋</h2>

        <p>Thank you for contacting us 🙌</p>
        <p>We have received your message and our team will contact you soon.</p>

        <hr/>

        <p><b>Your Message:</b></p>
        <p>${message}</p>

        <br/>

        <p style="color:#888;">
          Regards,<br/>
          Team Velux Decor
        </p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "We received your message ✅",
      html: userHtml,
    });

    /* ================= RESPONSE ================= */
    res.status(201).json({
      success: true,
      message: "Message sent successfully ✅",
      data: contact,
    });

  } catch (error: any) {
    console.error("Contact Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong ❌",
    });
  }
};