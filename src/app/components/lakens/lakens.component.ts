import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupabaseService } from '../../supabase.service';
import { SendGridService } from '../../sendgrid.service';

@Component({
  standalone: true,
  selector: 'app-lakens',
  imports: [CommonModule],
  templateUrl: './lakens.component.html',
  styleUrls: ['./lakens.component.css'] // Corrected the key to `styleUrls`
})

export class LakensComponent implements OnInit {
  cards: any[] = [];
  quantities: { [key: string]: number } = {};
  isPopupOpen = false;
  formSubmitted = false;
  successMessage: string | null = null; // Add success message variable
  errorMessage: string | null = null;

  formData = {
    firstName: '',
    lastName: '',
    mail: '',
    phone: '',
    remark: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private sendGridService: SendGridService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('material')
        .select('name_dutch, name_french, name_german, information_dutch, information_french, information_german, price');

      if (error) {
        console.error('Error fetching data from Supabase:', error);
        return;
      }

      this.cards = data || [];
      this.cards.forEach((card) => {
        this.quantities[card.name_dutch] = 0;
      });
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  openPopup() {
    this.isPopupOpen = true;
    this.successMessage = null; 
    this.errorMessage = null;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.resetForm();
  }

  submitForm() {
    console.log('Form submitted!'); 
    console.log(this.isFormValid());

    this.formSubmitted = true;

    if (this.isFormValid()) {
      const templateIdRequest = 'd-b4eb9feefbde4aa4a3ead2460c8c973d';
      const templateIdReceived = 'd-89a05b23f6b146c4a2243e7c485e2260';
      const dynamicData: any = {
        first_name: this.formData.firstName,
        last_name: this.formData.lastName,
        email: this.formData.mail,
        phone_number: this.formData.phone,
        remark: this.formData.remark,
      };

      this.cards.forEach((card) => {
        const cardKey = card.name_dutch.replace(/\s+/g, '').toLowerCase();
        dynamicData[`quantity_${cardKey}`] = this.quantities[card.name_dutch] || 0;
      });

      this.sendGridService.sendEmailWithTemplate(this.formData.mail, templateIdRequest, dynamicData).subscribe({
        next: () => {
          this.successMessage = 'Message has been sent successfully!';
          this.resetForm();
          this.isPopupOpen = false; 
        },
        error: (error) => {
          this.errorMessage = 'An error occured while sending the message. Please try again. {error}';
          console.log('Error sending email:', error);
        }
      });

      this.sendGridService.sendEmailWithTemplateWithoutDynamicData('sup.toinon@outlook.com', templateIdReceived).subscribe(
        (response) => {
          console.log('Email sent successfully:', response);
        },
        (error) => {
          console.log('Error sending email:', error);
        }
      );
    }
  }

  resetForm() {
    this.formSubmitted = false;
    this.formData = {
      firstName: '',
      lastName: '',
      mail: '',
      phone: '',
      remark: ''
    };
    this.initializeQuantities();
  }

  initializeQuantities() {
    this.cards.forEach((card) => {
      this.quantities[card.name_dutch] = 0;
    });
  }

  isFormValid() {
    return (
      this.formData.firstName &&
      this.formData.lastName &&
      this.formData.mail &&
      this.formData.phone
    );
  }
}