import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
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
        if (!token) return new HttpHeaders();
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
        console.log('Atualizando agendamento. ID:', id, 'Dados:', agendamento);
        return this.http.put<Agendamento>(`${this.baseUrl}/agendamentos/${id}`, agendamento, {
            headers: this.getAuthHeaders()
        }).pipe(
            tap(response => {
                console.log('Resposta da atualização:', response);
            }),
            catchError(err => {
                console.error('Erro na atualização do agendamento:', err);
                return throwError(err);
            })
        );
    }

    // Excluir agendamento (remove definitivamente)
    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/agendamentos/${id}`, {
            headers: this.getAuthHeaders()
        });
    }

    // Cancelar agendamento 
    cancelar(id: number): Observable<void> {
        // backend espera POST para cancelar
        return this.http.post<void>(`${this.baseUrl}/agendamentos/${id}/cancelar`, {}, {
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

    //  Criar novo cliente
    criarCliente(payload: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/clientes`, payload, {
        headers: this.getAuthHeaders()
    });
}

}
