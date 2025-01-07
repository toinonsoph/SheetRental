import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-equipments',
  templateUrl: './edit-equipments.component.html',
  styleUrls: ['./edit-equipments.component.css'],
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    CommonModule
  ],
})

export class EditEquipmentsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'icon', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  showPopup = false;
  selectedEquipment: any = null;
  equipmentForm: { name: string; image: File | null } = { name: '', image: null };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      const equipments = await this.supabaseService.getEquipmentForTable();
      this.dataSource.data = equipments;
      this.dataSource.paginator = this.paginator;
    } catch (error) {
      console.error('Error fetching equipment data:', error);
    }
  }

  openPopup(equipment: any = null) {
    this.showPopup = true;
    this.selectedEquipment = equipment || null;

    this.equipmentForm = equipment
      ? { name: equipment.name, image: null }
      : { name: '', image: null };
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
        await this.supabaseService.updateEquipment(
          this.selectedEquipment.id,
          this.equipmentForm,
          this.selectedEquipment.image_path
        );
      } else {
        await this.supabaseService.addEquipment(this.equipmentForm);
      }

      const equipments = await this.supabaseService.getEquipmentForTable();
      this.dataSource.data = equipments;
      this.closePopup();
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  }

  async onDeleteEquipment(equipment: any) {
    const isConfirmed = confirm(`Are you sure you want to delete "${equipment.name}"?`);
    if (!isConfirmed) return;

    try {
      await this.supabaseService.deleteEquipment(equipment.id, equipment.image_path);
      const equipments = await this.supabaseService.getEquipmentForTable();
      this.dataSource.data = equipments;
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  }
}