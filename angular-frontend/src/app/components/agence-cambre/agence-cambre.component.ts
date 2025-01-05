import { Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { SupabaseService } from '../../services/supabase.service';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-agence-cambre',
  templateUrl:'./agence-cambre.component.html',
  styleUrls: ['./agence-cambre.component.css'],
  imports: 
  [
      MatTabsModule,
      MatTableModule 
  ],
  standalone: true
})
export class AgenceCambreComponent {
  @Input() selectedTab!: string;

  houses: any[] = [];
  equipments: any[] = [];
  
  displayedColumns: string[] = ['name', 'type', 'totalpersons', 'totalrooms', 'price', 'url'];
  equipmentColumns: string[] = ['name', 'image'];

  constructor(private supabaseService: SupabaseService) {}

  async onTabChange(event: any) {
    const selectedIndex = event.index;

    if (selectedIndex === 0 && this.houses.length === 0) {
      this.houses = await this.supabaseService.fetchHousesWithAddresses();
    } else if (selectedIndex === 1 && this.equipments.length === 0) {
      await this.supabaseService.fetchEquipments();
      this.equipments = this.supabaseService.equipments;
    }
  }
}
