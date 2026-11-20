
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  capacity: number;
  available_seats: number;
  location: string;
  venue_name: string;
  popularity: number;
  status?: string;
}

interface EventsResponse {
  success: boolean;
  count: number;
  data: Event[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  private apiUrl = 'http://localhost:3000/api/events/search';
  private searchTimer?: ReturnType<typeof setTimeout>;

  // FILTERS
  keyword = '';
  selectedDate = '';
  selectedCategory = 'All';
  sortBy = 'date';

  // ANGULAR SIGNALS
  events = signal<Event[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  hasSearched = signal<boolean>(false);
  selectedEventId = signal<number | null>(null);

  categories: string[] = [
    'All',
    'Technology',
    'Business',
    'Science',
    'Culture',
    'Workshop'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('Angular component initialized');
    this.searchEvents();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  onKeywordChange(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.searchEvents();
    }, 350);
  }

  searchEvents(): void {

    this.hasSearched.set(true);
    this.loading.set(true);
    this.errorMessage.set('');

    let params = new HttpParams();

    if (this.keyword.trim() !== '') {
      params = params.set('keyword', this.keyword.trim());
    }

    if (this.selectedDate !== '') {
      params = params.set('date', this.selectedDate);
    }

    if (
      this.selectedCategory !== 'All' &&
      this.selectedCategory !== ''
    ) {
      params = params.set('category', this.selectedCategory);
    }

    params = params.set('sort', this.sortBy);

    console.log('Sending request to:', this.apiUrl);
    console.log('Search parameters:', params.toString());

    this.http.get<EventsResponse>(this.apiUrl, { params })
      .subscribe({

        next: (response) => {

          console.log('FULL RESPONSE:', response);
          console.log('DATA:', response?.data);

          if (response && Array.isArray(response.data)) {
            this.events.set(response.data);
          } else {
            this.events.set([]);
          }

          console.log('EVENTS:', this.events());
          console.log('EVENTS LENGTH:', this.events().length);

          this.loading.set(false);
          this.errorMessage.set('');
        },

        error: (error) => {

          console.error('API ERROR:', error);

          this.errorMessage.set(
            error.error?.message ||
            error.message ||
            'Unable to load events. Please try again.'
          );

          this.events.set([]);
          this.loading.set(false);
        }

      });
  }

  resetFilters(): void {

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.keyword = '';
    this.selectedDate = '';
    this.selectedCategory = 'All';
    this.sortBy = 'date';

    this.selectedEventId.set(null);

    this.searchEvents();
  }

  toggleEventInfo(eventId: number): void {

    if (this.selectedEventId() === eventId) {
      this.selectedEventId.set(null);
    } else {
      this.selectedEventId.set(eventId);
    }
  }

  formatDate(date: string): string {

    if (!date) {
      return 'Date not available';
    }

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

}
