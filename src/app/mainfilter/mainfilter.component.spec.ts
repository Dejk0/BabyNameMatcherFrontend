import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainfilterComponent } from './mainfilter.component';

describe('MainfilterComponent', () => {
  let component: MainfilterComponent;
  let fixture: ComponentFixture<MainfilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainfilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainfilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
