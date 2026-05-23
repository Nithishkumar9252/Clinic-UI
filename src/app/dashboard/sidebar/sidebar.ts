import {
  Component
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-sidebar',

  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './sidebar.html',

  styleUrls: [
    './sidebar.css'
  ]
})

export class SidebarComponent {

  // =====================================
  // FULL NAME
  // =====================================

  fullName:string = 'Doctor';

  constructor(
    private router:Router
  ) {

    // =====================================
    // SSR SAFE
    // =====================================

    if(
      typeof window !== 'undefined'
    ){

      this.fullName =

        localStorage.getItem(
          'fullName'
        )

        ||

        'Doctor';
    }
  }

  // =====================================
  // LOGOUT
  // =====================================

  logout() {

    // =====================================
    // SSR SAFE
    // =====================================

    if(
      typeof window !== 'undefined'
    ){

      // =====================================
      // CLEAR STORAGE
      // =====================================

      localStorage.removeItem(
        'token'
      );

      localStorage.removeItem(
        'fullName'
      );

      localStorage.removeItem(
        'profileImage'
      );

      // =====================================
      // SET LOGOUT FLAG
      // =====================================

      localStorage.setItem(
        'logoutSuccess',
        'true'
      );
    }

    // =====================================
    // NAVIGATE LOGIN
    // =====================================

    this.router.navigate([
      '/login'
    ]);
  }
}