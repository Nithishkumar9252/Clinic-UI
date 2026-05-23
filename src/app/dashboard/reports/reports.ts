import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';

import {
  FormsModule
} from '@angular/forms';

import jsPDF from 'jspdf';



import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './reports.html',

  styleUrls: [
    './reports.css'
  ]
})

export class ReportsComponent
implements OnInit {

  // =====================================
  // TOTAL COUNTS
  // =====================================

  totalPatients:number = 0;

  totalCases:number = 0;

  totalPrescriptions:number = 0;

  totalAppointments:number = 0;

  // =====================================
  // GENDER COUNTS
  // =====================================

  maleCount:number = 0;

  femaleCount:number = 0;

  // =====================================
  // DONUT GRAPH
  // =====================================

  maleDegree:number = 0;

  femaleDegree:number = 0;

  // =====================================
  // AGE GROUPS
  // =====================================

  ageGroups:any = {

    child:0,

    youth:0,

    adult:0,

    middle:0,

    senior:0
  };

  // =====================================
  // DATA ARRAYS
  // =====================================

  patients:any[] = [];

  prescriptions:any[] = [];

  followups:any[] = [];

  topConditions:any[] = [];

  // =====================================
  // DATE FILTER
  // =====================================

  fromDate:string = '';

  toDate:string = '';

  // =====================================
  // LOADING
  // =====================================

  loading:boolean = false;

  // =====================================
  // CONSTRUCTOR
  // =====================================

  constructor(

    private http:HttpClient

  ) {}

  // =====================================
  // INIT
  // =====================================

  ngOnInit(): void {

    this.loadReports();
  }

  // =====================================
  // LOAD REPORTS
  // =====================================

  loadReports() {

    this.loading = true;

    // =====================================
    // LOAD PATIENTS
    // =====================================

    this.http.get<any[]>(

      'http://localhost:8080/api/patients'

    ).subscribe({

      next:(patients)=>{

        console.log(
          'PATIENTS => ',
          patients
        );

        this.patients =
          patients || [];

        // =====================================
        // TOTALS
        // =====================================

        this.totalPatients =
          this.patients.length;

        this.totalCases =
          this.patients.length;

        this.totalAppointments =

          this.patients.filter((p)=>{

            return(
              p.followUpDate
            );

          }).length;

        // =====================================
        // MALE COUNT
        // =====================================

        this.maleCount =

          this.patients.filter((p)=>{

            return(

              p.sex
              ?.toLowerCase()
              ?.trim()

              ===

              'male'
            );

          }).length;

        // =====================================
        // FEMALE COUNT
        // =====================================

        this.femaleCount =

          this.patients.filter((p)=>{

            return(

              p.sex
              ?.toLowerCase()
              ?.trim()

              ===

              'female'
            );

          }).length;

        // =====================================
        // VALID GENDER TOTAL
        // =====================================

        const validGenderTotal =

          this.maleCount
          +
          this.femaleCount;

        // =====================================
        // DONUT GRAPH
        // =====================================

        if(validGenderTotal > 0){

          this.maleDegree =

            (
              this.maleCount
              / validGenderTotal
            ) * 360;

          this.femaleDegree =

            (
              this.femaleCount
              / validGenderTotal
            ) * 360;
        }

        // =====================================
        // AGE GROUPS
        // =====================================

        this.ageGroups.child =

          this.patients.filter((p)=>{

            return(
              p.age <= 18
            );

          }).length;

        this.ageGroups.youth =

          this.patients.filter((p)=>{

            return(

              p.age > 18

              &&

              p.age <= 30
            );

          }).length;

        this.ageGroups.adult =

          this.patients.filter((p)=>{

            return(

              p.age > 30

              &&

              p.age <= 45
            );

          }).length;

        this.ageGroups.middle =

          this.patients.filter((p)=>{

            return(

              p.age > 45

              &&

              p.age <= 60
            );

          }).length;

        this.ageGroups.senior =

          this.patients.filter((p)=>{

            return(
              p.age > 60
            );

          }).length;

        // =====================================
        // TOP CONDITIONS
        // =====================================

        const conditionMap:any = {};

        this.patients.forEach((p)=>{

          const condition =

            p.diagnosis
            || 'General';

          conditionMap[condition] =

            (conditionMap[condition] || 0)

            + 1;
        });

        this.topConditions =

          Object.entries(conditionMap)

          .map(([name,count])=>({

            name,

            count
          }))

          .sort((a:any,b:any)=>{

            return(
              b.count - a.count
            );

          })

          .slice(0,5);

        this.loading = false;
      },

      error:(error)=>{

        console.log(
          'PATIENT ERROR => ',
          error
        );

        this.loading = false;
      }
    });

    // =====================================
    // LOAD PRESCRIPTIONS
    // =====================================

    this.http.get<any[]>(

      'http://localhost:8080/api/prescriptions'

    ).subscribe({

      next:(prescriptions)=>{

        console.log(
          'PRESCRIPTIONS => ',
          prescriptions
        );

        this.prescriptions =
          prescriptions || [];

        this.totalPrescriptions =

          this.prescriptions.length;
      },

      error:(error)=>{

        console.log(
          'PRESCRIPTION ERROR => ',
          error
        );
      }
    });

    // =====================================
    // LOAD FOLLOWUPS
    // =====================================

    this.http.get<any[]>(

      'http://localhost:8080/api/followups'

    ).subscribe({

      next:(followups)=>{

        console.log(
          'FOLLOWUPS => ',
          followups
        );

        this.followups =
          followups || [];
      },

      error:(error)=>{

        console.log(
          'FOLLOWUP ERROR => ',
          error
        );
      }
    });
  }

  // =====================================
  // APPLY DATE FILTER
  // =====================================

  applyDateFilter() {

    if(
      !this.fromDate
      ||
      !this.toDate
    ){

      this.loadReports();

      return;
    }

    const from =
      new Date(this.fromDate);

    const to =
      new Date(this.toDate);

    const filteredPatients =

      this.patients.filter((p)=>{

        if(!p.createdAt){

          return false;
        }

        const createdDate =

          new Date(
            p.createdAt
          );

        return(

          createdDate >= from

          &&

          createdDate <= to
        );
      });

    this.totalPatients =
      filteredPatients.length;
  }

  // =====================================
  // EXPORT EXCEL
  // =====================================

  exportExcel() {

    const data =

      this.patients.map((p)=>({

        Patient_ID:
          p.patientCode,

        Name:
          p.name,

        Age:
          p.age,

        Gender:
          p.sex,

        Mobile:
          p.phoneNumber,

        Diagnosis:
          p.diagnosis,

        Complaints:
          p.presentingComplaints,

        Prescription:
          p.rx,

        Followup_Date:
          p.followUpDate,

        Address:
          p.address
      }));

    const worksheet =

      XLSX.utils.json_to_sheet(
        data
      );

    const workbook =

      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      'Patients'
    );

    XLSX.writeFile(

      workbook,

      'Sahithi_Clinic_Report.xlsx'
    );
  }

  // =====================================
  // EXPORT PDF
  // =====================================

 // =====================================
