import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('authToken');

    if (token) {
      return true; // usuário logado → permite entrar
    }

    // sem token → bloqueia e redireciona
    this.router.navigate(['/']);
    return false;
  }
}
