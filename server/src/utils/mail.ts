import * as nodeMailer from "nodemailer";
import { resolve } from "path";

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

export const emailVerificationInfo = async (pool: any, userId: number) => {
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

export const sendEmailVerification = async (
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

  return new Promise<{ success: boolean; message: string }>((resolve, reject) =>
    mailer.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        resolve({ success: false, message: "Email not sent" });
      } else {
        resolve({ success: true, message: "Email sent" });
      }
    })
  );
};

export const sendForgotPasswordVerification = async (
  userEmail: string,
  verificationToken?: string
) => {
  const mailOptions = {
    from: `"Security Squirrel" <${EMAIL}>`,
    to: userEmail,
    subject: "Confirm password change...",
    html: `<p>Are you trying to change your Greysquirrel password? If so, Please click the link below 👇</p> 
      <a href="${CLIENT_URL}/#/forgot-password/${verificationToken}">Change your password</a>`,
    text: ` Are you trying to change your Greysquirrel password? If so, Please click the link below:\n${CLIENT_URL}/#/forgot-password?verificationToken=${verificationToken}`,
  };

  return new Promise<{ success: boolean; message: string }>((resolve, reject) =>
    mailer.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        resolve({ success: false, message: "Email not sent" });
      } else {
        resolve({ success: true, message: "Email sent" });
      }
    })
  );
};
