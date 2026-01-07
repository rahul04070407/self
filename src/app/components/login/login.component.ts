import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  onSubmit() {
    if (this.auth.login(this.username, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid credentials. Please use rahul / 321@rahul';
    }
  }
}
