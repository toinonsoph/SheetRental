import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { SupabaseService } from '../../services/supabase.service';
import { EditMaterialsComponent } from '../edit-materials/edit-materials.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cambre-services',
  templateUrl: './cambre-services.component.html',
  styleUrls: ['./cambre-services.component.css'],
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
  ],
  standalone: true,
})
export class CambreServicesComponent implements OnInit, AfterViewInit {
  @Input() selectedTab!: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  materials: MatTableDataSource<any> = new MatTableDataSource();
  isLoading = false;

  displayedColumns: string[] = [
    'name_dutch',
    'name_french',
    'name_german',
    'information_dutch',
    'information_french',
    'information_german',
    'price',
    'actions',
  ];

  constructor(private supabase: SupabaseService, private dialog: MatDialog) {}

  async ngOnInit() {
    await this.loadMaterials();
  }

  ngAfterViewInit() {
    if (this.materials) {
      this.materials.paginator = this.paginator;
      this.materials.sort = this.sort;
    }
  }

  async loadMaterials() {
    this.isLoading = true;
    try {
      const materials = await this.supabase.getMaterials();
      this.materials = new MatTableDataSource(materials || []);
      if (this.paginator && this.sort) {
        this.materials.paginator = this.paginator;
        this.materials.sort = this.sort;
      }
    } catch (error) {
      console.error('Failed to load materials:', error.message);
      this.materials = new MatTableDataSource([]);
    } finally {
      this.isLoading = false;
    }
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(EditMaterialsComponent, {
      width: '600px',
      data: { material: null },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadMaterials();
      }
    });
  }

  openEditDialog(material: any) {
    const dialogRef = this.dialog.open(EditMaterialsComponent, {
      width: '600px',
      data: { material },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadMaterials();
      }
    });
  }

  async deleteMaterial(id: string) {
    const isConfirmed = confirm('Are you sure you want to delete this material?');
    if (!isConfirmed) {
      return;
    }

    try {
      await this.supabase.deleteMaterial(id);
      await this.loadMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  }
}