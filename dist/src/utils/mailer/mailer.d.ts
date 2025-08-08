export declare class Mailer {
    static sendAdminSetPasswordMail(email: string, user: string, url: string): Promise<boolean>;
    static forgotPassword(email: string, user: string, url: string): Promise<boolean>;
}
