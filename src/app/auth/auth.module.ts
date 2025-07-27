import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiClient, LoginRequestDto, TokenResponse } from '../ApiClient';
import { jwtDecode } from 'jwt-decode'; // ✅ Ez működik ESM alatt

interface TokenPayload {
  sub: string;
  jti: string;
  nameid: string;
  name?: string;
  username?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  public username?: string;

  constructor(private client: ApiClient) {}

  login(email: string, password: string): Observable<TokenResponse> {
    return this.client.login({ email, password } as LoginRequestDto).pipe(
      tap((response: TokenResponse) => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);

          const decoded = jwtDecode<TokenPayload>(response.token);
          this.username = decoded.name ?? decoded.username;
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  get token(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      this.username = decoded.username;
    }

    return localStorage.getItem(this.TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }
}
