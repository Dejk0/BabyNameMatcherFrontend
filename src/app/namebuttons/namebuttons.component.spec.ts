import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NamebuttonsComponent } from './namebuttons.component';

describe('NamebuttonsComponent', () => {
  let component: NamebuttonsComponent;
  let fixture: ComponentFixture<NamebuttonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NamebuttonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NamebuttonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
