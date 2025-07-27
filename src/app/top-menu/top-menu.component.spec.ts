import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopMenuComponent } from './top-menu.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiClient } from '../ApiClient';
import { AuthService } from '../auth/auth.module';

describe('TopMenuComponent', () => {
  let component: TopMenuComponent;
  let fixture: ComponentFixture<TopMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TopMenuComponent, // ✅ standalone komponens
        HttpClientTestingModule, // ✅ HttpClient problémát megoldja
      ],
      providers: [
        AuthService,
        ApiClient, // csak ha AuthService ezt igényli
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
