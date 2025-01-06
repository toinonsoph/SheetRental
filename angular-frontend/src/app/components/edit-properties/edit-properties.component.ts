import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-properties',
  templateUrl: './edit-properties.component.html',
  styleUrls: ['./edit-properties.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class EditPropertiesComponent implements OnInit {
  isPopupOpen: boolean = false;
  isEditMode: boolean = false;
  currentProperty: any = {};
  cards: any[] = [];
  filteredCards: any[] = [];
  selectedFilter: string = 'all';
  propertyTypes: any[] = [];
  peopleIconUrl: string | null = null;
  roomIconUrl: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.loadCards();
    await this.fetchPropertyTypes();
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

  async fetchPropertyTypes(): Promise<void> {
    try {
      const types = await this.supabaseService.fetchPropertyTypes('housing');
      this.propertyTypes = types || [];
    } catch (error) {
      console.error('Error fetching property types:', error);
    }
  }

  setFilter(filter: string): void {
    this.filteredCards = filter === 'all' ? this.cards : this.cards.filter(card => card.propertyType.toLowerCase() === filter.toLowerCase());
  }

  async openEditPopup(card: any): Promise<void> {
    this.isEditMode = true;
    this.currentProperty = { ...card };
    try {
      const equipment = await this.supabaseService.fetchEquipmentForProperty(card.id);
      this.currentProperty.equipment = equipment || [];
    } catch (error) {
      console.error('Error fetching equipment for property:', error);
    }
    this.isPopupOpen = true;
  }

  openAddPopup(): void {
    this.isEditMode = false;
    this.currentProperty = { address: {}, equipment: [] };
    this.isPopupOpen = true;
  }

  closePopup(): void {
    this.isPopupOpen = false;
    this.currentProperty = {};
  }

  async saveProperty(): Promise<void> {
    try {
      if (this.currentProperty.image && !this.currentProperty.image.startsWith('http')) {
        const { data, error } = await this.supabaseService.uploadImage(this.currentProperty.image);
        if (error) throw error;
        this.currentProperty.image = data.publicUrl;
      }

      if (this.isEditMode) {
        await this.supabaseService.updateProperty(this.currentProperty.id, this.currentProperty);
      } else {
        const addressId = await this.supabaseService.addAddress(this.currentProperty.address);
        const newProperty = await this.supabaseService.addProperty({ ...this.currentProperty, addressId });
        this.cards.push(newProperty);
      }

      this.closePopup();
      this.setFilter(this.selectedFilter);
    } catch (error) {
      console.error('Error saving property:', error);
    }
  }

  async deleteCard(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        await this.supabaseService.deleteProperty(id);
        this.cards = this.cards.filter(card => card.id !== id);
        this.setFilter(this.selectedFilter);
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  }

  async onImageChange(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      if (this.currentProperty.image && typeof this.currentProperty.image === 'string') {
        const fileName = this.supabaseService.extractFileNameFromUrl(this.currentProperty.image);
        await this.supabaseService.deleteImageFromBucket(fileName);
      }
  
      const uploadedImage = await this.supabaseService.uploadImage(file);
      this.currentProperty.image = uploadedImage.publicUrl;
    } catch (error) {
      console.error('Error handling image change:', error);
    }
  }
  
  async removeImage(): Promise<void> {
    try {
      if (this.currentProperty.image && typeof this.currentProperty.image === 'string') {
        const fileName = this.supabaseService.extractFileNameFromUrl(this.currentProperty.image);
        await this.supabaseService.deleteImageFromBucket(fileName);
      }
  
      this.currentProperty.image = null;
    } catch (error) {
      console.error('Error removing image:', error);
    }
  }   
}