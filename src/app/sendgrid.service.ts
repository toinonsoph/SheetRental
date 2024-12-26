import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root', // Makes this service available throughout the app
})
export class SendGridService {
  private apiUrl = 'https://api.sendgrid.com/v3/mail/send';

  constructor(private http: HttpClient) {}

  /**
   * Sends an email using plain text or HTML
   */
  sendEmail(to: string, subject: string, text: string, html?: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.sendgridApiKey}`, 
      'Content-Type': 'application/json',
    });

    const body = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: { email: 'sup.toinon@outlook.com' }, // Replace with a verified sender email
      content: [
        {
          type: 'text/plain',
          value: text,
        },
        ...(html
          ? [
              {
                type: 'text/html',
                value: html,
              },
            ]
          : []),
      ],
    };

    return this.http.post(this.apiUrl, body, { headers });
  }

  /**
   * Sends an email using a predefined SendGrid dynamic template
   */
  sendEmailWithTemplate(to: string, templateId: string, dynamicData: Record<string, any>) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.sendgridApiKey}`, 
      'Content-Type': 'application/json',
    });

    const body = {
      personalizations: [
        {
          to: [{ email: to }],
          dynamic_template_data: dynamicData,
        },
      ],
      from: { email: 'sup.toinon@outlook.com' }, // Replace with a verified sender email
      template_id: templateId, 
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}
