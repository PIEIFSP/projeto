import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent) },
  { path: 'home', canActivate: [AuthGuard], loadComponent: () => import('./components/home/home.component').then(c => c.HomeComponent) },
  { path: 'agenda', canActivate: [AuthGuard], loadComponent: () => import('./components/agendamento/agendamento.component').then(c => c.AgendamentoComponent) },
  { path: 'financeiro', canActivate: [AuthGuard], loadComponent: () => import('./components/financeiro/financeiro.component').then(c => c.FinanceiroComponent) },
  { path: 'clientes', canActivate: [AuthGuard], loadComponent: () => import('./components/clientes/clientes.component').then(c => c.ClientesComponent) },
  { path: 'usuario', canActivate: [AuthGuard], loadComponent: () => import('./components/usuario/usuario.component').then(c => c.UsuarioComponent) },
  { path: '**', redirectTo: '' }
];
