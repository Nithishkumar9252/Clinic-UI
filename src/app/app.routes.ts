import { Routes } from '@angular/router';

import { LoginComponent }
from './auth/login/login';

import { SignupComponent }
from './auth/signup/signup';

import { LayoutComponent }
from './dashboard/layout/layout';

import { HomeComponent }
from './dashboard/home/home';

import { PatientsComponent }
from './dashboard/patients/patients';

import { FollowupsComponent }
from './dashboard/followups/followups';

import { PrescriptionsComponent }
from './dashboard/prescriptions/prescriptions';

import { authGuard }
from './core/guards/auth-guard';

import { AiChatbotComponent }
from './dashboard/ai-chatbot/ai-chatbot';
import { ReportsComponent } from './dashboard/reports/reports';

export const routes: Routes = [

  // DEFAULT

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // LOGIN

  {
    path: 'login',
    component: LoginComponent
  },

  // SIGNUP

  {
    path: 'signup',
    component: SignupComponent
  },

  // DASHBOARD LAYOUT

  {
    path: '',
    component: LayoutComponent,

    children: [

      {
        path: 'dashboard',
        component: HomeComponent,
        canActivate: [authGuard]
      },

      {
        path: 'patients',
        component: PatientsComponent,
        canActivate: [authGuard]
      },

      // FOLLOWUPS

      {
        path: 'followups',
        component: FollowupsComponent,
        canActivate: [authGuard]
      },

      {
        path:'prescriptions',
        component:PrescriptionsComponent,
        canActivate:[authGuard]
      },
      {
        path:'reports',
        component:ReportsComponent,
        canActivate:[authGuard]
      },

      // AI CHATBOT

      {
        path:'ai-chatbot',
        component:AiChatbotComponent
      }

    ]
  },

  // FALLBACK

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];