export type NivelAcesso = 'ADMIN' | 'PADRAO';
export interface Usuario {
    id_usuario: number;
    nome: string;
    telefone:string;
    email: string;
    perfil: NivelAcesso;
}

export interface Cliente {
    id_cliente: number;
    nome: string;
    telefone?: string;
}

export interface Servico {
    id_servico: number;
    nome: string;
    valor?: number;
    duracao_minutos?: number;
    id_usuario?: number | null;
}

export type AppointmentStatus = 'REAGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';

export interface Agendamento {
    id_agendamento: number;
    id_cliente: number;
    id_usuario: number;
    id_servico: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    status: AppointmentStatus;
    observacoes?: string;
    cliente?: Cliente;
    usuario?: Usuario;
    servico?: Servico;
}
