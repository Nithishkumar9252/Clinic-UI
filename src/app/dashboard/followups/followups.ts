// followups.ts

import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';

import {
  environment
} from '../../../environments/environment';

@Component({
  selector: 'app-followups',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './followups.html',

  styleUrls: ['./followups.css']
})

export class FollowupsComponent
implements OnInit {

  // =====================================
  // PLATFORM
  // =====================================

  private platformId =
    inject(PLATFORM_ID);

  isBrowser = false;

  // =====================================
  // SEARCH
  // =====================================

  searchText:string = '';

  // =====================================
  // PATIENTS
  // =====================================

  patients:any[] = [];

  filteredPatients:any[] = [];

  searchedPatients:any[] = [];

  // =====================================
  // PAGINATION
  // =====================================

  currentPage:number = 1;

  itemsPerPage:number = 5;

  totalPages:number = 1;

  pages:number[] = [];

  // =====================================
  // MODALS
  // =====================================

  showFollowupForm = false;

  previewMode = false;

  // =====================================
  // SELECTED
  // =====================================

  selectedPatient:any = null;

  previewPatient:any = null;

  // =====================================
  // FOLLOWUPS
  // =====================================

  patientFollowups:any[] = [];

  // =====================================
  // FOLLOWUP FORM
  // =====================================

  followup:any = {

  id:null,

  symptoms:'',

  observations:'',

  medicines:'',

  doctorNotes:'',

  improvementStatus:'',

  nextFollowupDate:''
};

  constructor(

    private http:HttpClient,

    private cdr:ChangeDetectorRef

  ) {}

  // =====================================
  // INIT
  // =====================================

  ngOnInit(): void {

    this.isBrowser =
      isPlatformBrowser(
        this.platformId
      );

    this.getPatients();
  }

  // =====================================
  // GET PATIENTS
  // =====================================

  getPatients() {

    this.http.get<any[]>(

      `${environment.apiUrl}/api/patients`

    ).subscribe({

      next:(response)=>{

        console.log(
          'PATIENTS => ',
          response
        );

        this.patients =
          response || [];

        // =====================================
        // LOAD FOLLOWUPS FOR EACH PATIENT
        // =====================================

        this.patients.forEach((patient)=>{

          this.http.get<any[]>(

            `${environment.apiUrl}/api/followups/patient/${patient.id}`

          ).subscribe({

            next:(followups)=>{

              console.log(
                'FOLLOWUPS => ',
                followups
              );

              if(
                followups &&
                followups.length > 0
              ){

                // SORT DESC

                followups.sort(

                  (a,b)=>

                  new Date(
                    b.createdAt
                  ).getTime()

                  -

                  new Date(
                    a.createdAt
                  ).getTime()
                );

                // LATEST FOLLOWUP

                const latest =
                  followups[0];

                patient.latestFollowupDate =

                  latest.nextFollowupDate;

                patient.latestImprovementStatus =

                  latest.improvementStatus;
              }

              else{

                patient.latestFollowupDate =
                null;

                patient.latestImprovementStatus =
                null;
              }

              // FORCE UPDATE

              this.filteredPatients = [
                ...this.filteredPatients
              ];

              this.patients = [
                ...this.patients
              ];

              this.updatePagination();

              this.cdr.detectChanges();
            },

            error:(error)=>{

              console.log(
                'FOLLOWUP LOAD ERROR => ',
                error
              );
            }
          });
        });

        this.updatePagination();

        this.cdr.detectChanges();
      },

      error:(error)=>{

        console.log(
          'PATIENT FETCH ERROR => ',
          error
        );

        if(this.isBrowser){

          window.alert(
            'Failed to load patients'
          );
        }
      }
    });
  }

  // =====================================
  // SEARCH + PAGINATION
  // =====================================

  updatePagination() {

    const search =
      this.searchText
      .toLowerCase()
      .trim();

    this.searchedPatients =
      this.patients.filter((p)=>{

        return(

          String(
            p.patientCode || ''
          ).toLowerCase()
          .includes(search)

          ||

          String(
            p.name || ''
          ).toLowerCase()
          .includes(search)

          ||

          String(
            p.phoneNumber || ''
          ).toLowerCase()
          .includes(search)

          ||

          String(
            p.diagnosis || ''
          ).toLowerCase()
          .includes(search)
        );
      });

    this.totalPages =
      Math.max(

        1,

        Math.ceil(

          this.searchedPatients.length
          / this.itemsPerPage
        )
      );

    this.pages =
      Array.from(

        { length:this.totalPages },

        (_,i)=>i+1
      );

    const start =
      (this.currentPage - 1)
      * this.itemsPerPage;

    const end =
      start + this.itemsPerPage;

    this.filteredPatients =
      this.searchedPatients.slice(
        start,
        end
      );
  }

  // =====================================
  // PAGINATION
  // =====================================

  nextPage() {

    if(
      this.currentPage <
      this.totalPages
    ){

      this.currentPage++;

      this.updatePagination();
    }
  }

  prevPage() {

    if(
      this.currentPage > 1
    ){

      this.currentPage--;

      this.updatePagination();
    }
  }

  goToPage(page:number) {

    this.currentPage = page;

    this.updatePagination();
  }

  // =====================================
  // OPEN FOLLOWUP FORM
  // =====================================

  openFollowupForm(patient:any) {

    this.selectedPatient = {
      ...patient
    };

    this.showFollowupForm = true;

    this.previewMode = false;

    this.resetFollowup();

    this.getPatientFollowups(
      patient.id
    );

    this.cdr.detectChanges();
  }

  // =====================================
  // CLOSE FORM
  // =====================================

  closeFollowupForm() {

    this.showFollowupForm = false;

    this.selectedPatient = null;

    this.resetFollowup();

    this.cdr.detectChanges();
  }

  // =====================================
  // RESET FOLLOWUP
  // =====================================

  resetFollowup() {

  this.followup = {

    id:null,

    symptoms:'',

    observations:'',

    medicines:'',

    doctorNotes:'',

    improvementStatus:'',

    nextFollowupDate:''
  };
}

  // =====================================
  // GET FOLLOWUPS
  // =====================================

  getPatientFollowups(patientId:number) {

    this.http.get<any[]>(

      `${environment.apiUrl}/api/followups/patient/${patientId}`

    ).subscribe({

      next:(response)=>{

        console.log(
          'FOLLOWUPS => ',
          response
        );

        this.patientFollowups =

          (response || []).sort(

            (a,b)=>

            new Date(
              b.createdAt
            ).getTime()

            -

            new Date(
              a.createdAt
            ).getTime()
          );

        this.patientFollowups = [
          ...this.patientFollowups
        ];

        this.cdr.detectChanges();
      },

      error:(error)=>{

        console.log(
          'FOLLOWUP FETCH ERROR => ',
          error
        );
      }
    });
  }

  // =====================================
  // SAVE FOLLOWUP
  // =====================================

  saveFollowup() {

  if(

    !this.followup.nextFollowupDate ||

    !this.followup.improvementStatus

  ){

    if(this.isBrowser){

      window.alert(
        'Fill required fields'
      );
    }

    return;
  }

  const payload = {

    patientId:
    this.selectedPatient.id,

    symptoms:
    this.followup.symptoms,

    observations:
    this.followup.observations,

    medicines:
    this.followup.medicines,

    doctorNotes:
    this.followup.doctorNotes,

    improvementStatus:
    this.followup.improvementStatus,

    nextFollowupDate:
    this.followup.nextFollowupDate
  };

  console.log(
    'FOLLOWUP PAYLOAD => ',
    payload
  );

  // =====================================
  // UPDATE FOLLOWUP
  // =====================================

  if(this.followup.id){

    this.http.put(

      `${environment.apiUrl}/api/followups/${this.followup.id}`,

      payload,

      {
        responseType:'text'
      }

    ).subscribe({

      next:(response)=>{

        console.log(
          'FOLLOWUP UPDATED => ',
          response
        );

        if(this.isBrowser){

          window.alert(
            'Followup Updated Successfully'
          );
        }

        this.afterSaveSuccess();
      },

      error:(error)=>{

        console.log(
          'FOLLOWUP UPDATE ERROR => ',
          error
        );

        if(this.isBrowser){

          window.alert(
            'Failed to update followup'
          );
        }
      }
    });

  }

  // =====================================
  // CREATE FOLLOWUP
  // =====================================

  else{

    this.http.post(

      `${environment.apiUrl}/api/followups`,

      payload,

      {
        responseType:'text'
      }

    ).subscribe({

      next:(response)=>{

        console.log(
          'FOLLOWUP SAVED => ',
          response
        );

        if(this.isBrowser){

          window.alert(
            'Followup Saved Successfully'
          );
        }

        this.afterSaveSuccess();
      },

      error:(error)=>{

        console.log(
          'FOLLOWUP SAVE ERROR => ',
          error
        );

        if(this.isBrowser){

          window.alert(
            'Failed to save followup'
          );
        }
      }
    });
  }
}

afterSaveSuccess(){

  // =====================================
  // LIVE UPDATE TABLE
  // =====================================

  this.selectedPatient.latestFollowupDate =

    this.followup.nextFollowupDate;

  this.selectedPatient.latestImprovementStatus =

    this.followup.improvementStatus;

  // =====================================
  // UPDATE PATIENT LIST
  // =====================================

  this.patients = this.patients.map((p)=>{

    if(
      p.id === this.selectedPatient.id
    ){

      return {

        ...p,

        latestFollowupDate:
        this.followup.nextFollowupDate,

        latestImprovementStatus:
        this.followup.improvementStatus
      };
    }

    return p;
  });

  // =====================================
  // FORCE REFRESH
  // =====================================

  this.filteredPatients = [
    ...this.filteredPatients
  ];

  this.patients = [
    ...this.patients
  ];

  this.updatePagination();

  this.cdr.detectChanges();

  // =====================================
  // RELOAD FOLLOWUPS
  // =====================================

  this.getPatientFollowups(
    this.selectedPatient.id
  );

  // =====================================
  // RESET
  // =====================================

  this.resetFollowup();

  this.closeFollowupForm();
}

  // =====================================
  // VIEW FOLLOWUP
  // =====================================

  viewFollowup(patient:any) {

  console.log(
    'VIEW PATIENT => ',
    patient
  );

  // =====================================
  // RESET EVERYTHING
  // =====================================

  this.previewMode = false;

  this.showFollowupForm = false;

  this.previewPatient = null;

  this.patientFollowups = [];

  this.cdr.detectChanges();

  // =====================================
  // SET PREVIEW PATIENT
  // =====================================

  this.previewPatient = {
    ...patient
  };

  // =====================================
  // API CALL
  // =====================================

  this.http.get<any[]>(

    `${environment.apiUrl}/api/followups/patient/${patient.id}`

  ).subscribe({

    next:(response)=>{

      console.log(
        'PREVIEW FOLLOWUPS => ',
        response
      );

      // =====================================
      // SORT FOLLOWUPS
      // =====================================

      const sortedFollowups =

        (response || []).sort(

          (a,b)=>

            new Date(
              b.createdAt
            ).getTime()

            -

            new Date(
              a.createdAt
            ).getTime()
        );

      // =====================================
      // FORCE NEW REFERENCE
      // =====================================

      this.patientFollowups = [
        ...sortedFollowups
      ];

      console.log(
        'FINAL FOLLOWUPS => ',
        this.patientFollowups
      );

      // =====================================
      // WAIT FOR UI RENDER
      // =====================================

      setTimeout(()=>{

        this.previewMode = true;

        this.filteredPatients = [
          ...this.filteredPatients
        ];

        this.patients = [
          ...this.patients
        ];

        this.cdr.detectChanges();

      },150);
    },

    error:(error)=>{

      console.log(
        'VIEW FOLLOWUP ERROR => ',
        error
      );

      if(this.isBrowser){

        window.alert(
          'Failed to load followups'
        );
      }
    }
  });
}

  // =====================================
  // CLOSE PREVIEW
  // =====================================

  closePreview() {

    this.previewMode = false;

    this.previewPatient = null;

    this.patientFollowups = [];

    this.cdr.detectChanges();
  }

  // =====================================
  // EDIT FOLLOWUP
  // =====================================

  editFollowup(followup:any) {

    this.showFollowupForm = true;

    this.previewMode = false;

    this.followup = {

      ...followup
    };

    this.cdr.detectChanges();
  }

  // =====================================
  // DELETE FOLLOWUP
  // =====================================

  deleteFollowup(id:number) {

    if(
      this.isBrowser &&
      !window.confirm(
        'Delete Followup?'
      )
    ){

      return;
    }

    this.http.delete(

      `${environment.apiUrl}/api/followups/${id}`,

      {
        responseType:'text'
      }

    ).subscribe({

      next:(response)=>{

        console.log(
          'DELETE RESPONSE => ',
          response
        );

        if(this.isBrowser){

          window.alert(
            'Followup Deleted'
          );
        }

        // REMOVE LOCAL

        this.patientFollowups =

          this.patientFollowups.filter(

            f => f.id !== id
          );

        // REFRESH

        this.getPatients();

        // FORCE REFRESH

        this.filteredPatients = [
          ...this.filteredPatients
        ];

        this.patients = [
          ...this.patients
        ];

        this.updatePagination();

        this.cdr.detectChanges();
      },

      error:(error)=>{

        console.log(
          'DELETE ERROR => ',
          error
        );

        if(this.isBrowser){

          window.alert(
            'Delete Failed'
          );
        }
      }
    });
  }
  // =====================================
// TRACK BY FOLLOWUP
// =====================================

trackByFollowup(
  index:number,
  item:any
):number{

  return item?.id || index;
}

}