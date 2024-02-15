import { randomBytes } from "crypto";
import * as nodeMailer from "nodemailer";

require("dotenv").config();
const EMAIL = process.env.EMAIL;
const EMAIL_PASS = process.env.EMAIL_PASS;
const CLIENT_URL = process.env.CLIENT_URL;

const mailer = nodeMailer.createTransport({
  service: "hotmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_PASS,
  },
});

export const sendEmail = async (
  userName: string,
  userEmail: string,
  emailToken?: string | undefined
) => {
  let userToken = emailToken;
  if (!emailToken) {
    userToken = randomBytes(64).toString("base64");
  }
  const mailOptions = {
    from: `"Security Squirrel" <${EMAIL}>`,
    to: userEmail,
    subject: "Verify your email...",
    html: `<p>Hello 👋 ${userName}! Please verify your email by clicking the link below 👇</p> 
      <a href="${CLIENT_URL}/#/verify-email/${userToken}">Verify Your Email</a>`,
    text: `Hello ${userName}! Please verify your email by clicking the link below:\n${CLIENT_URL}/verify-email?emailToken=${userToken}`,
  };

  mailer.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return { success: false, message: "Email not sent" };
    } else {
      return { success: true, message: "Email sent" };
    }
  });
};
