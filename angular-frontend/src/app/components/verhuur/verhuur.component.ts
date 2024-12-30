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
  selectedImage: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      const { data: housingData, error: housingError } = await this.supabaseService.client
        .from('housing')
        .select(`
          id,
          name,
          totalpersons,
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

      const { data: iconFiles, error: iconError } = await this.supabaseService.client
        .storage
        .from(environment.supabaseStorage.iconBucket) // Replace with your icon bucket name
        .list('');

      if (iconError) {
        console.error('Error fetching icon files:', iconError);
        return;
      }

      const defaultImageUrl = this.getDefaultImageUrl();

      this.cards = (housingData || []).map((house: any) => {
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
          image: defaultImageUrl,
          equipmentIcons: equipments.map((equipment: string) => {
            const iconFileName = `${equipment.replace(/\s+/g, '_').toLowerCase()}.png`;
            const matchingIcon = iconFiles?.find((file) => file.name === iconFileName);

            if (matchingIcon) {
              return {
                name: equipment.replace(/_/g, ' '),
                url: this.getImageUrl(environment.supabaseStorage.iconBucket, matchingIcon.name),
                hasIcon: true,
              };
            } else {
              return {
                name: equipment.replace(/_/g, ' '),
                url: null, // No icon URL
                hasIcon: false,
              };
            }
          }),
        };
      });

      this.cards.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  getImageUrl(bucket: string, fileName: string): string {
    const baseUrl = environment.supabaseUrl;
    const encodedFileName = encodeURIComponent(fileName);
    return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedFileName}`;
  }

  getDefaultImageUrl(): string {
    const baseUrl = environment.supabaseUrl;
    return `${baseUrl}/storage/v1/object/public/images/default.png`; // Replace with your default image path
  }
}