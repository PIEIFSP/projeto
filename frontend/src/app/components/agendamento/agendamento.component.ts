import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaApiService } from '../../services/agenda-api.service';
import { Appointment } from '../../models/models';
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

  appointments: Appointment[] = [];

  clientList: { id: number; nome: string; telefone?: string }[] = [];
  professionalList: { id: number; nome: string }[] = [];
  serviceList: { id: number; nome: string }[] = [];

  selectedAppointment: any = null;

  novoAppointmentForm = {
    clientNome: '',
    professionalNome: '',
    serviceNome: '',
    start_at: '',
    end_at: '',
    status: 'AGENDADO',
    observacoes: ''
  };

  filteredClients: { id: number; nome: string; telefone?: string }[] = [];
  filteredProfessionals: { id: number; nome: string }[] = [];
  filteredServices: { id: number; nome: string }[] = [];

  showClientDropdown = false;
  showProfessionalDropdown = false;
  showServiceDropdown = false;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    selectable: true,
    locale: ptBr,
    locales: [ptBr],
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
    displayEventTime: false, // <- garante que o FullCalendar NÃO desenhe a hora automaticamente
    dateClick: (info) => this.abrirModalNovo(info.dateStr),
    eventClick: (info) => this.abrirModalVisualizar(info.event),
    events: []
  };

  ngOnInit(): void {
    this.loadAllOnce();
  }

   // carrega appointments + listas em paralelo e atualiza o calendário apenas uma vez
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

        // Inicializa filtros do autocomplete
        this.filteredClients = this.clientList.slice();
        this.filteredProfessionals = this.professionalList.slice();
        this.filteredServices = this.serviceList.slice();

        // Atualiza eventos do calendário uma única vez
        this.atualizarEventosCalendario();
      },
      error: (err) => {
        console.error('Erro ao carregar dados iniciais:', err);
        // fallback: tenta carregar separadamente se necessário
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
      const client = this.clientList.find(c => c.id === a.client_id);
      const service = this.serviceList.find(s => s.id === a.service_id);

      // formata hora como "10h30"
      const startDate = new Date(a.start_at);
      const hrs = startDate.getHours();
      const mins = String(startDate.getMinutes()).padStart(2, '0');
      const timeLabel = `${hrs}h${mins}`;

      return {
        id: String(a.id),
        title: `${timeLabel} — ${client?.nome || 'Cliente'} - ${service?.nome || 'Serviço'}`,
        start: a.start_at,
        end: a.end_at,
        extendedProps: a
      };
    });
  }
  
  abrirModalNovo(date: string): void {
    this.novoAppointmentForm.start_at = date;
    this.modalAgendamento.nativeElement.showModal();
  }

  fecharModal(): void {
    this.modalAgendamento.nativeElement.close();
  }

  abrirModalVisualizar(event: any): void {
    const data = event.extendedProps;
    const client = this.clientList.find(c => c.id === data.client_id);
    const professional = this.professionalList.find(p => p.id === data.professional_id);
    const service = this.serviceList.find(s => s.id === data.service_id);

    this.selectedAppointment = {
      id: data.id,
      cliente: client?.nome || 'N/A',
      profissional: professional?.nome || 'N/A',
      servico: service?.nome || 'N/A',
      inicio: new Date(data.start_at).toLocaleString('pt-BR'),
      fim: new Date(data.end_at).toLocaleString('pt-BR'),
      status: data.status,
      observacoes: data.observacoes || 'Sem observações'
    };

    this.modalVisualizar.nativeElement.showModal();
  }

  fecharModalVisualizar(): void {
    this.modalVisualizar.nativeElement.close();
    this.selectedAppointment = null;
  }

  salvarAppointment(): void {
    const clientNome = (this.novoAppointmentForm.clientNome || '').toLowerCase().trim();
    const profNome = (this.novoAppointmentForm.professionalNome || '').toLowerCase().trim();
    const servNome = (this.novoAppointmentForm.serviceNome || '').toLowerCase().trim();

    const client = this.clientList.find(c => c.nome.toLowerCase().trim() === clientNome);
    const professional = this.professionalList.find(p => p.nome.toLowerCase().trim() === profNome);
    const service = this.serviceList.find(s => s.nome.toLowerCase().trim() === servNome);

    if (!client || !professional || !service) {
      console.error('Cliente, profissional ou serviço não encontrado.');
      return;
    }

    const start = new Date(this.novoAppointmentForm.start_at).toISOString();
    const end = new Date(this.novoAppointmentForm.end_at).toISOString();

    const payload = {
      client_id: client.id,
      professional_id: professional.id,
      service_id: service.id,
      start_at: start,
      end_at: end,
      status: this.novoAppointmentForm.status,
      observacoes: this.novoAppointmentForm.observacoes || undefined
    };

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

  // 🔴 NOVA FUNÇÃO: Cancelar agendamento
  cancelarAppointment(): void {
    if (!this.selectedAppointment?.id) return;

    const confirmacao = confirm('Tem certeza que deseja cancelar este agendamento?');
    if (!confirmacao) return;

    this.api.cancelar(this.selectedAppointment.id).subscribe({
      next: () => {
        console.log(`Agendamento ${this.selectedAppointment.id} cancelado com sucesso.`);
        // Atualiza localmente:
        const index = this.appointments.findIndex(a => a.id === this.selectedAppointment.id);
        if (index !== -1) {
          this.appointments[index].status = 'CANCELADO';
        }
        this.atualizarEventosCalendario();
        this.fecharModalVisualizar();
      },
      error: (err) => console.error('Erro ao cancelar agendamento:', err)
    });
  }

  resetForm(): void {
    this.novoAppointmentForm = {
      clientNome: '',
      professionalNome: '',
      serviceNome: '',
      start_at: '',
      end_at: '',
      status: 'AGENDADO',
      observacoes: ''
    };
  }

  // AUTOCOMPLETE CLIENTES / PROFISSIONAIS / SERVIÇOS

  focusClients(): void {
    this.filteredClients = this.clientList.slice();
    this.showClientDropdown = this.filteredClients.length > 0;
  }
  filterClients(): void {
    const q = (this.novoAppointmentForm.clientNome || '').toLowerCase().trim();
    this.filteredClients = q ? this.clientList.filter(c => c.nome.toLowerCase().includes(q)) : this.clientList.slice();
    this.showClientDropdown = this.filteredClients.length > 0;
  }
  selectClient(c: { id: number; nome: string; telefone?: string }): void {
    this.novoAppointmentForm.clientNome = c.nome;
    this.showClientDropdown = false;
  }
  hideClientDropdown(): void {
    setTimeout(() => (this.showClientDropdown = false), 150);
  }

  focusProfessionals(): void {
    this.filteredProfessionals = this.professionalList.slice();
    this.showProfessionalDropdown = this.filteredProfessionals.length > 0;
  }
  filterProfessionals(): void {
    const q = (this.novoAppointmentForm.professionalNome || '').toLowerCase().trim();
    this.filteredProfessionals = q ? this.professionalList.filter(p => p.nome.toLowerCase().includes(q)) : this.professionalList.slice();
    this.showProfessionalDropdown = this.filteredProfessionals.length > 0;
  }
  selectProfessional(p: { id: number; nome: string }): void {
    this.novoAppointmentForm.professionalNome = p.nome;
    this.showProfessionalDropdown = false;
  }
  hideProfessionalDropdown(): void {
    setTimeout(() => (this.showProfessionalDropdown = false), 150);
  }

  focusServices(): void {
    this.filteredServices = this.serviceList.slice();
    this.showServiceDropdown = this.filteredServices.length > 0;
  }
  filterServices(): void {
    const q = (this.novoAppointmentForm.serviceNome || '').toLowerCase().trim();
    this.filteredServices = q ? this.serviceList.filter(s => s.nome.toLowerCase().includes(q)) : this.serviceList.slice();
    this.showServiceDropdown = this.filteredServices.length > 0;
  }
  selectService(s: { id: number; nome: string }): void {
    this.novoAppointmentForm.serviceNome = s.nome;
    this.showServiceDropdown = false;
  }
  hideServiceDropdown(): void {
    setTimeout(() => (this.showServiceDropdown = false), 150);
  }
}