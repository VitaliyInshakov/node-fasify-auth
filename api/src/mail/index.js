const nodemailer = require("nodemailer");

class MailSender {
    static testAccount;
    static transporter;

    static async init() {
        this.testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: this.testAccount.user,
                pass: this.testAccount.pass,
            },
        });
    }

    static async sendEmail({ from = "test@mail.com", to = "test@mail.com", subject, html }) {
        try {
            const info = await this.transporter.sendMail({
                from,
                to,
                subject,
                html,
            });
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = { MailSender };