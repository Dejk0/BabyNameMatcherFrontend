import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiClient, LoginRequestDto, TokenResponse } from '../ApiClient';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';

  constructor(private client: ApiClient, private router: Router) {}

  login(email: string, password: string): Observable<TokenResponse> {
    return this.client.login({ email, password } as LoginRequestDto).pipe(
      tap((response: TokenResponse) => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }
}
