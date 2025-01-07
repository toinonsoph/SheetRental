import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';

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
  selectedEquipmentId: string | null = null;
  allEquipments: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.loadCards();
    await this.fetchPropertyTypes();
    await this.fetchPeopleIcon(); 
    await this.fetchRoomIcon(); 
    await this.fetchAllEquipments();
    this.currentProperty = {
      name: '',
      address: { street: '', number: '', zipcode: '8420', city: 'De Haan', country: 'Belgium' },
      image: null,
      equipment: [],
    };
  }

  async fetchAllEquipments(): Promise<void> {
    try {
      const data = await this.supabaseService.fetchAllEquipments();
      this.allEquipments = data; 
    } catch (error) {
      console.error('Error fetching all equipment:', error);
    }
  }

  async loadCards(): Promise<void> {
    try {
      const data = await this.supabaseService.fetchHousesWithAddresses();
      this.cards = data || [];
      this.filteredCards = [...this.cards];
    } catch (error) {
      console.error('Error loading cards:', error);
      this.cards = [];
      this.filteredCards = [];
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
    this.currentProperty = { ...card, address: card.address || {} };
  
    try {
      const equipment = await this.supabaseService.fetchEquipmentForProperty(card.id);
      this.currentProperty.equipment = equipment || [];
    } catch (error) {
      console.error('Error fetching equipment for property:', error);
      this.currentProperty.equipment = [];
    }
  
    this.isPopupOpen = true;
  }  

  openAddPopup(): void {
    this.isEditMode = false;
    this.currentProperty = {
      address: { street: '', number: '', zipcode: '8420', city: 'De Haan', country: 'Belgium' },
      image: null,
      equipment: [],
    };
    this.isPopupOpen = true;
  }

  closePopup(): void {
    this.isPopupOpen = false;
    this.currentProperty = {};
  }

  async saveProperty(propertyForm: NgForm): Promise<void> {
    if (propertyForm.invalid) return;
  
    try {
      // Ensure address is properly initialized
      if (!this.currentProperty.address) {
        this.currentProperty.address = { street: '', number: '', zipcode: '8420', city: 'De Haan', country: 'Belgium' };
      }
  
      // Handle image upload
      if (this.currentProperty.image && typeof this.currentProperty.image !== 'string') {
        const uploadedImage = await this.supabaseService.uploadImage(this.currentProperty.image);
        this.currentProperty.image = uploadedImage.publicUrl;
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
  
    // Store the file temporarily
    this.currentProperty.image = file;
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

  async addEquipment(): Promise<void> {
    if (!this.selectedEquipmentId || !this.currentProperty.id) {
      console.error('Missing equipment ID or property ID.');
      return;
    }

    try {
      await this.supabaseService.addEquipmentToProperty(
        this.currentProperty.id,
        this.selectedEquipmentId
      );

      // Refresh the equipment list
      this.currentProperty.equipment = await this.supabaseService.fetchEquipmentForProperty(this.currentProperty.id);
    } catch (error) {
      console.error('Error adding equipment to property:', error);
    }
  }

  async removeEquipment(equipmentName: string): Promise<void> {
    if (!this.currentProperty.id || !equipmentName) {
      console.error('Missing property ID or equipment name.');
      return;
    }

    try {
      const equipment = this.allEquipments.find(e => e.name === equipmentName);
      if (!equipment) {
        console.error('Equipment not found.');
        return;
      }

      await this.supabaseService.deleteEquipmentFromProperty(
        this.currentProperty.id,
        equipment.id
      );

      // Refresh the equipment list
      this.currentProperty.equipment = await this.supabaseService.fetchEquipmentForProperty(this.currentProperty.id);
    } catch (error) {
      console.error('Error removing equipment from property:', error);
    }
  } 
}