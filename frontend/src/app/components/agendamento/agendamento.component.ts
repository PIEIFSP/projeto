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
import { FullCalendarComponent } from '@fullcalendar/angular';

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
  @ViewChild(FullCalendarComponent) calendarComponent!: FullCalendarComponent;

  appointments: Agendamento[] = [];

  clientList: Cliente[] = [];
  professionalList: Usuario[] = [];
  serviceList: Servico[] = [];

  selectedAppointment: any = null;
  selectedAppointmentRaw: Agendamento | null = null;

  // Form do agendamento
  novoAppointmentForm = {
    id_cliente: null as number | null,
    clienteNome: '',
    clienteTelefone: '',
    wantsRegisterClient: false,
    id_usuario: null as number | null,
    usuarioNome: '',
    id_servico: null as number | null,
    servicoNome: '',
    data_hora_inicio: '',
    data_hora_fim: '',
    status: 'CONFIRMADO' as AppointmentStatus,
    observacoes: ''
  };

  filteredClients: Cliente[] = [];
  filteredProfessionals: Usuario[] = [];
  filteredServices: Servico[] = [];

  showClientDropdown = false;
  showProfessionalDropdown = false;
  showServiceDropdown = false;

  // flag para exibir mensagem "Cliente não encontrado"
  showClientNotFound = false;

  // calendar config
calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  selectable: true,
  locale: ptBr,
  firstDay: 1,

  // mostra até 3 eventos por célula e exibe "+X mais"
  dayMaxEvents: 3,
  dayMaxEventRows: true,

  // permite o calendário preencher o container (com nosso CSS em 100%)
  height: '100%',
  expandRows: true,

  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek,dayGridDay'
  },

  displayEventTime: false,
  dateClick: (info) => this.abrirModalNovo(info.dateStr),
  eventClick: (info) => this.abrirModalVisualizar(info.event),
  events: []
};

  ngOnInit(): void {
    this.loadAllOnce();
  }

  
  // carrega tudo em paralelo
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
        // fallback para carregar separadamente
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
        extendedProps: a,
        backgroundColor: '#ef7ac1'// bolinha rosa
      };
    });
  }

  abrirModalNovo(date: string): void {
    this.resetForm();
    this.novoAppointmentForm.data_hora_inicio = date;
    this.modalAgendamento.nativeElement.showModal();
  }

  fecharModal(): void {
    this.modalAgendamento.nativeElement.close();
  }

  abrirModalVisualizar(event: any): void {
    const data = event.extendedProps;
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
  }

  // reagendar: preenche o form com os dados do agendamento selecionado
  reagendarAppointment(): void {
    if (!this.selectedAppointmentRaw) return;

    const raw = this.selectedAppointmentRaw;

    this.novoAppointmentForm = {
      id_cliente: raw.id_cliente,
      clienteNome: this.clientList.find(c => c.id_cliente === raw.id_cliente)?.nome || '',
      clienteTelefone: this.clientList.find(c => c.id_cliente === raw.id_cliente)?.telefone || '',
      wantsRegisterClient: false,
      id_usuario: raw.id_usuario,
      usuarioNome: this.professionalList.find(p => p.id_usuario === raw.id_usuario)?.nome || '',
      id_servico: raw.id_servico,
      servicoNome: this.serviceList.find(s => s.id_servico === raw.id_servico)?.nome || '',
      data_hora_inicio: raw.data_hora_inicio,
      data_hora_fim: raw.data_hora_fim,
      status: raw.status,
      observacoes: raw.observacoes || ''
    };

    this.fecharModalVisualizar();
    this.modalAgendamento.nativeElement.showModal();
  }

