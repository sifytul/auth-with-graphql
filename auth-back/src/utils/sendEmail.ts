import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "sifytulkarim37@gmail.com",
    pass: "kxzfsfjnhrhbnnmx",
  },
});

export async function sendMail(to: string, resetToken: string) {
  const host = process.env.FRONTEND_URL + "/forgotPassword/";
  const info = await transporter.sendMail({
    from: "sifytulkarim37@gmail.com",
    to,
    subject: "Docker-Auth password recovery link",
    html: `<h1>Please click the link to reset your password===>"</h1><a>${host}${resetToken}</a>`,
  });

  return info;
}
