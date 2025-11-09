import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent) },
    { path: 'home', loadComponent: () => import('./components/home/home.component').then(c => c.HomeComponent) },
    { path: 'agenda', loadComponent: () => import('./components/agenda/agenda.component').then(c => c.AgendaComponent) },
    { path: 'financeiro', loadComponent: () => import('./components/financeiro/financeiro.component').then(c => c.FinanceiroComponent) },
    { path: 'clientes', loadComponent: () => import('./components/clientes/clientes.component').then(c => c.ClientesComponent) },
    { path: '**', redirectTo: '' }
];
