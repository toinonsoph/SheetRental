import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root', 
})
export class SendGridService {
  private apiUrl = 'https://sheetrentalbackend.onrender.com/api/email';  // Backend API endpoint

  constructor(private http: HttpClient) {}

  /**
   * Sends a plain text or HTML email via the backend.
   * @param to Recipient email address
   * @param subject Email subject
   * @param body Plain text email body
   * @param htmlBody HTML email body (optional)
   */
  sendPlainEmail(to: string, subject: string, body: string, htmlBody?: string) {
    const emailRequest = {
      to: to,
      subject: subject,
      body: body,
      htmlBody: htmlBody || null,
    };

    return this.http.post(`${this.apiUrl}/send`, emailRequest);
  }

  /**
   * Sends an email using a dynamic template via the backend.
   * @param to Recipient email address
   * @param templateId SendGrid dynamic template ID
   * @param dynamicData Key-value pairs for dynamic template data
   */
  sendEmailWithTemplate(to: string, templateId: string, dynamicData: Record<string, any>) {
    const templateEmailRequest = {
        to: to,
        templateId: templateId,
        dynamicData: dynamicData,
    };

    return this.http.post(`${this.apiUrl}/send-template`, templateEmailRequest, { responseType: 'text' });
}

   /**
   * Sends an email using a predefined SendGrid template without dynamic data.
   * Requires only recipient email and template ID.
   */
   sendEmailWithTemplateWithoutDynamicData(to: string, templateId: string) {
      const templateEmailRequest = {
          to: to,
          templateId: templateId,
      };
  
      return this.http.post(`${this.apiUrl}/send-template-no-data`, templateEmailRequest, { responseType: 'text' });
  }
}