import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Imports do Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
// serviço de autenticação
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, // Necessário para usar a diretiva *ngIf no template
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  form!: FormGroup;
  loginError: string | null = null; // Propriedade para guardar a mensagem de erro

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Injete o serviço de autenticação
  ) { }

  ngOnInit(): void {
    this.validaForm();
  }

  validaForm(): void {
    // O formulário usa 'email' e 'password' para ser compatível com o backend Laravel
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  enviaForm(): void {
    this.loginError = null; // Limpa erros de tentativas anteriores

    // Verifica se o formulário é inválido antes de enviar
    if (this.form.invalid) {
      this.loginError = 'Por favor, preencha o e-mail e a senha corretamente.';
      return;
    }

    // Chama o método 'login' do serviço, passando os dados do formulário
    this.authService.login(this.form.value).subscribe({
      // Função executada em caso de SUCESSO
      next: (response) => {
        console.log('Login bem-sucedido!', response);
        // Guarda o token recebido do backend no localStorage
        localStorage.setItem('authToken', response.token);
        // Navega para a página principal da aplicação
        this.router.navigate(['/home']);
      },
      // Função executada em caso de ERRO
      error: (err) => {
        console.error('Erro no login:', err);
        // Extrai a mensagem de erro específica enviada pelo Laravel
        if (err.error && err.error.email) {
          this.loginError = err.error.email[0];
        } else {
          this.loginError = 'Credenciais inválidas. Tente novamente.';
        }
      }
    });
  }
}

