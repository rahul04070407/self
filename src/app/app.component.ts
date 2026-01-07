import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SidebarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FinFlow';
  isSidebarOpen = signal(false);

  constructor(
    public auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  closeSidebar() {
    if (this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
  }

  async logout() {
    const result = await Swal.fire({
      title: 'Exit FinFlow?',
      text: "You will need to login again to access your data.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, logout',
      background: '#1e293b',
      color: '#f8fafc'
    });

    if (result.isConfirmed) {
      this.auth.logout();
      this.toastr.info('Signed out safely', 'Goodbye!');
    }
  }
}
