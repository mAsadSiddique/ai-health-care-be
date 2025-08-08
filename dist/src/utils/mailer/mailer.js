"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailer = void 0;
const sgMail = require("@sendgrid/mail");
class Mailer {
    static async sendAdminSetPasswordMail(email, user, url) {
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
        const msg = {
            to: email,
            from: process.env.SUPPORT_SENDER_EMAIL,
            templateId: 'd-76c940fea1304fb88b817327cc11194f',
            dynamic_template_data: { url, user },
        };
        try {
            const data = await sgMail.send(msg);
            console.log(`${this.sendAdminSetPasswordMail.name} is sent successfully:`, data);
            return true;
        }
        catch (error) {
            console.error(`${this.sendAdminSetPasswordMail.name} throwing error during sending email:`, JSON.stringify(error));
            return false;
        }
    }
    static async forgotPassword(email, user, url) {
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
        const msg = {
            to: email,
            from: process.env.SUPPORT_SENDER_EMAIL,
            templateId: 'd-bd804778fc4943ffbb8fd135aaf6b069',
            dynamic_template_data: { url, user },
        };
        try {
            await sgMail.send(msg);
            return true;
        }
        catch (error) {
            console.log(JSON.stringify(error));
            return false;
        }
    }
}
exports.Mailer = Mailer;
//# sourceMappingURL=mailer.js.map