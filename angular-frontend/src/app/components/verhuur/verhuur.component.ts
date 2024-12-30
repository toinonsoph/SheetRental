import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor

import { SupabaseService } from '../../supabase.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-verhuur',
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './verhuur.component.html',
  styleUrls: ['./verhuur.component.css'] // Note: Fixed typo here (styleUrl -> styleUrls)
})
export class VerhuurComponent {
  cards: any[] = [];
  selectedImage: string | null = null;

  formData = {
    name: '',
    address: '',
    totalpersons: '0'
  };

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      // Fetch housing data
      const { data: housingData, error: housingError } = await this.supabaseService.client
        .from('housing')
        .select(`
          id,
          name,
          totalpersons,
          typebase: typeid (name),
          address:addressid (street, number, postbox, zipcode, city)
        `);
  
      if (housingError) {
        console.error('Error fetching housing data:', housingError);
        return;
      }
  
      //Get all equipments for each house
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
  
      // Fetch image files from the bucket
      const { data: imageFiles, error: imageError } = await this.supabaseService.client
        .storage
        .from(environment.supabaseStorage.bucket)
        .list('');
  
      if (imageError) {
        console.error('Error fetching images:', imageError);
        return;
      }
  
      const defaultImageUrl = this.getDefaultImageUrl(); // Default image
  
      // Map housing data to cards
      this.cards = (housingData || []).map((house: any) => {
        // Find matching image file
        const matchingImage = imageFiles?.find((file) =>
          file.name.toLowerCase().includes(
            house.name.replace(/\s+/g, '_').toLowerCase()
          )
        );
      
        // Get equipment for this house
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
          image: matchingImage
            ? this.getImageUrl(matchingImage.name)
            : defaultImageUrl,
            equipmentIcons: equipments.map((equipment: string) => {
              const iconFileName = `${equipment.replace(/\s+/g, '_').toLowerCase()}.png`;
              const iconUrl = `./pictures/${iconFileName}`; 
            
              return {
                name: equipment.replace(/_/g, ' '),
                url: iconUrl,
              };
            }),
        }; // Properly close the object returned by `map`
      }); 
      // Sort cards alphabetically by name
      this.cards.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }
  

  //Get a list of all the images in the bucket
  async fetchImagesFromBucket(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .storage
        .from(environment.supabaseStorage.bucket) 
        .list('', { 
          limit: 150, 
        });
  
      if (error) {
        console.error('Error fetching images from Supabase bucket:', error);
        return;
      }  
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }  

  getImageUrl(fileName: string): string {
    const bucket = environment.supabaseStorage.bucket; 
    const baseUrl = environment.supabaseUrl;
  
    // Encode file name for use in a URL
    const encodedFileName = encodeURIComponent(fileName);
  
    return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedFileName}`;
  }

  getDefaultImageUrl(): string {
    const bucket = environment.supabaseStorage.bucket;
    const baseUrl = environment.supabaseUrl;
  
    return `${baseUrl}/storage/v1/object/public/${bucket}/default.png`;
  }
  
  onIconError(event: Event, fallbackName: string): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none'; 
      const parent = target.parentElement;
      if (parent) {
        const span = document.createElement('span');
        span.textContent = fallbackName;
        parent.appendChild(span);
      }
    }
  }

  openImageModal(image: string): void {
    this.selectedImage = image;
  }

  closeImageModal(): void {
    this.selectedImage = null; 
  }
}