var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from 'nodemailer';
function createTransporter(provider) {
    console.log(provider, "prov");
    let transporter;
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
            });
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
        default:
            throw new Error('Unsupported email provider');
    }
    return transporter;
}
const NodeMailer = (data, transport) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(data, transport);
    const transporter = createTransporter(transport);
    let from = process.env.GMAIL_SMTP_MAIL;
    if (transport === 'yahoo') {
        from = process.env.YAHOO_SMTP_MAIL;
    }
    else if (transport === 'outlook') {
        from = process.env.OUTLOOK_SMTP_MAIL;
    }
    console.log(from);
    const mailOptions = {
        from: from,
        to: data.to,
        subject: data.subject,
        text: data === null || data === void 0 ? void 0 : data.text,
        html: data.html,
    };
    yield transporter.sendMail(mailOptions);
});
export default NodeMailer;
