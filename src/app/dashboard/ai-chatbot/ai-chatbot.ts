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

import OpenAI from 'openai';

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

  ) {}

  /* ===================================== */
  /* GROQ AI CLIENT */
  /* ===================================== */

  client = new OpenAI({

    apiKey:
      environment.GROQ_API_KEY,

    baseURL:
      environment.GROQ_API_URL,

    dangerouslyAllowBrowser: true
  });

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

  async analyzePatient() {

    /* ===================================== */
    /* VALIDATION */
    /* ===================================== */

    if (!this.patientId.trim()) {

      this.validationMessage =
        '⚠ Please enter Patient ID';

      return;
    }

    /* CLEAR VALIDATION */

    this.validationMessage = '';

    /* ===================================== */
    /* RESET */
    /* ===================================== */

    this.analysisResult = '';

    this.selectedPatient = null;

    this.isAnalyzing = true;

    this.analysisResult = `

🧠 Expert Homeopathy AI Analysis Started...

Loading patient data...
Analyzing constitutional symptoms...
Detecting miasmatic tendencies...
Generating remedy differentiation...
Preparing holistic recommendations...

`;

    this.cdr.detectChanges();

   

    this.http.get(

      `http://localhost:8080/api/patients/code/${this.patientId.trim().toLowerCase()}`

    ).subscribe({

      next: async (patient: any) => {

        console.log('PATIENT => ', patient);


        if (!patient) {

          this.validationMessage =
            '❌ Patient ID does not exist';

          this.analysisResult = '';

          this.selectedPatient = null;

          this.isAnalyzing = false;

          this.cdr.detectChanges();

          return;
        }

        /* ===================================== */
        /* UPDATE UI */
        /* ===================================== */

        this.selectedPatient = patient;

        this.validationMessage = '';

        this.cdr.detectChanges();

        try {

          /* ===================================== */
          /* AI PROMPT */
          /* ===================================== */

          const prompt = `

You are an internationally experienced senior AI Homeopathy Doctor
with deep expertise in:

• Classical Homeopathy
• Constitutional Homeopathy
• Acute & Chronic Disease Management
• Miasmatic Analysis
• Mental & Physical Symptom Correlation
• Remedy Differentiation
• Holistic Healing

Analyze the patient completely like an expert professional
homeopathy doctor.

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

==================================================

Generate a highly professional homeopathy clinical report.

Include:

1. Constitutional Analysis

2. Disease Pattern Analysis

3. Root Cause Analysis

4. Acute vs Chronic Evaluation

5. Miasmatic Tendency Analysis

6. Mental & Emotional Correlation

7. Trigger Factors

8. Remedy Differentiation

9. Best Homeopathy Medicines

10. Potency Recommendations

11. Dosage & Repetition

12. Diet Restrictions

13. Lifestyle Modifications

14. Recovery Timeline

15. Follow-up Recommendations

16. Emergency Symptoms

17. Long-Term Prevention Advice

18. Prognosis

19. Holistic Healing Advice

20. Final Clinical Summary

==================================================

IMPORTANT RULES

• Focus ONLY on homeopathy
• Recommend ONLY homeopathy medicines
• Mention potency properly (30C, 200C, 1M etc.)
• Mention dosage professionally
• Keep report medically structured
• Keep response attractive and readable
• Use professional clinical language
• Add bullet points where needed
• Mention:
"Doctor verification required before treatment."

==================================================

`;

          /* ===================================== */
          /* GROQ AI CALL */
          /* ===================================== */

          const completion = await this.client.chat.completions.create({

            model:
              'llama-3.3-70b-versatile',

            messages: [

              {

                role: 'user',

                content: prompt
              }

            ],

            temperature: 0.3,

            max_tokens: 700
          });

          /* ===================================== */
          /* FINAL RESPONSE */
          /* ===================================== */

         this.analysisResult =

          completion?.choices?.[0]?.message?.content

          ?.replace(/\*\*/g, '')

          ?.replace(/\*/g, '•')

          ?.replace(/#{1,6}/g, '')

          ?.replace(/\n{3,}/g, '\n\n')

          ||

          '✅ Homeopathy AI analysis completed';

          this.isAnalyzing = false;

          this.cdr.detectChanges();

        }

        catch (error) {

          console.error(error);

          this.analysisResult =

            '❌ Homeopathy AI service unavailable';

          this.isAnalyzing = false;

          this.cdr.detectChanges();
        }
      },

      /* ===================================== */
      /* API ERROR */
      /* ===================================== */

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

  async sendMessage() {

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

    try {

      const completion = await this.client.chat.completions.create({

        model:
          'llama-3.3-70b-versatile',

        messages: [

          {

            role: 'user',

            content: `

You are an expert senior homeopathy doctor.

Answer ONLY related to homeopathy.

Provide:

• Homeopathy medicines
• Potency recommendations
• Dosage advice
• Diet restrictions
• Lifestyle guidance
• Trigger factors
• Follow-up advice
• Holistic healing recommendations

Question:
${question}

Rules:

• Focus only on homeopathy
• Keep response professional
• Keep response concise
• Mention doctor verification required

`
          }

        ],

        temperature: 0.4,

        max_tokens: 300
      });

      loadingMessage.text =

        completion?.choices?.[0]?.message?.content ||

        'AI response received';

      this.cdr.detectChanges();

    }

    catch (error) {

      console.error(error);

      loadingMessage.text =
        '❌ Homeopathy AI unavailable';

      this.cdr.detectChanges();
    }
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

  /* ===================================== */
  /* CURRENT TIME */
  /* ===================================== */

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