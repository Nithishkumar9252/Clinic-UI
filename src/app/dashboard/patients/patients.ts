// patients.ts

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

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
  ActivatedRoute
} from '@angular/router';

import {
  environment
} from '../../../environments/environment';


@Component({
  selector: 'app-patients',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './patients.html',

  styleUrls: ['./patients.css']
})

export class PatientsComponent
implements OnInit {

  // PLATFORM

  private platformId =
    inject(PLATFORM_ID);

  isBrowser = false;

  // SEARCH

  searchText: string = '';

  // FORM TOGGLE

  showForm: boolean = false;

  isEditMode: boolean = false;

  editingPatientId: number | null = null;
  previewImageMode = false;

  // INTERNAL STEPS

  currentStep: number = 1;

  totalSteps: number = 2;

  todayDate = new Date();

  // PATIENT LIST

  patients: any[] = [];

  // PRESCRIPTION PREVIEW

previewMode = false;

previewPatient: any = null;

/* PAGINATION */

currentPage:number = 1;

itemsPerPage:number = 5;
/* FILTER + PAGINATION */

filteredPatients:any[] = [];

searchedPatients:any[] = [];

pages:number[] = [];

totalPages:number = 1;

  // PATIENT MODEL

  patient: any = {

    // BASIC DETAILS

    name: '',

    age: '',

    sex: '',

    maritalStatus: '',

    dswOf: '',

    phoneNumber: '',

    occupation: '',

    religion: '',

    address: '',

    aadhaarNo: '',

    // CASE SHEET

    presentingComplaints: '',

    historyPresentIllness: '',

    pastMedicalHistory: '',

    familyHistory: '',

    lifeSpaceInvestigation: '',

    // PHYSICAL GENERALS

    appetite: '',

    thirst: '',

    stool: '',

    urine: '',

    desires: '',

    aversions: '',

    sleep: '',

    dreams: '',

    sweat: '',

    habits: '',

    menses: '',

    obstetric: '',

    thermals: '',

    // MENTAL

    mentalGenerals: '',

    // PHYSICAL EXAMINATION

    pulse: '',

    bp: '',

    wt: '',

    temp: '',

    rr: '',

    pallor: '',

    // SYSTEMIC

    systemicExamination: '',

    // INVESTIGATIONS

    investigations: '',

    // DIAGNOSIS

    diagnosis: '',

    // REPERTORIAL

    repertorialTotality: '',

    // RX

    rx: '',

    // FOLLOWUP

    followUpDate: '',

    followUpNotes: '',


  };

  constructor(

    private http: HttpClient,

    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute

  ) {}

  // INIT

 ngOnInit(): void {

  this.isBrowser =
    isPlatformBrowser(
      this.platformId
    );

  this.getPatients();

  /* =====================================
     AUTO OPEN ADD PATIENT FORM
  ===================================== */

  this.route.queryParams
  .subscribe(params => {

    if (

      params['openForm']

    ) {

      this.openAddPatientForm();
    }

  });
}

  // FILTERED PATIENTS



updatePagination() {

  /* UNIVERSAL SEARCH */

  const search =
    this.searchText
    .toLowerCase()
    .trim();

  this.searchedPatients =
    this.patients.filter((p) => {

      return (

        String(p.patientCode || '')
        .toLowerCase()
        .includes(search)

        ||

        String(p.name || '')
        .toLowerCase()
        .includes(search)

        ||

        String(p.age || '')
        .toLowerCase()
        .includes(search)

        ||

        String(p.diagnosis || '')
        .toLowerCase()
        .includes(search)

        ||

        String(p.phoneNumber || '')
        .toLowerCase()
        .includes(search)
      );
    });

  /* RESET PAGE IF SEARCH */

  if (search) {

    this.currentPage = 1;
  }

  /* TOTAL PAGES */

  this.totalPages =
    Math.max(
      1,
      Math.ceil(
        this.searchedPatients.length
        / this.itemsPerPage
      )
    );

  /* PAGE ARRAY */

  this.pages =
    Array.from(
      { length:this.totalPages },
      (_, i) => i + 1
    );

  /* START / END */

  const start =
    (this.currentPage - 1)
    * this.itemsPerPage;

  const end =
    start + this.itemsPerPage;

  /* FINAL FILTERED */

  this.filteredPatients =
    this.searchedPatients.slice(
      start,
      end
    );
}




nextPage() {

  if (
    this.currentPage
    < this.totalPages
  ) {

    this.currentPage++;

    this.updatePagination();
  }
}

prevPage() {

  if (
    this.currentPage > 1
  ) {

    this.currentPage--;

    this.updatePagination();
  }
}

goToPage(page:number) {

  this.currentPage = page;

  this.updatePagination();
}



  // TRACK BY

  trackByPatient(
    index: number,
    patient: any
  ) {

    return patient.id;
  }

  // GET ALL PATIENTS

  getPatients() {

    this.http.get<any[]>(

      `${environment.apiUrl}/api/patients`

    ).subscribe({

      next: (response) => {

        this.patients =
          response || [];
        this.updatePagination();

        this.cdr.detectChanges();

        console.log(
          'Patients Loaded',
          this.patients
        );
      },

      error: (error) => {

        console.log(error);

        this.patients = [];

        this.cdr.detectChanges();

        if (this.isBrowser) {

          alert(
            'Failed to load patients'
          );
        }
      }
    });
  }

  // NEXT STEP

  nextStep() {

    if (

      !this.patient.name ||

      !this.patient.phoneNumber ||

      !this.patient.age

    ) {

      if (this.isBrowser) {

        alert(
          'Please fill required fields'
        );
      }

      return;
    }

    if (
      this.currentStep <
      this.totalSteps
    ) {

      this.currentStep++;
    }
  }

  // PREVIOUS STEP

  prevStep() {

    if (
      this.currentStep > 1
    ) {

      this.currentStep--;
    }
  }

  // GO TO STEP

  goToStep(step: number) {

    this.currentStep = step;
  }

  // OPEN ADD PATIENT FORM

  openAddPatientForm() {

    /*
    =====================================
    RESET FORM
    =====================================
    */

    this.resetForm();

    /*
    =====================================
    RESET EDIT MODE
    =====================================
    */

    this.isEditMode = false;

    this.editingPatientId = null;

    /*
    =====================================
    RESET STEP
    =====================================
    */

    this.currentStep = 1;

    /*
    =====================================
    OPEN FORM
    =====================================
    */

    this.showForm = true;
  }

  // CLOSE FORM

  closeForm() {

    this.showForm = false;

    this.currentStep = 1;

    this.isEditMode = false;

    this.editingPatientId = null;

    this.resetForm();
  }

  // CLOSE PREVIEW
closePreview() {

  this.previewMode = false;

  this.previewPatient = null;
}

  // SAVE PATIENT

  addPatient() {

    // VALIDATION

    if (

      !this.patient.name ||

      !this.patient.phoneNumber ||

      !this.patient.age

    ) {

      if (this.isBrowser) {

        alert(
          'Please fill required fields'
        );
      }

      return;
    }

    /*
    ==================================
    EDIT
    ==================================
    */

    if (

      this.isEditMode

      &&

      this.editingPatientId

    ) {

      this.http.put(

        `${environment.apiUrl}/api/patients/${this.editingPatientId}`,

        this.patient

      ).subscribe({

        next: () => {

          if (this.isBrowser) {

            alert(
              'Patient Updated Successfully'
            );
          }

          this.resetForm();

          this.showForm = false;

          this.isEditMode = false;

          this.editingPatientId = null;

          this.currentStep = 1;

          this.getPatients();
        },

        error: (error) => {

          console.log(error);

          alert(
            'Update Failed'
          );
        }
      });

      return;
    }

    /*
    ==================================
    ADD NEW
    ==================================
    */

    this.http.post(

      `${environment.apiUrl}/api/patients`,

      this.patient

    ).subscribe({

      next: () => {

        if (this.isBrowser) {

          alert(
            'Patient Added Successfully'
          );
        }

        this.resetForm();

        this.showForm = false;

        this.currentStep = 1;

        this.getPatients();
      },

      error: (error) => {

        console.log(error);

        alert(
          'Failed to add patient'
        );
      }
    });
  }

  // DELETE PATIENT

  deletePatient(id: number) {

    if (

      this.isBrowser &&

      !confirm(
        'Delete this patient?'
      )

    ) {

      return;
    }

    this.http.delete(

      `${environment.apiUrl}/api/patients/${id}`,

      {
        responseType: 'text'
      }

    ).subscribe({

      next: () => {

        if (this.isBrowser) {

          alert(
            'Patient Deleted Successfully'
          );
        }

        this.getPatients();
      },

      error: (error) => {

        console.log(error);

        if (this.isBrowser) {

          alert(
            'Delete Failed'
          );
        }
      }
    });
  }

  // EDIT PATIENT

  editPatient(patientData: any) {

  /* CLOSE PREVIEW */

  this.previewMode = false;

  this.previewImageMode = false;

  this.previewPatient = null;

  /* OPEN FORM */

  this.showForm = true;

  /* EDIT MODE */

  this.isEditMode = true;

  /* STORE ID */

  this.editingPatientId =
    patientData.id;

  /* COPY DATA */

  this.patient = {

    ...patientData

  };

  /* START STEP */

  this.currentStep = 1;
}

  // VIEW PRESCRIPTION

// VIEW PRESCRIPTION

// VIEW PRESCRIPTION

previewPrescription(patientData: any) {

  /* CLOSE FORM */

  this.showForm = false;

  /* RESET EDIT MODE */

  this.isEditMode = false;

  /* SET PREVIEW DATA */

  this.previewPatient = {
    ...patientData
  };

  /* OPEN PREVIEW MODAL */

  this.previewMode = true;

  /* FORCE CHANGE DETECTION */

  this.cdr.detectChanges();

  /* SCROLL TOP */

  if (this.isBrowser) {

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}




downloadPrescriptionPDF() {

  const targetId =
    this.previewMode
    ? 'previewPrescriptionCanvas'
    : 'livePrescriptionCanvas';

  const target =
    document.getElementById(
      targetId
    ) as HTMLElement;

  if (!target) {

    console.log(
      'Prescription template not found'
    );

    return;
  }

  html2canvas(
    target,
    {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    }

  ).then((canvas) => {

    const imageData =
      canvas.toDataURL('image/png');

    const pdf =
      new jsPDF(
        'p',
        'mm',
        'a4'
      );

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      (canvas.height * pdfWidth)
      / canvas.width;

    pdf.addImage(
      imageData,
      'PNG',
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    const patientName =
      this.previewPatient?.name
      || this.patient?.name
      || 'Patient';

    const safeName =
      patientName.replace(/\s+/g, '_');

    const today =
      new Date()
      .toISOString()
      .split('T')[0];

    pdf.save(
      `${safeName}_Prescription_${today}.pdf`
    );

  }).catch((error) => {

    console.log(
      'PDF Error:',
      error
    );

  });
}

  // RESET FORM

  resetForm() {

    this.patient = {

      // BASIC DETAILS

      name: '',

      age: '',

      sex: '',

      maritalStatus: '',

      dswOf: '',

      phoneNumber: '',

      occupation: '',

      religion: '',

      address: '',

      aadhaarNo: '',

      // CASE SHEET

      presentingComplaints: '',

      historyPresentIllness: '',

      pastMedicalHistory: '',

      familyHistory: '',

      lifeSpaceInvestigation: '',

      // PHYSICAL GENERALS

      appetite: '',

      thirst: '',

      stool: '',

      urine: '',

      desires: '',

      aversions: '',

      sleep: '',

      dreams: '',

      sweat: '',

      habits: '',

      menses: '',

      obstetric: '',

      thermals: '',

      // MENTAL

      mentalGenerals: '',

      // PHYSICAL EXAMINATION

      pulse: '',

      bp: '',

      wt: '',

      temp: '',

      rr: '',

      pallor: '',

      // SYSTEMIC

      systemicExamination: '',

      // INVESTIGATIONS

      investigations: '',

      // DIAGNOSIS

      diagnosis: '',

      // REPERTORIAL

      repertorialTotality: '',

      // RX

      rx: '',

      // FOLLOWUP

      followUpDate: '',

      followUpNotes: '',


    };
  }
}