// EXPORT PDF
// =====================================

exportPDF() {

  try{

    const doc = new jsPDF({

      orientation:'landscape',

      unit:'mm',

      format:'a4'
    });

    // =====================================
    // HEADER
    // =====================================

    doc.setFillColor(
      22,
      101,
      52
    );

    doc.rect(
      0,
      0,
      300,
      30,
      'F'
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFontSize(24);

    doc.text(
      'SAHITHI HOMEOPATHY CLINIC',
      14,
      18
    );

    doc.setFontSize(11);

    doc.text(
      'Patient Complete Report',
      14,
      25
    );

    // =====================================
    // TABLE HEADER
    // =====================================

    let y = 42;

    const headers = [

      'PATIENT ID',
      'NAME',
      'AGE',
      'GENDER',
      'MOBILE'
    ];

    const colX = [

      14,
      70,
      150,
      180,
      220
    ];

    // HEADER BG

    doc.setFillColor(
      22,
      101,
      52
    );

    doc.roundedRect(
      10,
      y - 6,
      275,
      10,
      2,
      2,
      'F'
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFontSize(10);

    headers.forEach((header,index)=>{

      doc.text(
        header,
        colX[index],
        y
      );
    });

    y += 10;

    // =====================================
    // TABLE ROWS
    // =====================================

    this.patients.forEach((p,index)=>{

      // PAGE BREAK

      if(y > 185){

        doc.addPage();

        y = 20;
      }

      // ROW BACKGROUND

      if(index % 2 === 0){

        doc.setFillColor(
          241,
          248,
          244
        );

      }else{

        doc.setFillColor(
          255,
          255,
          255
        );
      }

      doc.roundedRect(
        10,
        y - 5,
        275,
        10,
        1,
        1,
        'F'
      );

      // BORDER

      doc.setDrawColor(
        220,
        220,
        220
      );

      doc.roundedRect(
        10,
        y - 5,
        275,
        10,
        1,
        1
      );

      // TEXT

      doc.setTextColor(
        50,
        50,
        50
      );

      doc.setFontSize(9);

      doc.text(
        String(
          p.patientCode || '-'
        ),
        14,
        y + 1
      );

      doc.text(
        String(
          p.name || '-'
        ).substring(0,20),
        70,
        y + 1
      );

      doc.text(
        String(
          p.age || '-'
        ),
        150,
        y + 1
      );

      doc.text(
        String(
          p.sex || '-'
        ),
        180,
        y + 1
      );

      doc.text(
        String(
          p.phoneNumber || '-'
        ),
        220,
        y + 1
      );

      y += 12;
    });

    // =====================================
    // FOOTER
    // =====================================

    doc.setFontSize(9);

    doc.setTextColor(
      120,
      120,
      120
    );

    doc.text(

      'Generated by Sahithi Homeopathy Clinic System',

      14,

      200
    );

    // =====================================
    // SAVE
    // =====================================

    doc.save(
      'Sahithi_Clinic_Report.pdf'
    );

  }catch(error){

    console.log(
      'PDF ERROR => ',
      error
    );

    alert(
      'PDF export failed'
    );
  }
}

  // =====================================
  // GET MAX CONDITION COUNT
  // =====================================

  getMaxConditionCount():number {

    if(
      this.topConditions.length === 0
    ){

      return 1;
    }

    return Math.max(

      ...this.topConditions.map((c)=>{

        return c.count;

      })
    );
  }

  // =====================================
  // GET BAR WIDTH
  // =====================================

  getBarWidth(count:number):number {

    const max =

      this.getMaxConditionCount();

    return(
      (count / max) * 100
    );
  }

}