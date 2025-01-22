import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SupabaseService } from '../../services/supabase.service';
import { SendGridService } from '../../services/sendgrid.service';

@Component({
  standalone: true,
  selector: 'app-lakens',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './lakens.component.html',
  styleUrls: ['./lakens.component.css'] // Corrected the key to `styleUrls`
})

export class LakensComponent implements OnInit {
  cards: any[] = [];
  quantities: { [key: string]: number } = {};
  isPopupOpen = false;
  isLoading = false;
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
    private sendGridService: SendGridService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.toggleSpinner(true);
      const { data, error } = await this.supabaseService.client
        .from('material')
        .select('name_dutch, name_french, name_german, information_dutch, information_french, information_german, price')
        .eq('deleted', false);

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
    } finally {
      this.toggleSpinner(false);
    }
  }

  openPopup() {
    this.isPopupOpen = true;
    this.successMessage = null;
    this.errorMessage = null;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.toggleSpinner(false);
    this.resetForm();
  }

  submitForm() {
    this.formSubmitted = true;

    if (this.isFormValid()) {
      this.toggleSpinner(true);

      const dynamicContent = this.generateEmailHTML();

      const templateId = 'd-b4eb9feefbde4aa4a3ead2460c8c973d';
      const dynamicData = { dynamic_content: dynamicContent };

      this.sendGridService.sendEmailWithTemplate('toinon.naesen@hotmail.com', templateId, dynamicData).subscribe({
        next: () => {
          this.successMessage =
            'E-mail is succesvol verzonden! Check je e-mail voor een verzendbevestiging. Check indien nodig de spam folder.';
          this.resetForm();
          this.toggleSpinner(false);
        },
        error: (error) => {
          console.error('Error sending email:', error);
          this.errorMessage = 'There was an issue with sending the email. Please try again.';
          this.toggleSpinner(false);
        },
      });
    } else {
      this.errorMessage = 'The form is not valid. Please fill in all required fields.';
      this.toggleSpinner(false);
      this.isPopupOpen = true;
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
    this.isPopupOpen = false;
  }

  initializeQuantities() {
    this.cards.forEach((card) => {
      this.quantities[card.name_dutch] = 0;
    });
  }

  isFormValid() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailPattern.test(this.formData.mail);
    const isPhoneValid = this.formData.phone.length >= 10;

    return (
      this.formData.firstName &&
      this.formData.lastName &&
      isEmailValid &&
      isPhoneValid
    );
  }

  toggleSpinner(status: boolean) {
    this.isLoading = status;
    console.log(`Spinner status: ${status}`);
    this.cdr.detectChanges();
  }

  generateEmailHTML(): string {
    const quantitiesHTML = this.cards
      .map(card => {
        const quantity = this.quantities[card.name_dutch] || 0;
        return `<li>${card.name_dutch} / ${card.name_french} / ${card.name_german}: ${quantity}</li>`;
      })
      .join('');

    return `
      <ul>
        ${quantitiesHTML}
      </ul>
    `;
  }
}
