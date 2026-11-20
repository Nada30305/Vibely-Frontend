import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-events',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {

  events: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {

    this.loading = true;
    this.errorMessage = '';

    this.eventService.getEvents().subscribe({

      next: (data) => {
        console.log('EVENTS RECEIVED:', data);

        this.events = data;
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('GET EVENTS ERROR:', error);

        this.errorMessage = 'Unable to load events. Please try again later.';
        this.loading = false;

        this.cdr.detectChanges();
      }

    });

  }

}