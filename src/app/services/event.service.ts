import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/events`);
  }

  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/venues`);
  }

  createEvent(event: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/events`, event);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/events/${id}`);
  }
  updateEvent(id: number, event: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/events/${id}`, event);
}
getEventById(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/events/${id}`);
}
}