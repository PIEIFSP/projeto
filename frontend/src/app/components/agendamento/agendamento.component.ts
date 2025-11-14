import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaApiService } from '../../services/agenda-api.service';
import { Agendamento, Cliente, Servico, Usuario, AppointmentStatus } from '../../models/models';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBr from '@fullcalendar/core/locales/pt-br';
import { BarraLateralComponent } from '../shared/barra-lateral/barra-lateral.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, BarraLateralComponent],
  templateUrl: './agendamento.component.html',
  styleUrls: ['./agendamento.component.css']
})
export class AgendamentoComponent implements OnInit {
  private api = inject(AgendaApiService);

  @ViewChild('modalAgendamento') modalAgendamento!: ElementRef<HTMLDialogElement>;
  @ViewChild('modalVisualizar') modalVisualizar!: ElementRef<HTMLDialogElement>;

  appointments: Agendamento[] = [];

  clientList: Cliente[] = [];
  professionalList: Usuario[] = [];
  serviceList: Servico[] = [];

  selectedAppointment: any = null;
  selectedAppointmentRaw: Agendamento | null = null;

  novoAppointmentForm = {
    id_cliente: null as number | null,
    clienteNome: '',
    id_usuario: null as number | null,
    usuarioNome: '',
    id_servico: null as number | null,
    servicoNome: '',
    data_hora_inicio: '',
    data_hora_fim: '',
    status: 'AGENDADO' as AppointmentStatus,
    observacoes: ''
  };

  filteredClients: Cliente[] = [];
  filteredProfessionals: Usuario[] = [];
  filteredServices: Servico[] = [];

