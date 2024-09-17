import nodemailer from "nodemailer";

export async function sendMail(email, subject, content) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: subject,
      text: content,
    });

    console.log("[NODEMAILER]: Sent email successfully");
  } catch (error) {
    console.log(`[NODEMAILER]: Sent email failed: ${error.message}`);
    throw new Error(error.message);
  }
}
