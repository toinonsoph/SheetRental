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
        dynamicData[`quantity_${cardKey}`] = (this.quantities[card.name_dutch] || 0).toString();
      });
  
      this.sendGridService.sendEmailWithTemplate('tnsn@axi.be', templateIdRequest, dynamicData).subscribe({
        next: () => {
          this.sendGridService.sendEmailWithTemplateWithoutDynamicData(this.formData.mail, templateIdReceived).subscribe({
            next: () => {
              this.successMessage =
                'E-mail is succesvol verzonden! Check je e-mail voor een verzendbevestiging. Check indien nodig de spam folder.<br>' +
                "L'e-mail a été envoyé avec succès! Vérifiez votre courrier électronique pour une confirmation d'expédition. Vérifiez le dossier spam si nécessaire.<br>" +
                'E-Mail wurde erfolgreich gesendet! Überprüfen Sie Ihre E-Mail auf eine Versandbestätigung. Überprüfen Sie ggf. den Spam-Ordner.';
              this.resetForm();
              this.toggleSpinner(false); 
            },
            error: () => {
              this.errorMessage =
                'The first email was sent to Cambre Services, but there was an issue with sending a received message to you. Please try again.';
              this.toggleSpinner(false); 
            },
          });
        },
        error: () => {
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
}