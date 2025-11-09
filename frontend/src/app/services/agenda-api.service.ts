import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/models';
import { environment } from '../../environments/environment'; // <-- import do environment

@Injectable({
    providedIn: 'root'
})
export class AgendaApiService {
    private http = inject(HttpClient);

    // Base URL configurável conforme o environment
    private baseUrl = environment.apiUrl;

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    // Listar agendamentos
    listar(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.baseUrl}/agendamentos`, { headers: this.getAuthHeaders() });
    }

    // Criar agendamento
    criar(appointmentPayload: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/agendamentos`, appointmentPayload, { headers: this.getAuthHeaders() });
    }

    // Atualizar agendamento
    atualizar(id: number, appointment: Appointment): Observable<Appointment> {
        return this.http.put<Appointment>(`${this.baseUrl}/agendamentos/${id}`, appointment, { headers: this.getAuthHeaders() });
    }

    // Excluir agendamento
    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/agendamentos/${id}`, { headers: this.getAuthHeaders() });
    }

    cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/agendamentos/${id}`, { headers: this.getAuthHeaders() });
    } 
    
    // Listar clientes
    listarClientes(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/clientes`, { headers: this.getAuthHeaders() });
    }

    // Listar profissionais
    listarProfissionais(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/profissionais`, { headers: this.getAuthHeaders() });
    }

    // Listar serviços
    listarServicos(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/servicos`, { headers: this.getAuthHeaders() });
    }
}
