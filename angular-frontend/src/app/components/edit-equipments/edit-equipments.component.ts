import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  equipmentForm: { name: string; image: File | null; iconUrl?: string } = { name: '', image: null, iconUrl : '' };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private supabaseService: SupabaseService,  private snackBar: MatSnackBar) {}

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
      ? {
          name: equipment.name,
          image: null, // Leave the file field empty, as it's optional
          iconUrl: equipment.iconUrl, // Add this to prefill the image
        }
      : {
          name: '',
          image: null,
          iconUrl: '', // No image when adding new equipment
        };
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
        // Edit existing equipment
        await this.supabaseService.updateEquipment(
          this.selectedEquipment.id,
          this.equipmentForm,
          this.selectedEquipment.iconUrl
        );
  
        this.snackBar.open('Equipment updated successfully!', 'Close', {
          duration: 3000, 
        });
      } else {
        // Add new equipment
        await this.supabaseService.addEquipment(this.equipmentForm);
  
        this.snackBar.open('Equipment added successfully!', 'Close', {
          duration: 3000, 
        });
      }
  
      // Refresh the table
      const equipments = await this.supabaseService.getEquipmentForTable();
      this.dataSource.data = equipments;
  
      this.closePopup();
    } catch (error) {
      console.error('Error saving equipment:', error);
      this.snackBar.open('An error occurred while saving the equipment.', 'Close', {
        duration: 3000,
      });
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