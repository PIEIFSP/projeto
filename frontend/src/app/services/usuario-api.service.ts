import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/models';


import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioApiService {

  //  Constrói a URL base da API a partir do ficheiro de ambiente
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }


   // Obtém a lista de todos os usuários.

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }


  //  Cria um novo usuário.

  createUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }


  //  Atualiza um usuário existente.

  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }


   //   Remove um usuário.

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
