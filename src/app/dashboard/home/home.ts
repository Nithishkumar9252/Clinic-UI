// home.ts

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  HttpClient
} from '@angular/common/http';

@Component({
  selector: 'app-home',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './home.html',

  styleUrl: './home.css',
})

export class HomeComponent
implements
OnInit,
OnDestroy,
AfterViewInit {

  // =====================================
  // CONSTRUCTOR
  // =====================================

  constructor(

    private router: Router,

    private http: HttpClient,

    private cdr: ChangeDetectorRef,

    private ngZone: NgZone

  ) {}

  // =====================================
  // SLIDER
  // =====================================

  currentSlide = 0;

  interval: any;

  // =====================================
  // LIVE ANALYTICS
  // =====================================

  totalPatients:number = 0;

  todayPatients:number = 0;

  followupPatients:number = 0;

  recoveryRate:number = 96;

  recentPatients:any[] = [];

  loadingOverview = true;

  // =====================================
  // SLIDES
  // =====================================

  slides = [

    {
      title: 'Care Beyond Medicine',

      quote:
      'Patients may forget medicines, but they never forget kindness.',

      cards: [

        {
          icon:'💚',
          title:'Patient Care',
          text:'Compassion and trust for every patient.'
        },

        {
          icon:'🌿',
          title:'Holistic Cure',
          text:'Treating the root cause naturally.'
        },

        {
          icon:'✨',
          title:'Healing Touch',
          text:'Empathy creates faster recovery.'
        }

      ]
    },

    {
      title: 'Healing Starts Naturally',

      quote:
      'The highest ideal of cure is gentle and permanent restoration of health.',

      cards: [

        {
          icon:'🌱',
          title:'Natural Healing',
          text:'Safe remedies without side effects.'
        },

        {
          icon:'🩺',
          title:'Healthy Living',
          text:'Balance of body and mind.'
        },

        {
          icon:'🤍',
          title:'Wellness',
          text:'Complete harmony and peace.'
        }

      ]
    },

    {
      title: 'Every Patient Matters',

      quote:
      'A good physician treats the disease, a great physician treats the patient.',

      cards: [

        {
          icon:'🌸',
          title:'Pure Care',
          text:'Gentle treatment for every age.'
        },

        {
          icon:'☘️',
          title:'Better Future',
          text:'Healthy life through nature.'
        },

        {
          icon:'💖',
          title:'Support',
          text:'Care throughout recovery.'
        }

      ]
    },

    {
      title: 'Health is True Wealth',

      quote:
      'Nature itself is the best physician.',

      cards: [

        {
          icon:'🌿',
          title:'Homeopathy',
          text:'Healing from within naturally.'
        },

        {
          icon:'🕊️',
          title:'Peaceful Healing',
          text:'Comfort and confidence together.'
        },

        {
          icon:'✨',
          title:'Positive Energy',
          text:'Healthy body and peaceful mind.'
        }

      ]
    },

    {
      title: 'Compassion Creates Healing',

      quote:
      'Healing is a matter of time, but it is sometimes also a matter of opportunity.',

      cards: [

        {
          icon:'💊',
          title:'Gentle Therapy',
          text:'Natural care without harshness.'
        },

        {
          icon:'🌼',
          title:'Life Balance',
          text:'Harmony in every treatment.'
        },

        {
          icon:'💚',
          title:'Care First',
          text:'Patients are always priority.'
        }

      ]
    }

  ];

  // =====================================
  // INIT
  // =====================================

  ngOnInit(): void {

    this.startAutoSlide();
  }

  // =====================================
  // AFTER VIEW INIT
  // =====================================

  ngAfterViewInit(): void {

    this.ngZone.run(()=>{

      this.loadDashboardAnalytics();

    });
  }

  // =====================================
  // LOAD DASHBOARD
  // =====================================

  loadDashboardAnalytics() {

    this.loadingOverview = true;

    this.http.get<any[]>(

      'http://localhost:8080/api/patients'

    ).subscribe({

      next:(patients)=>{

        this.ngZone.run(()=>{

          console.log(
            'HOME PATIENTS => ',
            patients
          );

          // =====================================
          // FORCE NEW ARRAY
          // =====================================

          this.recentPatients = [];

          this.recentPatients =

            [...(patients || [])];

          // =====================================
          // TOTAL PATIENTS
          // =====================================

          this.totalPatients =

            this.recentPatients.length;

          // =====================================
          // TODAY PATIENTS
          // =====================================

          const today =
            new Date().toDateString();

          this.todayPatients =

            this.recentPatients.filter((p)=>{

              if(!p.createdAt){

                return false;
              }

              return(

                new Date(
                  p.createdAt
                ).toDateString()

                === today
              );

            }).length;

          // =====================================
          // FOLLOWUPS
          // =====================================

          this.followupPatients =

            this.recentPatients.filter((p)=>{

              return(
                p.followUpDate
              );

            }).length;

          // =====================================
          // RECOVERY RATE
          // =====================================

          if(this.totalPatients > 0){

            const recovered =

              this.recentPatients.filter((p)=>{

                return(

                  p.status
                  ?.toLowerCase()
                  ?.includes('recovered')

                  ||

                  p.status
                  ?.toLowerCase()
                  ?.includes('improved')
                );

              }).length;

            this.recoveryRate =

              Math.round(

                (recovered
                / this.totalPatients)

                * 100
              );

            if(
              isNaN(
                this.recoveryRate
              )
            ){

              this.recoveryRate = 96;
            }
          }

          // =====================================
          // COMPLETE
          // =====================================

          this.loadingOverview = false;

          // =====================================
          // FORCE UI REFRESH
          // =====================================

          this.cdr.markForCheck();

          this.cdr.detectChanges();

          console.log({

            totalPatients:
              this.totalPatients,

            todayPatients:
              this.todayPatients,

            followupPatients:
              this.followupPatients,

            recoveryRate:
              this.recoveryRate
          });

        });
      },

      error:(error)=>{

        console.log(
          'HOME ANALYTICS ERROR => ',
          error
        );

        this.loadingOverview = false;

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // OPEN ADD PATIENT
  // =====================================

  openAddPatient() {

    this.router.navigate(

      ['/patients'],

      {

        queryParams: {

          openForm: true
        }
      }
    );
  }

  // =====================================
  // OPEN FOLLOWUPS
  // =====================================

  openFollowups() {

    this.router.navigate([
      '/followups'
    ]);
  }

  openReports() {

  this.router.navigate([
    '/reports'
  ]);
}

  // =====================================
  // AUTO SLIDE
  // =====================================

  startAutoSlide(){

    this.interval = setInterval(() => {

      this.nextSlide();

    }, 5000);
  }

  // =====================================
  // NEXT SLIDE
  // =====================================

  nextSlide(){

    this.currentSlide =

    (this.currentSlide + 1)

    % this.slides.length;
  }

  // =====================================
  // PREVIOUS SLIDE
  // =====================================

  prevSlide(){

    this.currentSlide =

    (this.currentSlide - 1
    + this.slides.length)

    % this.slides.length;
  }

  // =====================================
  // GO TO SLIDE
  // =====================================

  goToSlide(index:number){

    this.currentSlide = index;
  }

  // =====================================
  // DESTROY
  // =====================================

  ngOnDestroy(): void {

    clearInterval(this.interval);
  }

}