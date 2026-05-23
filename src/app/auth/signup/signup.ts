import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-signup',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './signup.html',

  styleUrl: './signup.css'
})

export class SignupComponent {

  fullName: string = '';

  username: string = '';

  email: string = '';

  phoneNumber: string = '';

  password: string = '';

  /* PASSWORD VISIBILITY */

  showPassword: boolean = false;

  togglePassword() {

    this.showPassword =
      !this.showPassword;
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  signup() {

    /* REQUIRED VALIDATIONS */

    if (
      !this.fullName ||
      !this.username ||
      !this.email ||
      !this.phoneNumber ||
      !this.password
    ) {

      alert(
        'Please fill all required fields'
      );

      return;
    }

    /* GMAIL VALIDATION */

    if (
      !this.email.endsWith('@gmail.com')
    ) {

      alert(
        'Only Gmail addresses are allowed'
      );

      return;
    }

    /* PHONE VALIDATION */

    if (
      this.phoneNumber.length !== 10 ||
      isNaN(Number(this.phoneNumber))
    ) {

      alert(
        'Enter valid 10-digit phone number'
      );

      return;
    }

    /* PASSWORD VALIDATION */

    if (
      this.password.length < 6
    ) {

      alert(
        'Password must contain at least 6 characters'
      );

      return;
    }

    const payload = {

      fullName: this.fullName,

      username: this.username,

      email: this.email,

      phoneNumber: this.phoneNumber,

      password: this.password
    };

    /* SIGNUP API */

    this.http.post(
      'http://localhost:8080/api/auth/signup',
      payload,
      {
        responseType: 'text'
      }
    ).subscribe({

      next: (response: any) => {

        console.log(response);

        /* USERNAME EXISTS */

        if (
          response === 'Username already exists'
        ) {

          alert(
            'Username already exists'
          );

          return;
        }

        /* EMAIL EXISTS */

        if (
          response === 'Email already exists'
        ) {

          alert(
            'Email already exists'
          );

          return;
        }

        /* SIGNUP SUCCESS */

        if (
          response === 'Signup successful'
        ) {

          /* AUTO LOGIN */

          this.http.post<any>(
            'http://localhost:8080/api/auth/login',
            {
              username: this.username,
              password: this.password
            }
          ).subscribe({

            next: (loginResponse) => {

              console.log(loginResponse);

              /* SSR SAFE */

              if (
                typeof window !== 'undefined'
              ) {

                /* SAVE TOKEN */

                localStorage.setItem(
                  'token',
                  loginResponse.token
                );

                /* SAVE FULL NAME */

                localStorage.setItem(
                  'fullName',
                  this.fullName
                );

                /* SAVE USERNAME */

                localStorage.setItem(
                  'username',
                  this.username
                );

                /* SAVE PROFILE IMAGE */

                localStorage.setItem(
                  'profileImage',
                  loginResponse.profileImage || ''
                );
              }

              /* NAVIGATE */

              this.router.navigate([
                '/dashboard'
              ]);
            },

            error: (loginError) => {

              console.log(loginError);

              alert(
                'Login Failed After Signup'
              );
            }
          });
        }
      },

      error: (error) => {

        console.log(error);

        alert('Signup Failed');
      }
    });
  }
}