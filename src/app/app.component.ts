import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

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

  constructor(public auth: AuthService) { }

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  closeSidebar() {
    if (this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
  }
}
