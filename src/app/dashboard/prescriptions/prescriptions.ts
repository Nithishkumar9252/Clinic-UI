// prescriptions.ts

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
  environment
} from '../../../environments/environment';

import {
  HttpClient
} from '@angular/common/http';

import jsPDF from 'jspdf';

import html2canvas from 'html2canvas';

@Component({
  selector: 'app-prescriptions',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './prescriptions.html',

  styleUrls: ['./prescriptions.css']
})

export class PrescriptionsComponent
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

  searchText = '';

  // =====================================
  // DATA
  // =====================================

  patients:any[] = [];

  filteredPatients:any[] = [];

  searchedPatients:any[] = [];

  patientPrescriptions:any[] = [];

  paginatedPrescriptions:any[][] = [];

  // =====================================
  // TABLE PAGINATION
  // =====================================

  currentPage:number = 1;

  itemsPerPage:number = 5;

  pages:number[] = [];

  totalPages:number = 1;

  // =====================================
  // PREVIEW PAGINATION
  // =====================================

  currentPreviewPage = 0;

  // =====================================
  // MODAL
  // =====================================

  previewMode = false;

  // =====================================
  // PREVIEW DATA
  // =====================================

  previewPatient:any = null;

  todayDate = new Date();

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

        this.updatePagination();

        this.cdr.detectChanges();
      },

      error:(error)=>{

        console.log(
          'PATIENT ERROR => ',
          error
        );

        if(this.isBrowser){

          alert(
            'Failed to load patients'
          );
        }
      }
    });
  }

  // =====================================
  // SEARCH
  // =====================================

  searchPatients() {

    this.updatePagination();
  }

  // =====================================
  // UPDATE PAGINATION
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
            p.name || ''
          ).toLowerCase()
          .includes(search)

          ||

          String(
            p.patientCode || ''
          ).toLowerCase()
          .includes(search)

          ||

          String(
            p.phoneNumber || ''
          ).includes(search)

          ||

          String(
            p.diagnosis || ''
          ).toLowerCase()
          .includes(search)
        );
      });

    // RESET PAGE

    if(search){

      this.currentPage = 1;
    }

    // TOTAL PAGES

    this.totalPages =

      Math.max(

        1,

        Math.ceil(
          this.searchedPatients.length
          / this.itemsPerPage
        )
      );

    // PAGE ARRAY

    this.pages =

      Array.from(

        { length:this.totalPages },

        (_,i)=> i + 1
      );

    // START + END

    const start =

      (this.currentPage - 1)
      * this.itemsPerPage;

    const end =

      start + this.itemsPerPage;

    // FINAL DATA

    this.filteredPatients =

      this.searchedPatients.slice(
        start,
        end
      );

    this.cdr.detectChanges();
  }

  // =====================================
  // NEXT PAGE
  // =====================================

  nextPage() {

    if(

      this.currentPage
      < this.totalPages

    ){

      this.currentPage++;

      this.updatePagination();
    }
  }

  // =====================================
  // PREVIOUS PAGE
  // =====================================

  prevPage() {

    if(

      this.currentPage > 1

    ){

      this.currentPage--;

      this.updatePagination();
    }
  }

  // =====================================
  // GO TO PAGE
  // =====================================

  goToPage(page:number) {

    this.currentPage = page;

    this.updatePagination();
  }

  // =====================================
  // VIEW PRESCRIPTION
  // =====================================

  viewPrescription(patient:any) {

    console.log(
      'VIEW PATIENT => ',
      patient
    );

    // =====================================
    // RESET
    // =====================================

    this.previewPatient = {
      ...patient
    };

    this.previewMode = true;

    // IMPORTANT FIX

    setTimeout(()=>{

      this.cdr.detectChanges();

    },100);

    this.currentPreviewPage = 0;

    this.patientPrescriptions = [];

    this.paginatedPrescriptions = [];

    // =====================================
    // GET PRESCRIPTIONS
    // =====================================

    this.http.get<any[]>(

      `${environment.apiUrl}/api/prescriptions/patient/${patient.id}`

    ).subscribe({

      next:(prescriptions)=>{

        console.log(
          'PRESCRIPTIONS => ',
          prescriptions
        );

        const sortedPrescriptions =

          (prescriptions || []).sort(

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
        // GET FOLLOWUPS
        // =====================================

        this.http.get<any[]>(

          `${environment.apiUrl}/api/followups/patient/${patient.id}`

        ).subscribe({

          next:(followups)=>{

            console.log(
              'FOLLOWUPS => ',
              followups
            );

            const sortedFollowups =

              (followups || []).sort(

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
            // NON FOLLOWUP CASE
            // =====================================

            if(
              sortedFollowups.length === 0
            ){

              console.log(
                'NON FOLLOWUP CASE'
              );

              // =====================================
              // NO PRESCRIPTION
              // =====================================

              if(
                sortedPrescriptions.length === 0
              ){

                this.patientPrescriptions = [

                  {

                    isFollowup:false,

                    complaints:

                      patient.presentingComplaints ||

                      'No Complaints',

                    rx:

                      patient.rx ||

                      'Prescription Not Available',

                    advice:

                      patient.followUpNotes ||

                      'No Advice',

                    followupDate:

                      patient.followUpDate ||

                      '',

                    dosage:'N/A',

                    frequency:'N/A',

                    duration:'N/A',

                    instructions:'N/A',

                    prescription:null
                  }
                ];
              }

              // =====================================
              // PRESCRIPTION EXISTS
              // =====================================

              else{

                this.patientPrescriptions =

                  sortedPrescriptions.map((rx)=>{

                    return {

                      isFollowup:false,

                      complaints:

                        patient.presentingComplaints ||

                        'N/A',

                      rx:

                        patient.rx ||

                        rx.medicineName ||

                        'N/A',

                      advice:

                        patient.followUpNotes ||

                        rx.instructions ||

                        'N/A',

                      followupDate:

                        patient.followUpDate ||

                        rx.nextFollowupDate ||

                        '',

                      dosage:

                        rx.dosage ||

                        'N/A',

                      frequency:

                        rx.frequency ||

                        'N/A',

                      duration:

                        rx.duration ||

                        'N/A',

                      instructions:

                        rx.instructions ||

                        'N/A',

                      prescription:rx
                    };
                  });
              }
            }

            // =====================================
            // FOLLOWUP CASE
            // =====================================

            else{

              console.log(
                'FOLLOWUP CASE'
              );

              this.patientPrescriptions =

                sortedFollowups.map(

                  (followup,index)=>{

                    const currentPrescription =

                      sortedPrescriptions[
                        index
                      ] || null;

                    const previousPrescription =

                      sortedPrescriptions[
                        index + 1
                      ] || null;

                    return {

                      isFollowup:true,

                      // =====================================
                      // PREVIOUS DATA
                      // =====================================

                      previousComplaints:

                        patient.presentingComplaints ||

                        '',

                      previousRx:

                        previousPrescription
                        ?.medicineName ||

                        patient.rx ||

                        '',

                      previousAdvice:

                        previousPrescription
                        ?.instructions ||

                        patient.followUpNotes ||

                        '',

                      previousFollowupDate:

                        previousPrescription
                        ?.nextFollowupDate ||

                        patient.followUpDate ||

                        '',

                      previousDosage:

                        previousPrescription
                        ?.dosage ||

                        '',

                      previousFrequency:

                        previousPrescription
                        ?.frequency ||

                        '',

                      previousDuration:

                        previousPrescription
                        ?.duration ||

                        '',

                      // =====================================
                      // UPDATED FOLLOWUP DATA
                      // =====================================

                      newComplaints:

                        followup.symptoms ||

                        '',

                      newRx:

                        followup.medicines ||

                        currentPrescription
                        ?.medicineName ||

                        '',

                      newAdvice:

                        followup.doctorNotes ||

                        currentPrescription
                        ?.instructions ||

                        '',

                      newObservations:

                        followup.observations ||

                        '',

                      newFollowupDate:

                        followup.nextFollowupDate ||

                        currentPrescription
                        ?.nextFollowupDate ||

                        '',

                      newImprovementStatus:

                        followup.improvementStatus ||

                        '',

                      // =====================================
                      // CURRENT PRESCRIPTION
                      // =====================================

                      newDosage:

                        currentPrescription
                        ?.dosage ||

                        '',

                      newFrequency:

                        currentPrescription
                        ?.frequency ||

                        '',

                      newDuration:

                        currentPrescription
                        ?.duration ||

                        '',

                      newInstructions:

                        currentPrescription
                        ?.instructions ||

                        '',

                      previousPrescription:
                        previousPrescription,

                      newPrescription:
                        currentPrescription,

                      followupData:
                        followup
                    };
                  }
                );
            }

            console.log(
              'FINAL PREVIEW => ',
              this.patientPrescriptions
            );

            // =====================================
            // CREATE PAGES
            // =====================================

            this.createPages();
          },

          // =====================================
          // FOLLOWUP API ERROR
          // =====================================

          error:(error)=>{

            console.log(
              'FOLLOWUP ERROR => ',
              error
            );

            // =====================================
            // FALLBACK
            // =====================================

            if(
              sortedPrescriptions.length === 0
            ){

              this.patientPrescriptions = [

                {

                  isFollowup:false,

                  complaints:

                    patient.presentingComplaints ||

                    'No Complaints',

                  rx:

                    patient.rx ||

                    'Prescription Not Available',

                  advice:

                    patient.followUpNotes ||

                    'No Advice',

                  followupDate:

                    patient.followUpDate ||

                    '',

                  dosage:'N/A',

                  frequency:'N/A',

                  duration:'N/A',

                  instructions:'N/A',

                  prescription:null
                }
              ];
            }

            else{

              this.patientPrescriptions =

                sortedPrescriptions.map((rx)=>{

                  return {

                    isFollowup:false,

                    complaints:

                      patient.presentingComplaints ||

                      '',

                    rx:

                      patient.rx ||

                      rx.medicineName ||

                      '',

                    advice:

                      patient.followUpNotes ||

                      rx.instructions ||

                      '',

                    followupDate:

                      patient.followUpDate ||

                      rx.nextFollowupDate ||

                      '',

                    dosage:
                      rx.dosage || '',

                    frequency:
                      rx.frequency || '',

                    duration:
                      rx.duration || '',

                    instructions:
                      rx.instructions || '',

                    prescription:rx
                  };
                });
            }

            this.createPages();
          }
        });
      },

      // =====================================
      // PRESCRIPTION ERROR
      // =====================================

      error:(error)=>{

        console.log(
          'PRESCRIPTION ERROR => ',
          error
        );

        // =====================================
        // DEFAULT EMPTY PREVIEW
        // =====================================

        this.patientPrescriptions = [

          {

            isFollowup:false,

            complaints:

              patient.presentingComplaints ||

              'No Complaints',

            rx:

              patient.rx ||

              'Prescription Not Available',

            advice:

              patient.followUpNotes ||

              'No Advice',

            followupDate:

              patient.followUpDate ||

              '',

            dosage:'N/A',

            frequency:'N/A',

            duration:'N/A',

            instructions:'N/A'
          }
        ];

        this.createPages();

        if(this.isBrowser){

          console.log(error);
        }
      }
    });
  }

  // =====================================
  // CREATE PAGES
  // =====================================

  createPages() {

    console.log(
      'BEFORE PAGINATION => ',
      this.patientPrescriptions
    );

    // RESET

    this.paginatedPrescriptions = [];

    // =====================================
    // EMPTY SAFETY
    // =====================================

    if(
      !this.patientPrescriptions
      ||
      this.patientPrescriptions.length === 0
    ){

      this.patientPrescriptions = [

        {

          isFollowup:false,

          complaints:
            this.previewPatient
            ?.presentingComplaints
            || 'No Complaints',

          rx:
            this.previewPatient
            ?.rx
            || 'Prescription Not Available',

          advice:
            this.previewPatient
            ?.followUpNotes
            || 'No Advice',

          followupDate:
            this.previewPatient
            ?.followUpDate
            || '',

          dosage:'N/A',

          frequency:'N/A',

          duration:'N/A',

          instructions:'N/A'
        }
      ];
    }

    // =====================================
    // PAGE SIZE
    // =====================================

    const pageSize = 1;

    // =====================================
    // CREATE PAGE ARRAY
    // =====================================

    for(

      let i = 0;

      i < this.patientPrescriptions.length;

      i += pageSize

    ){

      this.paginatedPrescriptions.push(

        this.patientPrescriptions.slice(
          i,
          i + pageSize
        )
      );
    }

    console.log(
      'AFTER PAGINATION => ',
      this.paginatedPrescriptions
    );

    // =====================================
    // FORCE UI UPDATE
    // =====================================

    this.cdr.detectChanges();
  }

  // =====================================
  // CHANGE PAGE
  // =====================================

  changePreviewPage(index:number) {

    this.currentPreviewPage = index;
  }

  // =====================================
  // CLOSE PREVIEW
  // =====================================

  closePreview() {

    this.previewMode = false;

    this.previewPatient = null;

    this.patientPrescriptions = [];

    this.paginatedPrescriptions = [];

    this.currentPreviewPage = 0;
  }

  // =====================================
  // DOWNLOAD PDF
  // =====================================

  async downloadPrescription() {

    const element = document.getElementById(
      'previewPrescriptionCanvas'
    );

    if(!element){

      return;
    }

    const canvas = await html2canvas(
      element,
      {
        scale:2,
        useCORS:true
      }
    );

    const imgData =
      canvas.toDataURL(
        'image/png'
      );

    const pdf =
      new jsPDF(
        'p',
        'mm',
        'a4'
      );

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      pdf.internal.pageSize.getHeight();

    const imgProps =
      pdf.getImageProperties(
        imgData
      );

    const imgHeight =
      (imgProps.height * pdfWidth)
      / imgProps.width;

    let heightLeft =
      imgHeight;

    let position = 0;

    pdf.addImage(

      imgData,

      'PNG',

      0,

      position,

      pdfWidth,

      imgHeight
    );

    heightLeft -= pdfHeight;

    while(heightLeft > 0){

      position =
        heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(

        imgData,

        'PNG',

        0,

        position,

        pdfWidth,

        imgHeight
      );

      heightLeft -= pdfHeight;
    }

    pdf.save(

      `${this.previewPatient?.name || 'Prescription'}.pdf`
    );
  }

  truncateDiagnosis(
      diagnosis: string
    ): string {

      if (!diagnosis) {
        return 'No Diagnosis';
      }

      return diagnosis.length > 40
        ? diagnosis.substring(0, 40) + '...'
        : diagnosis;
    }
}