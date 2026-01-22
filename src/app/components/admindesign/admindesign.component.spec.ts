import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmindesignComponent } from './admindesign.component';

describe('AdmindesignComponent', () => {
  let component: AdmindesignComponent;
  let fixture: ComponentFixture<AdmindesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmindesignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmindesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
