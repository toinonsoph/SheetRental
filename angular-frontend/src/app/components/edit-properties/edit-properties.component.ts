import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-edit-properties',
  templateUrl: './edit-properties.component.html',
  styleUrls: ['./edit-properties.component.css'],
  standalone: true,
  imports: 
  [
    CommonModule
  ]
})
export class EditPropertiesComponent implements OnInit {
  isPopupOpen: boolean = false;
  isEditMode: boolean = false;
  currentProperty: any = {};
  cards: any[] = [];
  filteredCards: any[] = [];
  selectedFilter: string = 'all';
  selectedImage: string | null = null;
  peopleIconUrl: string | null = null; 
  roomIconUrl: string | null = null; 

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.loadCards();
  }

  async loadCards(): Promise<void> {
    try {
      const data = await this.supabaseService.fetchHousesWithAddresses();      
      this.cards = data || []; 
      this.filteredCards = [...this.cards];
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  }

  setFilter(filter: string): void {
    console.log('Selected Filter:', filter); 
    console.log('Cards Before Filter:', this.cards); 
  
    this.filteredCards =
      filter === 'all'
        ? this.cards
        : this.cards.filter((card) =>
            card.propertyType.toLowerCase() === filter.toLowerCase()
          );  
    console.log('Filtered Cards:', this.filteredCards); 
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
        
        this.cards.push(newProperty);   
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

  async fetchPeopleIcon(): Promise<void> {
      try {
        const { data, error } = await this.supabaseService.client
          .storage
          .from(environment.supabaseStorage.iconBucket)
          .list('', { search: 'people.png' });
  
        if (error) {
          console.error('Error fetching People icon:', error);
          return;
        }
  
        const matchingIcon = data?.find((file) => file.name === 'people.png');
        if (matchingIcon) {
          this.peopleIconUrl = this.getImageUrl(environment.supabaseStorage.iconBucket, matchingIcon.name);
        } else {
          console.warn('People icon not found.');
        }
      } catch (err) {
        console.error('Unexpected error fetching People icon:', err);
      }
    }
  
    async fetchRoomIcon(): Promise<void> {
      try {
        const { data, error } = await this.supabaseService.client
          .storage
          .from(environment.supabaseStorage.iconBucket)
          .list('', { search: 'room.png' });
  
        if (error) {
          console.error('Error fetching Room icon:', error);
          return;
        }
  
        const matchingIcon = data?.find((file) => file.name === 'room.png');
        if (matchingIcon) {
          this.roomIconUrl = this.getImageUrl(environment.supabaseStorage.iconBucket, matchingIcon.name);
        } else {
          console.warn('Room icon not found.');
        }
      } catch (err) {
        console.error('Unexpected error fetching Room icon:', err);
      }
    }

    getImageUrl(bucket: string, fileName: string): string {
      const baseUrl = environment.supabaseUrl;
      const encodedFileName = encodeURIComponent(fileName);
      return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedFileName}`;
    }
}