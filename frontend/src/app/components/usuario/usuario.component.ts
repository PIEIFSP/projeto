// 1. Importa o 'CommonModule' e o serviço
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';


import { Usuario } from '../../models/models';
import { UsuarioApiService } from '../../services/usuario-api.service';
import { BarraLateralComponent } from '../shared/barra-lateral/barra-lateral.component';

@Component({
  selector: 'app-usuario',
  imports: [
    CommonModule,
    MatTableModule,
    BarraLateralComponent,
    MatToolbarModule
  ],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit {

  usuarios: Usuario[] = [];
  displayedColumns = ['nome', 'telefone', 'email', 'perfil'];

  constructor(
    private usuarioApiService: UsuarioApiService
  ) { }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.usuarioApiService.getUsuarios().subscribe({
      next: (data) => {

        this.usuarios = data;
        console.log('Dados carregados:', this.usuarios);
      },
      error: (err) => {
        console.error('Erro ao buscar usuários:', err);
      }
    });
  }
}
