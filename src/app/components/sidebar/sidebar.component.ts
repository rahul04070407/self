import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(
    public auth: AuthService,
    private toastr: ToastrService
  ) { }

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
