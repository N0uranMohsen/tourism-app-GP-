import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { User } from "../../DB/models/user.model.js";

export const sendEmail = async (email,otp) => {
  // console.log("frommael");
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:process.env.EMAIL,
      pass:process.env.PASS,
    },
    tls: {
      rejectUnauthorized: false, // Ignore self-signed certificate errors
    },
  });

  jwt.sign({ email },process.env.SECRETKEY, async (err, token) => {


    const info = await transporter.sendMail({
      from: `Papyros 🤎 `, // sender address
      to: email, // list of receivers
      subject: "account verification", // Subject line
      //html: "<b>Hello world?</b>"
      //  html: `<a  href='http://localhost:3000/users/verify/${token}'>Click here to verify your email</a>`, // html body
      html: `<b>your otp code : ${otp}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
  });
};
