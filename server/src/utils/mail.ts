import { randomBytes, randomUUID } from "crypto";
import * as nodeMailer from "nodemailer";

require("dotenv").config();
const EMAIL = process.env.EMAIL;
const EMAIL_PASS = process.env.EMAIL_PASS;
const CLIENT_URL = process.env.CLIENT_URL;

const mailer = nodeMailer.createTransport({
  pool: true,
  service: "hotmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_PASS,
  },
});

export const userVerificationInfo = async (pool: any, userId: number) => {
  const query = `
  SELECT user_name, email, email_token 
  FROM users 
  WHERE user_id = ?
  `;
  const [result, _] = await pool.query(query, [userId]);
  const userInfo = JSON.parse(JSON.stringify(result));
  return {
    username: userInfo[0].user_name,
    email: userInfo[0].email,
    emailToken: userInfo[0].email_token,
  };
};

export const sendVerificationEmail = async (
  userName: string,
  userEmail: string,
  emailToken?: string
) => {
  const mailOptions = {
    from: `"Security Squirrel" <${EMAIL}>`,
    to: userEmail,
    subject: "Verify your email...",
    html: `<p>Hello 👋 ${userName}! Please verify your email by clicking the link below 👇</p> 
      <a href="${CLIENT_URL}/#/verify-email/${emailToken}">Verify Your Email</a>`,
    text: `Hello ${userName}! Please verify your email by clicking the link below:\n${CLIENT_URL}/#/verify-email?emailToken=${emailToken}`,
  };

  let success = false;
  let message = "";

  mailer.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      (success = false), (message = "Email not sent");
    } else {
      (success = true), (message = "Email sent");
    }
  });
  return { success: success, message: message };
};
