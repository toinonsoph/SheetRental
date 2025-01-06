import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-edit-properties',
  templateUrl: './edit-properties.component.html',
  styleUrls: ['./edit-properties.component.css'],
  standalone: true,
})
export class EditPropertiesComponent implements OnInit {
  isPopupOpen: boolean = false;
  isEditMode: boolean = false;
  currentProperty: any = {};
  cards: any[] = [];
  filteredCards: any[] = [];
  selectedFilter: string = 'all';
  selectedImage: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.loadCards();
  }

  async loadCards(): Promise<void> {
    try {
      const data = await this.supabaseService.fetchHousesWithAddresses();
      this.cards = data;
      this.filteredCards = [...this.cards];
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filteredCards =
      this.selectedFilter === 'all'
        ? this.cards
        : this.cards.filter((card) =>
            card.propertyType.toLowerCase() === filter.toLowerCase()
          );
  }

  openEditPopup(card: any): void {
    this.isEditMode = true;
    this.currentProperty = { ...card };
    this.isPopupOpen = true;
  }

  openAddPopup(): void {
    this.isEditMode = false;
    this.currentProperty = {};
    this.isPopupOpen = true;
  }

  closePopup(): void {
    this.isPopupOpen = false;
    this.currentProperty = {};
  }

  async saveProperty(): Promise<void> {
    try {
      if (this.isEditMode) {
        await this.supabaseService.updateProperty(
          this.currentProperty.id,
          this.currentProperty
        );
        const index = this.cards.findIndex(
          (c) => c.id === this.currentProperty.id
        );
        if (index !== -1) {
          this.cards[index] = { ...this.currentProperty };
        }
      } else {
        const addressId = await this.supabaseService.addAddress({
          street: this.currentProperty.street,
          city: this.currentProperty.city,
          zipcode: this.currentProperty.zipcode,
          number: this.currentProperty.number,
          postbox: this.currentProperty.postbox,
        });

        const newProperty = await this.supabaseService.addProperty({
          ...this.currentProperty,
          addressId: addressId,
        });
        
        if (!newProperty) {
          console.error('Failed to create a new property.');
          return;
        }
        
        this.cards.push({ ...newProperty });        
      }

      this.closePopup();
      this.setFilter(this.selectedFilter);
    } catch (error) {
      console.error('Error saving property:', error);
    }
  }

  async deleteCard(id: string): Promise<void> {
    try {
      await this.supabaseService.deleteProperty(id);
      this.cards = this.cards.filter((card) => card.id !== id);
      this.setFilter(this.selectedFilter);
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  }

  openImageModal(image: string): void {
    this.selectedImage = image;
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }
}