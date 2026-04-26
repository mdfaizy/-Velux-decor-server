import nodemailer from "nodemailer";

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

export const sendEmail = async ({ to, subject, html }: MailOptions) => {
  await transporter.sendMail({
    from: `"Website Contact" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};