import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireConfirmComponent } from './questionnaire-confirm.component';

describe('QuestionnaireConfirmComponent', () => {
  let component: QuestionnaireConfirmComponent;
  let fixture: ComponentFixture<QuestionnaireConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionnaireConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionnaireConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
