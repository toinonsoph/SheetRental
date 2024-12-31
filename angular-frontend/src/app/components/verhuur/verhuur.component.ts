import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupabaseService } from '../../supabase.service';
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
  filteredCards: any[] = []; // Array for filtered cards
  selectedFilter: string = 'all'; // Default filter
  selectedImage: string | null = null;
  peopleIconUrl: string | null = null; // URL for the People Icon

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.fetchPeopleIcon();

      const { data: housingData, error: housingError } = await this.supabaseService.client
        .from('housing')
        .select(`
          id,
          name,
          totalpersons,
          price,
          typebase: typeid (name),
          address: addressid (street, number, postbox, zipcode, city)
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

      this.cards = (housingData || []).map((house: any) => {
        const matchingImage = imageFiles?.find((file) =>
          file.name.toLowerCase().includes(
            house.name.replace(/\s+/g, '_').toLowerCase()
          )
        );

        const equipments = houseEquipments
          .filter((equipment: any) => equipment.housingid === house.id)
          .map((equipment: any) => equipment.equipmentid.name);

        return {
          name: house.name,
          totalpersons: house.totalpersons,
          propertyType: house.typebase?.name || '',
          address: `${house.address.street} ${house.address.number}, ${
            house.address.postbox ? `Postbox: ${house.address.postbox}, ` : ''
          }${house.address.zipcode} ${house.address.city}`,
          price: house.price,
          image: matchingImage
            ? this.getImageUrl(environment.supabaseStorage.bucket, matchingImage.name)
            : defaultImageUrl,
          equipmentIcons: equipments
            .map((equipment: string) => {
              const iconFileName = `${equipment.replace(/\s+/g, '_').toLowerCase()}.png`;
              const matchingIcon = iconFiles?.find((file) => file.name === iconFileName);

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

  // Fetch the People Icon URL
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
}