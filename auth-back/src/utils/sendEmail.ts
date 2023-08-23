import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

export async function sendMail(to: string, resetToken: string) {
  const resetLink = process.env.FRONTEND_URL! + "/forgotPassword/" + resetToken;
  const info = await transporter.sendMail({
    from: process.env.NODEMAILER_USER!,
    to,
    subject: "Docker-Auth password recovery link",
    html: `<h2 style={{text: "red",}}>Please click the link to reset your password===>"</h2><a href=${resetLink} style={{text:"green"}}>Click here</a><span> to reset</span>`,
  });

  return info;
}
