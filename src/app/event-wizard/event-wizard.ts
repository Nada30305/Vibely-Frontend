import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-event-wizard',
  imports: [FormsModule, DatePipe],
  templateUrl: './event-wizard.html',
  styleUrl: './event-wizard.css'
})

export class EventWizard implements OnInit {

  venues: any[] = [];
  events: any[] = [];

  errorMessage = '';
  successMessage = '';
  isSaving = false;

  isEditing = false;
  editingEventId: number | null = null;

  currentStep = 1;

  savedRange: Range | null = null;

  event = {
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: 0,
    capacity: 0
  };

  constructor(
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.eventService.getVenues().subscribe({
      next: (data) => {
        this.venues = data;
        console.log('Venues loaded:', data);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading venues:', error);
        this.errorMessage = 'Unable to load venues.';
        this.cdr.detectChanges();
      }
    });

    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        console.log('Events loaded:', data);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      }
    });
  }

  editEvent(event: any) {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    this.event = {
      title: event.title,
      description: event.description || '',
      category: event.category || '',
      date: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`,
      startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
      endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
      venue: Number(event.venue_id),
      capacity: Number(event.capacity)
    };

    this.editingEventId = Number(event.id);
    this.isEditing = true;
    this.currentStep = 1;

    this.errorMessage = '';
    this.successMessage = '';
    this.savedRange = null;

    this.cdr.detectChanges();

    setTimeout(() => {
      const editor = document.getElementById('descriptionEditor');

      if (editor) {
        editor.innerHTML = this.event.description;
      }
    });
  }

  nextStep() {
    this.errorMessage = '';

    // STEP 1: Basic Information
    if (this.currentStep === 1) {

      const descriptionText = this.event.description
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

      if (
        !this.event.title.trim() ||
        !descriptionText ||
        !this.event.category
      ) {
        this.errorMessage =
          'Please fill in Title, Description and Category before continuing.';
        return;
      }
    }

    // STEP 2: Date and Time
    if (this.currentStep === 2) {

      if (
        !this.event.date ||
        !this.event.startTime ||
        !this.event.endTime
      ) {
        this.errorMessage =
          'Please provide the date, start time and end time.';
        return;
      }

      if (this.event.endTime <= this.event.startTime) {
        this.errorMessage =
          'End time must be later than start time.';
        return;
      }
    }

    // STEP 3: Venue and Capacity
    if (this.currentStep === 3) {

      const selectedVenue = this.venues.find(
        v => Number(v.id) === Number(this.event.venue)
      );

      if (!selectedVenue) {
        this.errorMessage =
          'Please select a venue before continuing.';
        return;
      }

      if (!this.event.capacity || this.event.capacity <= 0) {
        this.errorMessage =
          'Please provide a valid event capacity.';
        return;
      }

      if (Number(this.event.capacity) > Number(selectedVenue.capacity)) {
        this.errorMessage =
          `Capacity cannot exceed the venue capacity (${selectedVenue.capacity}).`;
        return;
      }
    }

    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  getVenueName(): string {
    const venue = this.venues.find(
      v => Number(v.id) === Number(this.event.venue)
    );

    return venue ? venue.name : 'Not selected';
  }

  updateDescription(inputEvent: Event) {
    const editor = inputEvent.target as HTMLElement;

    if (!editor) {
      return;
    }

    this.event.description = editor.innerHTML;
  }

  saveSelection(event: MouseEvent) {
    event.preventDefault();

    const editor = document.getElementById('descriptionEditor');
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (
      editor.contains(range.commonAncestorContainer) &&
      !range.collapsed
    ) {
      this.savedRange = range.cloneRange();
    }
  }

  formatText(command: string) {
    const editor = document.getElementById('descriptionEditor');

    if (!editor || !this.savedRange) {
      return;
    }

    const range = this.savedRange.cloneRange();

    if (
      !editor.contains(range.commonAncestorContainer) ||
      range.collapsed
    ) {
      return;
    }

    const selection = window.getSelection();

    if (!selection) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(range);

    if (command === 'insertUnorderedList') {
      const selectedText = range.toString();

      if (!selectedText.trim()) {
        return;
      }

      const list = document.createElement('ul');

      selectedText.split(/\n/).forEach(line => {
        if (line.trim()) {
          const item = document.createElement('li');
          item.textContent = line;
          list.appendChild(item);
        }
      });

      range.deleteContents();
      range.insertNode(list);

    } else {
      let tagName = '';

      switch (command) {
        case 'bold':
          tagName = 'strong';
          break;

        case 'italic':
          tagName = 'em';
          break;

        case 'underline':
          tagName = 'u';
          break;

        default:
          return;
      }

      const element = document.createElement(tagName);
      element.appendChild(range.extractContents());
      range.insertNode(element);
    }

    this.event.description = editor.innerHTML;

    selection.removeAllRanges();
    this.savedRange = null;
  }

  createEvent() {
    if (this.isSaving) {
      return;
    }

    // Check all required information before saving
    const descriptionText = this.event.description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    if (
      !this.event.title.trim() ||
      !descriptionText ||
      !this.event.category
    ) {
      this.currentStep = 1;
      this.errorMessage = 'Please complete all required information.';
      return;
    }

    if (
      !this.event.date ||
      !this.event.startTime ||
      !this.event.endTime
    ) {
      this.currentStep = 2;
      this.errorMessage = 'Please provide the date and both times.';
      return;
    }

    if (this.event.endTime <= this.event.startTime) {
      this.currentStep = 2;
      this.errorMessage = 'End time must be later than start time.';
      return;
    }

    const selectedVenue = this.venues.find(
      v => Number(v.id) === Number(this.event.venue)
    );

    if (!selectedVenue) {
      this.currentStep = 3;
      this.errorMessage = 'Please select a venue.';
      return;
    }

    if (!this.event.capacity || this.event.capacity <= 0) {
      this.currentStep = 3;
      this.errorMessage = 'Please provide a valid capacity.';
      return;
    }

    if (Number(this.event.capacity) > Number(selectedVenue.capacity)) {
      this.currentStep = 3;
      this.errorMessage =
        `Capacity cannot exceed the venue capacity (${selectedVenue.capacity}).`;
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const eventData = {
      title: this.event.title,
      description: this.event.description,
      category: this.event.category,
      start_date: `${this.event.date} ${this.event.startTime}:00`,
      end_date: `${this.event.date} ${this.event.endTime}:00`,
      venue_id: Number(this.event.venue),
      capacity: Number(this.event.capacity),
      club_id: 1,
      created_by: 1
    };

    const request = this.isEditing && this.editingEventId !== null
      ? this.eventService.updateEvent(this.editingEventId, eventData)
      : this.eventService.createEvent(eventData);

    request.subscribe({
      next: (response) => {
        console.log('Event saved:', response);

        this.successMessage = this.isEditing
          ? 'Event updated successfully!'
          : 'Event created successfully!';

        this.isSaving = false;
        this.isEditing = false;
        this.editingEventId = null;
        this.savedRange = null;

        this.loadEvents();
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error details:', error.error);

        this.errorMessage =
          error.error?.message || 'Error saving event.';

        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteEvent(id: number) {
    const confirmed = confirm(
      'Are you sure you want to delete this event?'
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.eventService.deleteEvent(id).subscribe({
      next: () => {
        this.successMessage = 'Event deleted successfully!';
        this.errorMessage = '';

        this.loadEvents();
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error deleting event:', error);

        this.errorMessage =
          error.error?.message || 'Error deleting event.';

        this.cdr.detectChanges();
      }
    });
  }

}