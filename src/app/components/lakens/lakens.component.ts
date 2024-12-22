import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lakens',
  imports: [CommonModule],
  templateUrl: './lakens.component.html',
  styleUrls: ['./lakens.component.css'] // Corrected the key to `styleUrls`
})
export class LakensComponent implements OnInit {
  cards: any[] = []; // Initialize as an empty array to hold fetched data
  quantities: { [key: string]: number } = {};
  isPopupOpen = false;
  formSubmitted = false;

  formData = {
    firstName: '',
    lastName: '',
    mail: '',
    phone: '',
  };

  constructor(private supabaseService: SupabaseService) 
  {
    this.initializeQuantities();
  }

  initializeQuantities() {
    this.cards.forEach((card) => {
      this.quantities[card.name_dutch] = 0;
    });
  }

  async ngOnInit(): Promise<void> {
    // Fetch data from the Supabase database when the component initializes
    try {
      const { data, error } = await this.supabaseService.client
        .from('material') 
        .select('name_dutch, name_french, name_german, information_dutch,information_french, information_german, price'); 

      if (error) {
        console.error('Error fetching data from Supabase:', error);
        return;
      }

      // Assign fetched data to the `cards` array
      this.cards = data || [];
      this.cards.forEach(card => {
        this.quantities[card.name_dutch] = 0;
      });
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }  

  openPopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.resetForm();
  }

  submitForm() {
    this.formSubmitted = true;

    if (this.isFormValid()) {
      console.log('Form Data:', this.formData);
      console.log('Selected Quantities:', this.quantities);
      this.closePopup(); // Close the popup if form is valid
    }
  }

  resetForm() {
    this.formSubmitted = false;
    this.formData = {
      firstName: '',
      lastName: '',
      mail: '',
      phone: ''
    };

    this.initializeQuantities();
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
