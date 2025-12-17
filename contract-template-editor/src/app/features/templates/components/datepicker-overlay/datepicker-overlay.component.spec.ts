import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerOverlayComponent } from './datepicker-overlay.component';

describe('DatepickerOverlayComponent', () => {
  let component: DatepickerOverlayComponent;
  let fixture: ComponentFixture<DatepickerOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatepickerOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatepickerOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
