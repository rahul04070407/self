import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmisComponent } from './emis.component';

describe('EmisComponent', () => {
  let component: EmisComponent;
  let fixture: ComponentFixture<EmisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
