import { Routes } from '@angular/router';

import { Home } from './client/home/home';
import { Events } from './client/events/events';
import { EventDetails } from './client/event-details/event-details';
import { EventWizard } from './event-wizard/event-wizard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'events', component: Events },
  { path: 'events/:id', component: EventDetails },
  { path: 'admin', component: EventWizard },
  { path: '**', redirectTo: '' }
];