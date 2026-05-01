// import nodemailer from "nodemailer";

// type MailOptions = {
//   to: string;
//   subject: string;
//   html: string;
// };

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER!,
//     pass: process.env.EMAIL_PASS!,
//   },
// });

// export const sendEmail = async ({ to, subject, html }: MailOptions) => {
//   await transporter.sendMail({
//     from: `"Website Contact" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };


import axios from "axios";

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async ({ to, subject, html }: MailOptions) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.EMAIL_FROM,
          name: "Website Contact",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent ✅");
  } catch (error: any) {
    console.error("Email error ❌", error.response?.data || error.message);
  }
};