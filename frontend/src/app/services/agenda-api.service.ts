import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento, Cliente, Usuario, Servico } from '../models/models';
import { environment } from '../../environments/environment'; // import do environment

@Injectable({
    providedIn: 'root'
})
export class AgendaApiService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    // Cria headers com token de autenticação
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    // Listar agendamentos
    listar(): Observable<Agendamento[]> {
        return this.http.get<Agendamento[]>(`${this.baseUrl}/agendamentos`, {
            headers: this.getAuthHeaders()
        });
    }

    //  Criar novo agendamento
    criar(payload: Partial<Agendamento>): Observable<Agendamento> {
        return this.http.post<Agendamento>(`${this.baseUrl}/agendamentos`, payload, {
            headers: this.getAuthHeaders()
        });
    }

    //  Atualizar agendamento existente
    atualizar(id: number, agendamento: Partial<Agendamento>): Observable<Agendamento> {
        return this.http.put<Agendamento>(`${this.baseUrl}/agendamentos/${id}`, agendamento, {
            headers: this.getAuthHeaders()
        });
    }

    // Excluir agendamento (remove definitivamente)
    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/agendamentos/${id}`, {
            headers: this.getAuthHeaders()
        });
    }

    // Cancelar agendamento (caso o backend apenas mude status)
    cancelar(id: number): Observable<void> {
        //  Caso o backend delete, mantenha DELETE
        // return this.http.delete<void>(`${this.baseUrl}/agendamentos/${id}`, { headers: this.getAuthHeaders() });

        //  Caso o backend apenas atualize o status:
        return this.http.patch<void>(`${this.baseUrl}/agendamentos/${id}/cancelar`, {}, {
            headers: this.getAuthHeaders()
        });
    }

    // Listar clientes
    listarClientes(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.baseUrl}/clientes`, {
            headers: this.getAuthHeaders()
        });
    }

    //  Listar profissionais
    listarProfissionais(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(`${this.baseUrl}/profissionais`, {
            headers: this.getAuthHeaders()
        });
    }

    //  Listar serviços
    listarServicos(): Observable<Servico[]> {
        return this.http.get<Servico[]>(`${this.baseUrl}/servicos`, {
            headers: this.getAuthHeaders()
        });
    }
}
