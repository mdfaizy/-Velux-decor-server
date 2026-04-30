import { Request, Response } from "express";
import Contact from "../model/contactModel";
import { sendEmail } from "../config/mailer";
import { contactTemplate } from "../templates/contact.template";

/* ================= CONTROLLER ================= */
// export const createContact = async (

//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { firstName, lastName, email, phone, service, message } = req.body;

//     /* ================= VALIDATION ================= */
//     if (!firstName || !email || !message) {
//       res.status(400).json({
//         success: false,
//         message: "Required fields missing ❌",
//       });
//       return;
//     }

//     /* ================= SAVE TO DB ================= */
//     const contact = await Contact.create({
//       firstName,
//       lastName,
//       email,
//       phone,
//       service,
//       message,
//     });

//     /* ================= ADMIN EMAIL ================= */
//     const adminHtml = contactTemplate({
//       firstName,
//       lastName,
//       email,
//       phone,
//       service,
//       message,
//     });

//     console.log("ADMIN:", process.env.ADMIN_EMAIL);
// console.log("USER:", email);
//     await sendEmail({
//       to: process.env.ADMIN_EMAIL!, // 👈 better than EMAIL_USER
//       subject: "New Contact Message 🚀",
//       html: adminHtml,
//     });

//     /* ================= USER AUTO-REPLY ================= */
//     const userHtml = `
//       <div style="font-family:Arial; padding:20px;">
//         <h2>Hello ${firstName} 👋</h2>

//         <p>Thank you for contacting us 🙌</p>
//         <p>We have received your message and our team will contact you soon.</p>

//         <hr/>

//         <p><b>Your Message:</b></p>
//         <p>${message}</p>

//         <br/>

//         <p style="color:#888;">
//           Regards,<br/>
//           Team Velux Decor
//         </p>
//       </div>
//     `;

//     await sendEmail({
//       to: email,
//       subject: "We received your message ✅",
//       html: userHtml,
//     });

//     /* ================= RESPONSE ================= */
//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully ✅",
//       data: contact,
//     });

//   } catch (error: any) {
//     console.error("Contact Error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Something went wrong ❌",
//     });
//   }
// };


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

    /* ================= SAVE DB ================= */
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      service,
      message,
    });

    /* ================= RESPONSE (FAST) ================= */
    res.status(201).json({
      success: true,
      message: "Message sent successfully ✅",
      data: contact,
    });

    /* ================= EMAIL BACKGROUND ================= */
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.error("ADMIN_EMAIL missing ❌");
      return;
    }

    const adminHtml = contactTemplate({
      firstName,
      lastName,
      email,
      phone,
      service,
      message,
    });

    // ✅ Admin email
    sendEmail({
      to: adminEmail,
      subject: "New Contact Message 🚀",
      html: adminHtml,
    }).catch((err) => {
      console.error("Admin email failed:", err);
    });

    // ✅ User email
    const userHtml = `
      <div style="font-family:Arial; padding:20px;">
        <h2>Hello ${firstName} 👋</h2>
        <p>Thank you for contacting us 🙌</p>
        <p>We will contact you soon.</p>
        <hr/>
        <p><b>Your Message:</b></p>
        <p>${message}</p>
      </div>
    `;

    sendEmail({
      to: email,
      subject: "We received your message ✅",
      html: userHtml,
    }).catch((err) => {
      console.error("User email failed:", err);
    });

  } catch (error: any) {
    console.error("Contact Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong ❌",
    });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found ❌",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully 🗑️",
    });

  } catch (error: any) {
    console.error("Delete Contact Error:", error);

    res.status(500).json({
      success: false,
      message: "Delete failed ❌",
    });
  }
};

export const getSingleContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found ❌",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });

  } catch (error: any) {
    console.error("Get Contact Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching contact ❌",
    });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,       // updated data return kare
        runValidators: true,
      }
    );

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found ❌",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact updated successfully ✅",
      data: updatedContact,
    });

  } catch (error: any) {
    console.error("Update Contact Error:", error);

    res.status(500).json({
      success: false,
      message: "Update failed ❌",
    });
  }
};


export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      message: "Contacts fetched successfully ✅",
      data: contacts,
    });

  } catch (error: any) {
    console.error("Get All Contacts Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts ❌",
    });
  }
};