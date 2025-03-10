import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SmtpEmailService {

  /**
   * Sends an email using SMTPJS.
   * @param to Recipient email address
   * @param subject Email subject
   * @param body Email body (either plain text or HTML)
   */
  sendEmail(to: string, subject: string, body: string) {
    return new Promise((resolve, reject) => {
      (window as any).Email.send({
        SecureToken: "2f192caa-ad75-404b-a05f-65c5e1d47e35",
        To: to,
        From: "sup.toinon@outlook.com",
        Subject: subject,
        Body: body
      })
      .then((message: string) => {
        if (message === "OK") {
          resolve("Email sent successfully.");
        } else {
          reject("Error sending email: " + message);
        }
      })
      .catch((error: any) => reject("Error: " + error));
    });
  }
}
