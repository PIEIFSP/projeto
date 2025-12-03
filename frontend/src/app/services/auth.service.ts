import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  message: string;
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;


  public static readonly tokenKey = 'authToken';

  constructor(private http: HttpClient) { }

  /**
   * Login
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  /**
   * Logout
   */
  logout(): void {
   
    const token = localStorage.getItem(AuthService.tokenKey);

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.post(`${this.apiUrl}/logout`, {}, { headers }).subscribe({
        next: () => console.log('Logout efetuado na API.'),
        error: (err) => console.error('Erro no logout da API', err)
      });
    }

    // Limpeza local
    localStorage.removeItem(AuthService.tokenKey);
  }
}
