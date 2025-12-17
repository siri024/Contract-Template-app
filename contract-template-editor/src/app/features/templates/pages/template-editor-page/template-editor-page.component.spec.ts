import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateEditorPageComponent } from './template-editor-page.component';

describe('TemplateEditorPageComponent', () => {
  let component: TemplateEditorPageComponent;
  let fixture: ComponentFixture<TemplateEditorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateEditorPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TemplateEditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
