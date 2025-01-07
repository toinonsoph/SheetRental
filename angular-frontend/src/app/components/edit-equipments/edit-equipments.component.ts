import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-edit-equipments',
  templateUrl: './edit-equipments.component.html',
  styleUrls: ['./edit-equipments.component.css'],
  standalone: true,
})
export class EditEquipmentsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'icon', 'iconPath', 'actions'];
  dataSource: any[] = [];
  showPopup = false;
  selectedEquipment: any = null;
  equipmentForm: { name: string; image: File | null } = { name: '', image: null };

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    this.dataSource = await this.supabaseService.getEquipmentForTable();
  }

  openPopup(equipment: any = null) {
    this.showPopup = true;
    this.selectedEquipment = equipment;

    if (equipment) {
      this.equipmentForm.name = equipment.name;
      this.equipmentForm.image = null; // Reset the image
    } else {
      this.equipmentForm = { name: '', image: null };
    }
  }

  closePopup() {
    this.showPopup = false;
    this.selectedEquipment = null;
    this.equipmentForm = { name: '', image: null };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.equipmentForm.image = file;
    }
  }

  async onSave() {
    try {
      if (this.selectedEquipment) {
        // Update existing equipment
        await this.supabaseService.updateEquipment(
          this.selectedEquipment.id,
          this.equipmentForm,
          this.selectedEquipment.image_path 
        );
      } else {
        // Add new equipment
        await this.supabaseService.addEquipment(this.equipmentForm);
      }
  
      // Refresh the table
      this.dataSource = await this.supabaseService.getEquipmentForTable();
      this.closePopup();
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  }

  async onDeleteEquipment(equipment: any) {
    const confirmDelete = confirm(`Are you sure you want to delete ${equipment.name}?`);
    if (!confirmDelete) return;

    try {
      await this.supabaseService.deleteEquipment(equipment.id);
      this.dataSource = await this.supabaseService.getEquipmentForTable();
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  }
}