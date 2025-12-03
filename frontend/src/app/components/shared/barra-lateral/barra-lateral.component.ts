import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './barra-lateral.component.html',
  styleUrl: './barra-lateral.component.css'
})
export class BarraLateralComponent {
sidebarOpen = false;

constructor(
    private router: Router,
    private authService: AuthService
  ) {}


 toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    
    this.authService.logout();


    this.router.navigate(['/login']);
  }
}
