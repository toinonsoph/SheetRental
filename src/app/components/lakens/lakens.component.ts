import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lakens',
  imports: [CommonModule],
  templateUrl: './lakens.component.html',
  styleUrls: ['./lakens.component.css'] // Corrected the key to `styleUrls`
})
export class LakensComponent implements OnInit {
  cards: any[] = []; // Initialize as an empty array to hold fetched data

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    // Fetch data from the Supabase database when the component initializes
    try {
      const { data, error } = await this.supabaseService.client
        .from('material') 
        .select('name_dutch, name_french, name_german, information_dutch,information_french, information_german, price'); 

      if (error) {
        console.error('Error fetching data from Supabase:', error);
        return;
      }

      // Assign fetched data to the `cards` array
      this.cards = data || [];
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }
}
