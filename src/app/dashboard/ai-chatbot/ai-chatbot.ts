import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';



import {
  environment
} from '../../../environments/environment';

@Component({

  selector: 'app-ai-chatbot',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],

  templateUrl: './ai-chatbot.html',

  styleUrls: ['./ai-chatbot.css']
})

export class AiChatbotComponent {

  constructor(

    private http: HttpClient,

    private cdr: ChangeDetectorRef

  ) {
     
  }

  /* ===================================== */
  /* GROQ AI CLIENT */
  /* ===================================== */



  /* ===================================== */
  /* VARIABLES */
  /* ===================================== */

  patientId = '';

  selectedPatient: any = null;

  analysisResult = '';

  isAnalyzing = false;

  showChatPopup = true;
  showDoctorChat = false;

  validationMessage = '';

  userMessage = '';

  patientQuestion = '';

  patientChatMessages: any[] = [
    {
      role: 'assistant',
      text:
        '👋 Ask me anything about this patient. I can explain the analysis report, remedies, potency, followups, prognosis and lifestyle recommendations.'
    }
  ];

  isPatientChatLoading = false;

  reportSections: any[] = [];

  /* ===================================== */
  /* CHAT MESSAGES */
  /* ===================================== */

  messages: any[] = [

    {

      role: 'assistant',

      text:
`👋 Welcome Doctor

I am your Expert AI Homeopathy Assistant.

You can:

• Analyze constitutional patterns
• Get homeopathy medicine suggestions
• Get potency recommendations
• Get dosage advice
• Get miasmatic analysis
• Get diet restrictions
• Get lifestyle guidance
• Get holistic healing recommendations`,

      time: this.getCurrentTime()
    }

  ];

