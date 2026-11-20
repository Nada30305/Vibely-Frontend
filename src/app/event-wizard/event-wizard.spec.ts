import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventWizard } from './event-wizard';

describe('EventWizard', () => {
  let component: EventWizard;
  let fixture: ComponentFixture<EventWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventWizard],
    }).compileComponents();

    fixture = TestBed.createComponent(EventWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
