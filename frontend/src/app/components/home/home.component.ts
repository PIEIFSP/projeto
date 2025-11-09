import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../shared/barra-lateral/barra-lateral.component';
// import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CommonModule, BarraLateralComponent ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // sidebarOpen = false;

  // Dados fictícios do dashboard
  dadosSemana = { procedimentos: 18 };
  dadosMes = { procedimentos: 76, valor: 11240 };

  procedimentosHoje = [
    { horario: '09:00', cliente: 'Ana Souza', servico: 'Manicure' },
    { horario: '10:30', cliente: 'Bruna Lima', servico: 'Design de sobrancelha' },
    { horario: '14:00', cliente: 'Camila Torres', servico: 'Alongamento de cílios' }
  ];

  // toggleSidebar() {
  //   this.sidebarOpen = !this.sidebarOpen;
  // }
}
