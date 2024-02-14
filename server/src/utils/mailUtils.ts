import * as nodeMailer from "nodemailer";
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
  emailToken: string
) => {
  const mailOptions = {
    from: `"Security Squirrel" <${EMAIL}>`,
    to: userEmail,
    subject: "Verify your email...",
    text: `<p>Hello 👋 ${userName}! Please verify your email by clicking the link below 👇</p> 
      <a href='${process.env.CLIENT_URL}/verify-email?emailToken=${emailToken}'>Verify Your Email</a> `,
  };
  mailer.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent:" + info.response);
    }
  });
};

const userEmail = "parrottjrs2@gmail.com";
const verificationCode = "dillawillabillabong";