  /* ===================================== */
  /* ANALYZE PATIENT */
  /* ===================================== */
analyzePatient() {

  if (!this.patientId.trim()) {

    this.validationMessage =
      '⚠ Please enter Patient ID';

    return;
  }

  this.validationMessage = '';

  this.analysisResult = '';

  this.selectedPatient = null;

  this.isAnalyzing = true;

  this.analysisResult = `

🧠 Expert Homeopathy AI Analysis Started...

Loading patient data...
Checking followup history...
Analyzing constitutional symptoms...
Detecting miasmatic tendencies...
Generating remedy differentiation...
Preparing holistic recommendations...

`;

  this.cdr.detectChanges();

  this.http.get<any>(
    `${environment.apiUrl}/api/patients/code/${this.patientId.trim().toLowerCase()}`
  ).subscribe({

    next: (patient: any) => {

      if (!patient) {

        this.validationMessage =
          '❌ Patient ID does not exist';

        this.analysisResult = '';

        this.selectedPatient = null;

        this.isAnalyzing = false;

        this.cdr.detectChanges();

        return;
      }

      this.selectedPatient = patient;

      this.validationMessage = '';

      this.http.get<any[]>(
        `${environment.apiUrl}/api/followups/patient/${patient.id}`
      ).subscribe({

        next: (followups: any[]) => {

          let followupText = '';

          if (
            followups &&
            followups.length > 0
          ) {

            followupText = `

==================================================

FOLLOWUP HISTORY ANALYSIS

Patient has followup history.

Analyze:
• improvement progression
• medicine response
• remedy effectiveness
• symptom evolution
• constitutional changes
• prognosis improvement
• remedy repetition suitability
• potency adjustment necessity

`;

            followups.forEach((f, index) => {

              followupText += `

----------------------------------------

FOLLOWUP ${index + 1}

Date:
${f.nextFollowupDate}

Improvement Status:
${f.improvementStatus}

Symptoms:
${f.symptoms}

Observations:
${f.observations}

Medicines:
${f.medicines}

Doctor Notes:
${f.doctorNotes}

`;
            });

          } else {

            followupText = `

==================================================

NO FOLLOWUP HISTORY AVAILABLE

Analyze based only on
initial constitutional case.

`;
          }

          const prompt = `

You are an internationally experienced
senior AI Homeopathy Doctor.

Expertise:

• Classical Homeopathy
• Constitutional Homeopathy
• Acute & Chronic Disease
• Miasmatic Analysis
• Remedy Differentiation
• Followup Evaluation
• Remedy Progress Analysis
• Potency Adjustment

==================================================

PATIENT DETAILS

Patient Name:
${patient?.name}

Age:
${patient?.age}

Gender:
${patient?.sex}

Phone Number:
${patient?.phoneNumber}

Presenting Complaints:
${patient?.presentingComplaints}

History of Present Illness:
${patient?.historyPresentIllness}

Diagnosis:
${patient?.diagnosis}

Mental Generals:
${patient?.mentalGenerals}

Past Medical History:
${patient?.pastMedicalHistory}

Family History:
${patient?.familyHistory}

Thermals:
${patient?.thermals}

Sleep:
${patient?.sleep}

Appetite:
${patient?.appetite}

Thirst:
${patient?.thirst}

Desires:
${patient?.desires}

Aversions:
${patient?.aversions}

Current Prescription:
${patient?.rx}

${followupText}

==================================================

GENERATE PROFESSIONAL ANALYSIS

IMPORTANT:

Do NOT write:

Professional Analysis

Start directly with:

1. Constitutional Analysis

2. Disease Evolution Analysis

3. Followup Progress Evaluation

4. Remedy Effectiveness Analysis

5. Symptom Change Analysis

6. Miasmatic Analysis

7. Remedy Differentiation

8. Potency Adjustment Suggestions

9. Future Remedy Planning

10. Prognosis Evaluation

11. Recovery Progress

12. Relapse Risk

13. Diet Restrictions

14. Lifestyle Advice

15. Followup Recommendations

16. Holistic Healing Advice

17. Long-Term Prevention

18. Final Clinical Summary

==================================================

IMPORTANT RULES

• Focus ONLY on homeopathy
• Mention ONLY homeopathy remedies
• Mention potencies properly
• Mention dosage professionally
• Analyze followup progression carefully
• Compare old symptoms vs new symptoms
• Mention whether patient improving or worsening
• Mention whether remedy should continue/change
• Mention constitutional remedy possibilities
• Keep response highly professional

Add:
"Doctor verification required before treatment."

==================================================

`;

          this.http.post<any>(
            `${environment.apiUrl}/api/ai/analyze`,
            {
              patientData: prompt
            }
          ).subscribe({

            next: (response) => {

              this.analysisResult =
                response.reply
                  ?.replace(/\*\*/g, '')
                  ?.replace(/\*/g, '•')
                  ?.replace(/#{1,6}/g, '')
                  ?.replace(/\n{3,}/g, '\n\n')
                || 'Analysis completed';

              this.formatReport();

              this.isAnalyzing = false;

              this.cdr.detectChanges();
            },

            error: () => {

              this.analysisResult =
                '❌ AI analysis unavailable';

              this.isAnalyzing = false;

              this.cdr.detectChanges();
            }
          });
        },

        error: (error) => {

          console.log(
            'FOLLOWUP ERROR => ',
            error
          );

          this.analysisResult =
            '❌ Failed to load followup history';

          this.isAnalyzing = false;

          this.cdr.detectChanges();
        }
      });
    },

    error: (err) => {

      console.error(err);

      this.validationMessage =
        '❌ Patient ID does not exist';

      this.analysisResult = '';

      this.selectedPatient = null;

      this.isAnalyzing = false;

      this.cdr.detectChanges();
    }
  });
}

  /* ===================================== */
  /* TOGGLE CHAT */
  /* ===================================== */

  toggleChatPopup(): void {

    this.showChatPopup =
      !this.showChatPopup;
  }

  toggleDoctorChat(): void {

  this.showDoctorChat =
    !this.showDoctorChat;
}

  /* ===================================== */
  /* SEND MESSAGE */
  /* ===================================== */

sendMessage() {

    if (!this.userMessage.trim()) {

      return;
    }

    const question =
      this.userMessage.trim();

    /* USER MESSAGE */

    this.messages.push({

      role: 'user',

      text: question,

      time: this.getCurrentTime()
    });

    this.userMessage = '';

    /* AI LOADING */

    const loadingMessage = {

      role: 'assistant',

      text:
        '🧠 Expert Homeopathy AI is thinking...',

      time: this.getCurrentTime()
    };

    this.messages.push(loadingMessage);

    this.cdr.detectChanges();

    this.http.post<any>(
  `${environment.apiUrl}/api/ai/chat`,
  {
    message: question
  }
).subscribe({

  next: (response) => {

    loadingMessage.text =
      response.reply;

    this.cdr.detectChanges();
  },

  error: () => {

    loadingMessage.text =
      '❌ AI unavailable';

    this.cdr.detectChanges();
  }
});
}

  /* ===================================== */
  /* QUICK QUESTIONS */
  /* ===================================== */

  askQuickQuestion(
    question: string
  ) {

    this.userMessage = question;

    this.sendMessage();
  }

  /* ===================================== */
  /* ENTER KEY */
  /* ===================================== */

  onEnter(
    event: KeyboardEvent
  ) {

    if (

      event.key === 'Enter'

      &&

      !event.shiftKey

    ) {

      event.preventDefault();

      this.sendMessage();
    }
  }

  /* ===================================== */
  /* CLEAR CHAT */
  /* ===================================== */

  clearChat() {

    this.messages = [

      {

        role: 'assistant',

        text:
          '👋 Chat cleared successfully.',

        time: this.getCurrentTime()
      }

    ];
  }

askPatientQuestion() {

  if (!this.patientQuestion.trim()) {
    return;
  }

  const question = this.patientQuestion.trim();

  this.patientChatMessages.push({
    role: 'user',
    text: question
  });

  this.patientQuestion = '';

  this.isPatientChatLoading = true;

  this.cdr.detectChanges();


   this.http.post<any>(
  `${environment.apiUrl}/api/ai/chat`,
  {
    message: `
Patient Details:
${JSON.stringify(this.selectedPatient)}

Clinical Analysis:
${this.analysisResult}

Question:
${question}
`
  }
).subscribe({

  next:(response)=>{

    this.patientChatMessages.push({

      role:'assistant',

      text:response.reply
    });

    this.isPatientChatLoading = false;

    this.cdr.detectChanges();
  },

  error:()=>{

    this.patientChatMessages.push({

      role:'assistant',

      text:'❌ AI unavailable.'
    });

    this.isPatientChatLoading = false;

    this.cdr.detectChanges();
  }
});
  }

onPatientChatEnter(
  event: KeyboardEvent
) {

  if (
    event.key === 'Enter'
    &&
    !event.shiftKey
  ) {

    event.preventDefault();

    this.askPatientQuestion();
  }
}

  /* ===================================== */
  /* CURRENT TIME */
  /* ===================================== */
    formatReport() {

      if (!this.analysisResult) {
        return;
      }

      const cleanedText =
        this.analysisResult
          .replace(/Professional Analysis/gi, '')
          .trim();

      const sections =
        cleanedText
          .split(/\d+\./)
          .filter(section => section.trim());

      this.reportSections =
        sections
          .map(section => {

            const idx =
              section.indexOf(':');

            if (idx === -1) {

              return null;
            }

            return {

              title:
                section
                  .substring(0, idx)
                  .trim(),

              content:
                section
                  .substring(idx + 1)
                  .trim()

            };

          })
          .filter(section =>
            section &&
            section.title &&
            section.content
          );

      console.log(
        'REPORT SECTIONS =>',
        this.reportSections
      );
    }

  getCurrentTime(): string {

    return new Date().toLocaleTimeString(

      [],

      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

}