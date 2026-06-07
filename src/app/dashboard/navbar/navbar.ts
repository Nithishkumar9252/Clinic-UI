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

  isDarkMode = false;

  /* SHOW ID CARD */
  showCard = false;

  ngOnInit(): void {

    /* SSR SAFE */
    if (typeof window !== 'undefined') {

    this.fullName =
      localStorage.getItem('fullName')
      || 'Doctor';

    this.isDarkMode =
      localStorage.getItem('theme') === 'dark';

    document.body.classList.toggle(
      'dark-theme',
      this.isDarkMode
    );
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

  toggleTheme() {

  this.isDarkMode = !this.isDarkMode;

  document.body.classList.toggle(
    'dark-theme',
    this.isDarkMode
  );

  localStorage.setItem(
    'theme',
    this.isDarkMode
      ? 'dark'
      : 'light'
  );
}
}