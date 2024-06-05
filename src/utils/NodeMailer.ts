import { Email } from '../controller/userController.js';
import nodemailer, { TransportOptions, Transporter } from 'nodemailer'


function createTransporter(provider: string): Transporter {
    let transporter: Transporter;
    switch (provider.toLowerCase()) {
        case 'google':
            transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                service: false,
                auth: {
                    user: process.env.GMAIL_SMTP_MAIL,
                    pass: process.env.GMAIL_SMTP_PASSWORD,
                },
            } as TransportOptions);
            break;

        case 'yahoo':
            transporter = nodemailer.createTransport({
                service: 'yahoo',
                auth: {
                    user: process.env.YAHOO_SMTP_MAIL,
                    pass: process.env.YAHOO_SMTP_PASSWORD,
                },
            });
            break;

        case 'outlook':
            transporter = nodemailer.createTransport({
                host: 'smtp.office365.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.OUTLOOK_SMTP_MAIL,
                    pass: process.env.OUTLOOK_SMTP_PASSWORD,
                },
            });
            break;

        // Add more cases for other providers as needed

        default:
            throw new Error('Unsupported email provider');
    }

    return transporter;
}

const NodeMailer = async (data: Email, transport: 'yahoo' | 'google' | 'outlook') => {
    const transporter = createTransporter(transport)

    let from = process.env.GMAIL_SMTP_MAIL;
    if (transport === 'yahoo') {
        from = process.env.YAHOO_SMTP_MAIL
    } else if (transport === 'outlook') {
        from = process.env.OUTLOOK_SMTP_MAIL
    }

    const mailOptions = {
        from: from,
        to: data.to,
        subject: data.subject,
        text: data?.text,
        html: data.html,
        // attachments: data.attachments
    };
    await transporter.sendMail(mailOptions)
}

export default NodeMailer