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