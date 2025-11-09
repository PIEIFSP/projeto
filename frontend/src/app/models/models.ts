export interface Professional {
    id: number;
    nome: string;
    cargo?: string;
    foto?: string;
}

export interface Client {
    id: number;
    nome: string;
    telefone?: string;
    email?: string;
}

export interface Service {
    id: number;
    nome: string;
    valor?: number;
    duracao_minutos?: number;
    professional_id?: number | null;
}

export type AppointmentStatus = 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO';

export interface Appointment {
    id: number;
    client_id: number;
    professional_id: number;
    service_id: number;
    start_at: string; // ISO
    end_at: string;   // ISO
    status: AppointmentStatus;
    observacoes?: string;
    client?: Client;
    professional?: Professional;
    service?: Service;
}
