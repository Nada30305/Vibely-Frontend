import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css'
})
export class EventDetails implements OnInit {

  event: any = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.errorMessage = 'Invalid event ID.';
      this.loading = false;
      return;
    }

    this.eventService.getEventById(id).subscribe({

      next: (data) => {
        this.event = data;
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error loading event:', error);
        this.errorMessage = 'Unable to load event details.';
        this.loading = false;
        this.cdr.detectChanges();
      }

    });
  }
}