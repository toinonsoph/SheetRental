import { Component, Input, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-cambre-services',
  templateUrl: './cambre-services.component.html',
  styleUrls: ['./cambre-services.component.css'],
})
export class CambreServicesComponent implements OnInit {
  @Input() selectedTab!: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>; // Reference the template

  materials: MatTableDataSource<any> = new MatTableDataSource();
  isLoading = false;

  displayedColumns: string[] = [
    'nameDutch',
    'nameFrench',
    'nameGerman',
    'infoDutch',
    'infoFrench',
    'infoGerman',
    'price',
    'actions',
  ];

  constructor(
    private supabase: SupabaseService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadMaterials();
  }

  async loadMaterials() {
    this.isLoading = true;
    try {
      const materials = await this.supabase.getMaterials();
      this.materials = new MatTableDataSource(materials || []);
      this.materials.paginator = this.paginator;
      this.materials.sort = this.sort;
    } catch (error) {
      console.error('Failed to load materials:', error.message);
      this.materials = new MatTableDataSource([]);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteMaterial(id: string) {
    const dialogRef = this.dialog.open(this.confirmDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.supabase.deleteMaterial(id);
          await this.loadMaterials();
        } catch (error) {
          console.error('Error deleting material:', error);
        }
      }
    });
  }
}