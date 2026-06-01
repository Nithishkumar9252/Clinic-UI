import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  environment
} from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class LoginComponent {

  username: string = '';

  password: string = '';

  /* ADD THIS */

  showPassword: boolean = false;

  togglePassword() {

    this.showPassword = !this.showPassword;
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login() {

    if (!this.username || !this.password) {

      alert('Please fill all required fields');

      return;
    }

    console.log('LOGIN FUNCTION CALLED');

    const payload = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>(
      `${environment.apiUrl}/api/auth/login`,
      payload
    ).subscribe({

      next: (response) => {

  localStorage.setItem(
    'token',
    response.token
  );

  /* SAVE FULL NAME */

  localStorage.setItem(
  'fullName',
  response.fullName
    ? response.fullName
    : this.username
);

  /* OPTIONAL PROFILE IMAGE */

  localStorage.setItem(
    'profileImage',
    response.profileImage || ''
  );

  this.router.navigate([
    '/dashboard'
  ]);
},

      error: () => {

        alert('Invalid Username or Password');
      }
    });
  }
}