  showClientDropdown = false;
  showProfessionalDropdown = false;
  showServiceDropdown = false;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    selectable: true,
    locale: ptBr,
    firstDay: 1,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia'
    },
    displayEventTime: false,
    dateClick: (info) => this.abrirModalNovo(info.dateStr),
    eventClick: (info) => this.abrirModalVisualizar(info.event),
    events: []
  };

  ngOnInit(): void {
    this.loadAllOnce();
  }

  // 🔹 Carrega todos os dados em paralelo
  loadAllOnce(): void {
    forkJoin({
      appointments: this.api.listar(),
      clients: this.api.listarClientes(),
      professionals: this.api.listarProfissionais(),
      services: this.api.listarServicos()
    }).subscribe({
      next: ({ appointments, clients, professionals, services }) => {
        this.appointments = appointments;
        this.clientList = clients;
        this.professionalList = professionals;
        this.serviceList = services;

        this.filteredClients = this.clientList.slice();
        this.filteredProfessionals = this.professionalList.slice();
        this.filteredServices = this.serviceList.slice();

        this.atualizarEventosCalendario();
      },
      error: (err) => {
        console.error('Erro ao carregar dados iniciais:', err);
        this.carregarListasReferencia();
        this.carregarAppointments();
      }
    });
  }

  carregarAppointments(): void {
    this.api.listar().subscribe({
      next: (dados) => {
        this.appointments = dados;
        this.atualizarEventosCalendario();
      },
      error: (err) => console.error('Erro ao carregar agendamentos:', err)
    });
  }

  carregarListasReferencia(): void {
    this.api.listarClientes().subscribe({
      next: (dados) => {
        this.clientList = dados;
        this.filteredClients = this.clientList.slice();
      },
      error: (err) => console.error('Erro ao carregar clientes:', err)
    });

    this.api.listarProfissionais().subscribe({
      next: (dados) => {
        this.professionalList = dados;
        this.filteredProfessionals = this.professionalList.slice();
      },
      error: (err) => console.error('Erro ao carregar profissionais:', err)
    });

    this.api.listarServicos().subscribe({
      next: (dados) => {
        this.serviceList = dados;
        this.filteredServices = this.serviceList.slice();
      },
      error: (err) => console.error('Erro ao carregar serviços:', err)
    });
  }

  atualizarEventosCalendario(): void {
    this.calendarOptions.events = this.appointments.map(a => {
      const client = this.clientList.find(c => c.id_cliente === a.id_cliente);
      const service = this.serviceList.find(s => s.id_servico === a.id_servico);

      const startDate = new Date(a.data_hora_inicio);
      const hrs = startDate.getHours();
      const mins = String(startDate.getMinutes()).padStart(2, '0');
      const timeLabel = `${hrs}h${mins}`;

      return {
        id: String(a.id_agendamento),
        title: `${timeLabel} — ${client?.nome || 'Cliente'} - ${service?.nome || 'Serviço'}`,
        start: a.data_hora_inicio,
        end: a.data_hora_fim,
        extendedProps: a
      };
    });
  }

  abrirModalNovo(date: string): void {
    this.novoAppointmentForm.data_hora_inicio = date;
    this.modalAgendamento.nativeElement.showModal();
  }

  fecharModal(): void {
    this.modalAgendamento.nativeElement.close();
  }

  abrirModalVisualizar(event: any): void {
    const data = event.extendedProps;
    // guarda o objeto bruto para operações (cancelar, reagendar)
    this.selectedAppointmentRaw = data as Agendamento;

    const client = this.clientList.find(c => c.id_cliente === data.id_cliente);
    const professional = this.professionalList.find(p => p.id_usuario === data.id_usuario);
    const service = this.serviceList.find(s => s.id_servico === data.id_servico);

    this.selectedAppointment = {
      id_agendamento: data.id_agendamento,
      cliente: client?.nome || 'N/A',
      profissional: professional?.nome || 'N/A',
      servico: service?.nome || 'N/A',
      inicio: new Date(data.data_hora_inicio).toLocaleString('pt-BR'),
      fim: new Date(data.data_hora_fim).toLocaleString('pt-BR'),
      status: data.status,
      observacoes: data.observacoes || 'Sem observações'
    };

    this.modalVisualizar.nativeElement.showModal();
  }

  fecharModalVisualizar(): void {
    this.modalVisualizar.nativeElement.close();
    this.selectedAppointment = null;
    this.selectedAppointmentRaw = null;
  }

  reagendarAppointment(): void {
    if (!this.selectedAppointmentRaw) return;

    const raw = this.selectedAppointmentRaw;

    // preenche o form com dados do agendamento selecionado
    this.novoAppointmentForm = {
      id_cliente: raw.id_cliente,
      clienteNome: this.clientList.find(c => c.id_cliente === raw.id_cliente)?.nome || '',
      id_usuario: raw.id_usuario,
      usuarioNome: this.professionalList.find(p => p.id_usuario === raw.id_usuario)?.nome || '',
      id_servico: raw.id_servico,
      servicoNome: this.serviceList.find(s => s.id_servico === raw.id_servico)?.nome || '',
      data_hora_inicio: raw.data_hora_inicio,
      data_hora_fim: raw.data_hora_fim,
      status: raw.status,
      observacoes: raw.observacoes || ''
    };

    // fecha o modal de visualização e abre o de edição
    this.fecharModalVisualizar();
    this.modalAgendamento.nativeElement.showModal();
  }


  salvarAppointment(): void {
    // se há agendamento selecionado, está editando (reagendando)
    const isEdicao = !!this.selectedAppointmentRaw;
    const agendamentoId = this.selectedAppointmentRaw?.id_agendamento;    


    const client = this.clientList.find(c => c.id_cliente === this.novoAppointmentForm.id_cliente)
      ?? this.clientList.find(c => c.nome.toLowerCase().trim() === (this.novoAppointmentForm.clienteNome || '').toLowerCase().trim());
    const professional = this.professionalList.find(p => p.id_usuario === this.novoAppointmentForm.id_usuario)
      ?? this.professionalList.find(p => p.nome.toLowerCase().trim() === (this.novoAppointmentForm.usuarioNome || '').toLowerCase().trim());
    const service = this.serviceList.find(s => s.id_servico === this.novoAppointmentForm.id_servico)
      ?? this.serviceList.find(s => s.nome.toLowerCase().trim() === (this.novoAppointmentForm.servicoNome || '').toLowerCase().trim());

    if (!client || !professional || !service) {
      console.error('Cliente, profissional ou serviço não encontrado.');
      return;
    }

    const start = new Date(this.novoAppointmentForm.data_hora_inicio).toISOString();
    const end = new Date(this.novoAppointmentForm.data_hora_fim).toISOString();

    const payload = {
      id_cliente: client.id_cliente,
      id_usuario: professional.id_usuario,
      id_servico: service.id_servico,
      data_hora_inicio: start,
      data_hora_fim: end,
      status: this.novoAppointmentForm.status,
      observacoes: this.novoAppointmentForm.observacoes || undefined
    };

    if (isEdicao && agendamentoId) {
      // atualizar agendamento existente
      this.api.atualizar(agendamentoId, payload).subscribe({
        next: (updated) => {
          // encontra e substitui na lista local
          const index = this.appointments.findIndex(a => a.id_agendamento === agendamentoId);
          if (index !== -1) {
            this.appointments[index] = updated;
          }
          this.atualizarEventosCalendario();
          this.fecharModal();
          this.resetForm();
        },
        error: (err) => console.error('Erro ao atualizar agendamento:', err)
      });
    } else {
     // criar novo agendamento
      this.api.criar(payload).subscribe({
        next: (novoAppointment) => {
          this.appointments.push(novoAppointment);
          this.atualizarEventosCalendario();
          this.fecharModal();
          this.resetForm();
        },
        error: (err) => console.error('Erro ao salvar:', err)
      });
    }
  }

  cancelarAppointment(): void {
    // tenta obter id de possíveis formatos (objeto bruto ou formatado)
    const id = (this as any).selectedAppointmentRaw?.id_agendamento
      ?? this.selectedAppointment?.id_agendamento
      ?? this.selectedAppointment?.id;
    if (!id) return;

    const confirmacao = confirm('Tem certeza que deseja cancelar este agendamento?');
    if (!confirmacao) return;

    this.api.cancelar(id).subscribe({
      next: () => {
        // remove do array local para sumir do calendário
        this.appointments = this.appointments.filter(a => a.id_agendamento !== id);
        this.atualizarEventosCalendario();
        this.fecharModalVisualizar();
      },
      error: (err) => console.error('Erro ao cancelar agendamento:', err)
    });
  }

  resetForm(): void {
    this.novoAppointmentForm = {
      id_cliente: null,
      clienteNome: '',
      id_usuario: null,
      usuarioNome: '',
      id_servico: null,
      servicoNome: '',
      data_hora_inicio: '',
      data_hora_fim: '',
      status: 'AGENDADO' as AppointmentStatus,
      observacoes: ''
    };
    this.selectedAppointmentRaw = null;
  }

  // 🔹 AUTOCOMPLETE
  focusClients(): void {
    this.filteredClients = this.clientList.slice();
    this.showClientDropdown = true;
  }

  filterClients(): void {
    const q = this.novoAppointmentForm.clienteNome.toLowerCase().trim();
    this.filteredClients = q
      ? this.clientList.filter(c => c.nome.toLowerCase().includes(q))
      : this.clientList.slice();
    this.showClientDropdown = true;
  }

  selectClient(c: Cliente): void {
    this.novoAppointmentForm.clienteNome = c.nome;
    this.showClientDropdown = false;
  }

  hideClientDropdown(): void {
    setTimeout(() => (this.showClientDropdown = false), 150);
  }

  focusProfessionals(): void {
    this.filteredProfessionals = this.professionalList.slice();
    this.showProfessionalDropdown = true;
  }

  filterProfessionals(): void {
    const q = this.novoAppointmentForm.usuarioNome.toLowerCase().trim();
    this.filteredProfessionals = q
      ? this.professionalList.filter(p => p.nome.toLowerCase().includes(q))
      : this.professionalList.slice();
    this.showProfessionalDropdown = true;
  }

  selectProfessional(p: Usuario): void {
    this.novoAppointmentForm.usuarioNome = p.nome;
    this.showProfessionalDropdown = false;
  }

  hideProfessionalDropdown(): void {
    setTimeout(() => (this.showProfessionalDropdown = false), 150);
  }

  focusServices(): void {
    this.filteredServices = this.serviceList.slice();
    this.showServiceDropdown = true;
  }

  filterServices(): void {
    const q = this.novoAppointmentForm.servicoNome.toLowerCase().trim();
    this.filteredServices = q
      ? this.serviceList.filter(s => s.nome.toLowerCase().includes(q))
      : this.serviceList.slice();
    this.showServiceDropdown = true;
  }

  selectService(s: Servico): void {
    this.novoAppointmentForm.servicoNome = s.nome;
    this.showServiceDropdown = false;
  }

  hideServiceDropdown(): void {
    setTimeout(() => (this.showServiceDropdown = false), 150);
  }
}
