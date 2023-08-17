import { Email } from 'controller/userController.js';
import nodemailer, { TransportOptions } from 'nodemailer'

const NodeMailer = async (data: Email) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        service: false,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,

        }
    } as TransportOptions)

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html
    };
    await transporter.sendMail(mailOptions)
}

export default NodeMailer