// SALVAR AGENDAMENTO (com lógica de criar cliente caso necessário)
salvarAppointment(): void {
  const isEdicao = !!this.selectedAppointmentRaw;
  const agendamentoId = this.selectedAppointmentRaw?.id_agendamento;

  // Se usuário marcou que quer cadastrar cliente novo
  if (this.novoAppointmentForm.wantsRegisterClient) {
    const nome = this.novoAppointmentForm.clienteNome?.trim();
    const telefone = this.novoAppointmentForm.clienteTelefone?.trim();

    if (!nome) {
      alert('Digite o nome do cliente.');
      return;
    }

    if (!telefone) {
      alert('Digite o telefone do cliente.');
      return;
    }

    // Envia POST para criar cliente no backend
    this.api.criarCliente({
      nome: nome,
      telefone: telefone
    }).subscribe({
      next: (novoCliente) => {
        // Após criar o cliente, salva o ID retornado no form
        this.novoAppointmentForm.id_cliente = novoCliente.id_cliente;

        // Adiciona na lista local para já aparecer na tela
        if (this.clientList) {
          this.clientList.push(novoCliente);
        }

        // Prossegue com a criação / edição do agendamento
        this.finalizarSalvarAppointment(isEdicao, agendamentoId);
      },
      error: (err) => {
        console.error('Erro ao criar cliente:', err);
        alert('Erro ao cadastrar cliente. Tente novamente.');
      }
    });

    return; // espera criação do cliente
  }

  // Se não for cadastrar cliente novo, segue normal
  this.finalizarSalvarAppointment(isEdicao, agendamentoId);
}

  // separa a lógica para reutilizar após criar cliente
  private finalizarSalvarAppointment(isEdicao: boolean, agendamentoId?: number): void {
    // tenta resolver cliente/profissional/serviço a partir do form
    const client = this.clientList.find(c => c.id_cliente === this.novoAppointmentForm.id_cliente)
      ?? this.clientList.find(c => c.nome.toLowerCase().trim() === (this.novoAppointmentForm.clienteNome || '').toLowerCase().trim());

    const professional = this.professionalList.find(p => p.id_usuario === this.novoAppointmentForm.id_usuario)
      ?? this.professionalList.find(p => p.nome.toLowerCase().trim() === (this.novoAppointmentForm.usuarioNome || '').toLowerCase().trim());

    const service = this.serviceList.find(s => s.id_servico === this.novoAppointmentForm.id_servico)
      ?? this.serviceList.find(s => s.nome.toLowerCase().trim() === (this.novoAppointmentForm.servicoNome || '').toLowerCase().trim());

    if (!client || !professional || !service) {
      alert('Cliente, profissional ou serviço inválido.');
      return;
    }

    const payload: Partial<Agendamento> = {
  id_cliente: client.id_cliente,
  id_usuario: professional.id_usuario,
  id_servico: service.id_servico,
  data_hora_inicio: this.toISOLocal(this.novoAppointmentForm.data_hora_inicio),
  data_hora_fim: this.toISOLocal(this.novoAppointmentForm.data_hora_fim),
  status: this.novoAppointmentForm.status,
  observacoes: this.novoAppointmentForm.observacoes || undefined
};

    if (isEdicao && agendamentoId) {
      this.api.atualizar(agendamentoId, payload).subscribe({
        next: (updated) => {
          const index = this.appointments.findIndex(a => a.id_agendamento === agendamentoId);
          if (index !== -1) this.appointments[index] = updated;
          this.atualizarEventosCalendario();
          this.refetchCalendarEvents();
          this.fecharModal();
          this.resetForm();
          this.selectedAppointmentRaw = null;
        },
        error: (err) => {
          console.error('Erro ao atualizar agendamento:', err);
          alert('Erro ao atualizar agendamento.');
        }
      });
    } else {
      this.api.criar(payload).subscribe({
        next: (novoAppointment) => {
          this.appointments.push(novoAppointment);
          this.atualizarEventosCalendario();
          this.refetchCalendarEvents();
          this.fecharModal();
          this.resetForm();
        },
        error: (err) => {
          console.error('Erro ao criar agendamento:', err);
          alert('Erro ao criar agendamento.');
        }
      });
    }
  }

  private refetchCalendarEvents(): void {
  const calendarApi = this.calendarComponent?.getApi();
  if (calendarApi) {
    calendarApi.refetchEvents();
  }
}

  // helper para converter datetime-local para ISO sem deslocamento
  private toISOLocal(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  cancelarAppointment(): void {
    const id = this.selectedAppointmentRaw?.id_agendamento
      ?? this.selectedAppointment?.id_agendamento;

    if (!id) return;

    const confirmacao = confirm('Tem certeza que deseja cancelar este agendamento?');
    if (!confirmacao) return;

    this.api.cancelar(id).subscribe({
      next: () => {
        this.appointments = this.appointments.filter(a => a.id_agendamento !== id);
        this.atualizarEventosCalendario();
        this.fecharModalVisualizar();
        this.selectedAppointmentRaw = null;
      },
      error: (err) => {
        console.error('Erro ao cancelar agendamento:', err);
        alert('Erro ao cancelar agendamento.');
      }
    });
  }

  resetForm(): void {
    this.novoAppointmentForm = {
      id_cliente: null,
      clienteNome: '',
      clienteTelefone: '',
      wantsRegisterClient: false,
      id_usuario: null,
      usuarioNome: '',
      id_servico: null,
      servicoNome: '',
      data_hora_inicio: '',
      data_hora_fim: '',
      status: 'CONFIRMADO' as AppointmentStatus,
      observacoes: ''
    };

    this.selectedAppointmentRaw = null;
    this.showClientNotFound = false;
    this.showClientDropdown = false;
    this.showProfessionalDropdown = false;
    this.showServiceDropdown = false;
  }

  // ===========================
  // AUTOCOMPLETE CLIENTES
  // ===========================
  focusClients(): void {
    this.filteredClients = this.clientList.slice();
    this.showClientDropdown = true;
  }

  filterClients(): void {
    const q = (this.novoAppointmentForm.clienteNome || '').toLowerCase().trim();
    this.filteredClients = q
      ? this.clientList.filter(c => c.nome.toLowerCase().includes(q))
      : this.clientList.slice();
    this.showClientDropdown = true;
    this.showClientNotFound = q.length > 0 && this.filteredClients.length === 0;
  }

  selectClient(c: Cliente): void {
    this.novoAppointmentForm.clienteNome = c.nome;
    this.novoAppointmentForm.id_cliente = c.id_cliente;
    this.novoAppointmentForm.clienteTelefone = c.telefone || '';
    this.showClientDropdown = false;
    this.showClientNotFound = false;
    this.novoAppointmentForm.wantsRegisterClient = false;
  }

  hideClientDropdown(): void {
    setTimeout(() => (this.showClientDropdown = false), 150);
  }

  // ===========================
  // AUTOCOMPLETE PROFISSIONAIS
  // ===========================
  focusProfessionals(): void {
    this.filteredProfessionals = this.professionalList.slice();
    this.showProfessionalDropdown = true;
  }

  filterProfessionals(): void {
    const q = (this.novoAppointmentForm.usuarioNome || '').toLowerCase().trim();
    this.filteredProfessionals = q
      ? this.professionalList.filter(p => p.nome.toLowerCase().includes(q))
      : this.professionalList.slice();
    this.showProfessionalDropdown = true;
  }

  selectProfessional(p: Usuario): void {
    this.novoAppointmentForm.usuarioNome = p.nome;
    this.novoAppointmentForm.id_usuario = p.id_usuario;
    this.showProfessionalDropdown = false;
  }

  hideProfessionalDropdown(): void {
    setTimeout(() => (this.showProfessionalDropdown = false), 150);
  }

  // ===========================
  // AUTOCOMPLETE SERVIÇOS
  // ===========================
  focusServices(): void {
    this.filteredServices = this.serviceList.slice();
    this.showServiceDropdown = true;
  }

  filterServices(): void {
    const q = (this.novoAppointmentForm.servicoNome || '').toLowerCase().trim();
    this.filteredServices = q
      ? this.serviceList.filter(s => s.nome.toLowerCase().includes(q))
      : this.serviceList.slice();
    this.showServiceDropdown = true;
  }

  selectService(s: Servico): void {
    this.novoAppointmentForm.servicoNome = s.nome;
    this.novoAppointmentForm.id_servico = s.id_servico;
    this.showServiceDropdown = false;
  }

  hideServiceDropdown(): void {
    setTimeout(() => (this.showServiceDropdown = false), 150);
  }

  // método chamado quando usuário clica "Sim" para cadastrar
  confirmarCadastroCliente(sim: boolean) {
    this.novoAppointmentForm.wantsRegisterClient = sim;
    if (!sim) {
      this.novoAppointmentForm.clienteTelefone = '';
    }
  }
}
