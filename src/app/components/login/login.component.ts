import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  onSubmit() {
    if (this.auth.login(this.username, this.password)) {
      this.toastr.success('Welcome back, Rahul!', 'Login Successful');
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid credentials. Please use rahul / 321@rahul';
      this.toastr.error('Please check your credentials', 'Login Failed');
    }
  }
}
