import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupabaseService } from '../../services/supabase.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-verhuur',
  imports: [CommonModule],
  templateUrl: './verhuur.component.html',
  styleUrls: ['./verhuur.component.css'],
})

export class VerhuurComponent {
  cards: any[] = [];
  filteredCards: any[] = []; 
  selectedFilter: string = 'all'; 
  selectedImage: string | null = null;
  peopleIconUrl: string | null = null; 
  roomIconUrl: string | null = null; 

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.fetchPeopleIcon();
      await this.fetchRoomIcon();

      const { data: housingData, error: housingError } = await this.supabaseService.client
        .from('housing')
        .select(`
          id,
          name,
          totalpersons,
          totalrooms,
          price,
          typebase: typeid (name),
          address: addressid (street, number, postbox, zipcode, city),
          url
        `);

      if (housingError) {
        console.error('Error fetching housing data:', housingError);
        return;
      }

      const { data: houseEquipments, error: equipmentError } = await this.supabaseService.client
        .from('housingequipment')
        .select(`
          housingid,
          equipmentid (name)
        `);

      if (equipmentError) {
        console.error('Error fetching house equipments:', equipmentError);
        return;
      }

      const { data: imageFiles, error: imageError } = await this.supabaseService.client
        .storage
        .from(environment.supabaseStorage.bucket)
        .list('');

      if (imageError) {
        console.error('Error fetching image files:', imageError);
        return;
      }

      const { data: iconFiles, error: iconError } = await this.supabaseService.client
        .storage
        .from(environment.supabaseStorage.iconBucket)
        .list('');

      if (iconError) {
        console.error('Error fetching icon files:', iconError);
        return;
      }

      const defaultImageUrl = this.getDefaultImageUrl();

      // Normalize function for matching
      const normalizeString = (str: string): string =>
        str
          .normalize('NFD') // Decompose diacritics
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .toLowerCase();

      this.cards = (housingData || []).map((house: any) => {
        const normalizedHousingName = normalizeString(house.name);

        // Find matching image by normalized name
        const matchingImage = imageFiles?.find((file) =>
          normalizeString(file.name).includes(normalizedHousingName)
      );

        const equipments = houseEquipments
          .filter((equipment: any) => equipment.housingid === house.id)
          .map((equipment: any) => equipment.equipmentid.name);

        return {
          name: house.name,
          totalpersons: house.totalpersons,
          totalrooms: house.totalrooms,
          propertyType: house.typebase?.name || '',
          address: `${house.address.street} ${house.address.number}${
            house.address.postbox ? `/${house.address.postbox}, ` : ''
          }${house.address.zipcode} ${house.address.city}`,
          price: house.price,
          url: house.url,
          image: matchingImage
            ? this.getImageUrl(environment.supabaseStorage.bucket, matchingImage.name)
            : defaultImageUrl,
            equipmentIcons: equipments
            .map((equipment: string) => {
              const iconFileName = `${this.normalizeString(equipment.replace(/\s+/g, '_'))}.png`;
              const matchingIcon = iconFiles?.find(
                (file) => this.normalizeString(file.name) === iconFileName
              );

              return matchingIcon
                ? {
                    name: equipment.replace(/_/g, ' '),
                    url: this.getImageUrl(environment.supabaseStorage.iconBucket, matchingIcon.name),
                    hasIcon: true,
                  }
                : {
                    name: equipment.replace(/_/g, ' '),
                    url: null,
                    hasIcon: false,
                  };
            })
            .sort((a, b) => a.name.localeCompare(b.name)), 
        };
      });

      this.cards.sort((a, b) => a.name.localeCompare(b.name));
      this.filteredCards = [...this.cards]; 
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }
  
  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filteredCards = this.selectedFilter === 'all'
      ? this.cards
      : this.cards.filter((card) => card.propertyType.toLowerCase() === filter.toLowerCase());
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

  getDefaultImageUrl(): string {
    const baseUrl = environment.supabaseUrl;
    const bucket = environment.supabaseStorage.bucket;
    return `${baseUrl}/storage/v1/object/public/${bucket}/default.png`;
  }

  openImageModal(image: string): void {
    this.selectedImage = image;
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }

  normalizeString(str: string): string {
    return str
      .normalize('NFD') // Decompose diacritics (e.g., ë -> e + diacritic)
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
      .toLowerCase(); // Convert to lowercase for consistent comparison
  }

  equipmentIconsStyle = {
    width: '40px',
    height: '40px'
  };
}