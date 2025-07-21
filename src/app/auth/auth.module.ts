import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { ApiClient, LoginDto, TokenResponse } from '../ApiClient';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';

  constructor(private client: ApiClient, private router: Router) {}

  login(email: string, password: string): Observable<TokenResponse> {
    return this.client.login({ email, password } as LoginDto).pipe(
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
