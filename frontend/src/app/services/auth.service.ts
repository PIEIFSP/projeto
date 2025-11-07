import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define uma interface para a resposta de sucesso do login
export interface AuthResponse {
  message: string;
  // Ajustado para 'token', conforme a resposta do backend
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  /**
   * Envia as credenciais para a API fazer o login.
   * @param credentials Objeto com 'email' e 'password'.
   * @returns Um Observable com a resposta da API.
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    // Faz a chamada POST para o endpoint /login do seu backend
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }
}
