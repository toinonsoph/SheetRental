import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SupabaseService } from '../../services/supabase.service';
// import { SendGridService } from '../../services/sendgrid.service';
import { SmtpEmailService } from '../../services/smtp-email.service';

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
    // private sendGridService: SendGridService,
    private smtpEmailService: SmtpEmailService,
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

  // submitForm() {
  //   this.formSubmitted = true;

  //   if (this.isFormValid()) {
  //     this.toggleSpinner(true);

  //     const dynamicContent = this.generateEmailHTML();

  //     const templateId = 'd-b4eb9feefbde4aa4a3ead2460c8c973d';
  //     const dynamicData = { dynamic_content: dynamicContent };

  //     this.sendGridService.sendEmailWithTemplate('toinon.naesen@hotmail.com', templateId, dynamicData).subscribe({
  //       next: () => {
  //         this.successMessage =
  //           'E-mail is succesvol verzonden! Check je e-mail voor een verzendbevestiging. Check indien nodig de spam folder.';
  //         this.resetForm();
  //         this.toggleSpinner(false);
  //       },
  //       error: (error) => {
  //         console.error('Error sending email:', error);
  //         this.errorMessage = 'There was an issue with sending the email. Please try again.';
  //         this.toggleSpinner(false);
  //       },
  //     });
  //   } else {
  //     this.errorMessage = 'The form is not valid. Please fill in all required fields.';
  //     this.toggleSpinner(false);
  //     this.isPopupOpen = true;
  //   }
  // }

  submitForm() {
    this.formSubmitted = true;

    if (this.isFormValid()) {
      this.toggleSpinner(true);

      const emailData = {
        first_name: this.formData.firstName,
        last_name: this.formData.lastName,
        email: this.formData.mail,
        phone_number: this.formData.phone,
        dynamic_content: this.generateEmailHTML(),
        remark: this.formData.remark,
        image_url: ''
      };

      this.smtpEmailService.sendEmail(emailData)
        .then(() => {
          this.successMessage = 'E-mail is succesvol verzonden! Wij zullen dit zo spoedig mogelijk behandelen en zullen u contacteren. / Email envoyé avec succès ! Nous traiterons cela dans les plus brefs délais et vous contacterons. / E-Mail erfolgreich gesendet! Wir werden uns schnellstmöglich darum kümmern und mit Ihnen Kontakt aufnehmen.';
          this.resetForm();
          this.toggleSpinner(false);
        })
        .catch(error => {
          this.errorMessage = `Er was een probleem met het verzenden van de e-mail. Probeer het opnieuw of neem op een andere manier contact met ons op. / Un problème est survenu lors de l'envoi de l'e-mail. Veuillez réessayer ou nous contacter d'une autre manière. / Beim Senden der E-Mail ist ein Problem aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns auf andere Weise.`;
          this.toggleSpinner(false);
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
    return `
        ${this.cards
          .map(card => {
            const quantity = this.quantities[card.name_dutch] || 0;
            return `- ${card.name_dutch}: ${quantity}`;
          })
          .join('\n')}
    `;
  }
}
