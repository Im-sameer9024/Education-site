import nodemailer from "nodemailer";
import "dotenv/config.js";

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = transporter.sendMail({
      from: " StudyNotion Education Site ",
      to: email,
      subject: title,
      html: body,
    });

    return info;
  } catch (error) {
    console.log("Error occur in mailSender function", error);
  }
};

export default mailSender;
