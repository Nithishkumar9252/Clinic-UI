import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

@Component({
  selector: 'app-navbar',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './navbar.html',

  styleUrl: './navbar.css'
})

export class NavbarComponent implements OnInit {

  currentDate = '';

  currentDay = '';

  /* FULL NAME */
  fullName = 'Doctor';

  /* SHOW ID CARD */
  showCard = false;

  ngOnInit(): void {

    /* SSR SAFE */
    if (typeof window !== 'undefined') {

      /* GET FULL NAME */
      this.fullName =
        localStorage.getItem('fullName')
        || 'Doctor';
    }

    this.updateDate();
  }

  /* TOGGLE ID CARD */
  toggleCard() {

    this.showCard =
      !this.showCard;
  }

  updateDate() {

    const now = new Date();

    this.currentDate =
      now.toLocaleDateString(
        'en-GB',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
      );

    this.currentDay =
      now.toLocaleDateString(
        'en-US',
        {
          weekday: 'long'
        }
      );
  }
}