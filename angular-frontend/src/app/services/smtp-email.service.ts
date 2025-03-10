import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root',
})
export class SmtpEmailService {

  private serviceId = 'service_a8f9q06';
  private templateId = 'template_0r0ccys';
  private publicKey = '0w6h4pD-8i92xWBfh';

  constructor() {
    emailjs.init(this.publicKey);
  }

  sendEmail(data: { first_name: string; last_name: string; email: string; phone_number: string; dynamic_content: string; remark: string; image_url: string }) {
    return emailjs.send(this.serviceId, this.templateId, data)
      .then(response => {
        console.log('Email sent successfully!', response);
        return response;
      })
      .catch(error => {
        console.error('Error sending email:', error);
        throw error;
      });
  }
}
