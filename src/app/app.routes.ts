import { Routes } from '@angular/router';
import { ListComponent } from './components/list/list.component';
import { StatisticComponent } from './components/statistic/statistic.component';
import { AdminlistComponent } from './components/adminlist/adminlist.component';
import { AdmindesignComponent } from './components/admindesign/admindesign.component';
import { QuestionnaireFillComponent } from './components/questionnaire-fill/questionnaire-fill.component';
import { QuestionnaireConfirmComponent } from './components/questionnaire-confirm/questionnaire-confirm.component';
import { AdminresultComponent } from './components/adminresult/adminresult.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { MemberProfileComponent } from './components/member-profile/member-profile.component';

export const routes: Routes = [
  // ==================== [ 第一層：開放頁面 ] ====================
  // 這些頁面任何人都可以進去，不需要守衛
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'list', component: ListComponent },
  { path: 'statistic/:id', component: StatisticComponent },
  { path: 'questionnaire/:id', component: QuestionnaireFillComponent },
  { path: 'questionnaire/confirm/:id', component: QuestionnaireConfirmComponent },

  // ==================== [ 第二層：受保護頁面 ] ====================
  // 進入這些頁面前必須通過 authGuard 檢查
  {
    path: 'adminlist',
    component: AdminlistComponent,
    canActivate: [authGuard]
  },
  {
    path: 'adminlist/design',
    component: AdmindesignComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/results/:id',
    component: AdminresultComponent,
    canActivate: [authGuard]
  },
  {
    path: 'member-profile',
    component: MemberProfileComponent,
    canActivate: [authGuard]
  },

  // ==================== [ 第三層：重定向與錯誤處理 ] ====================

  // 1. 當網址完全為空 (http://localhost:4200/) 時，自動跳到登入頁
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // 2. 後台路徑防呆：如果輸入 adminlist/ 開頭但不存在的路徑，跳回後台列表
  { path: 'adminlist/**', redirectTo: '/adminlist' },

  // 3. 全域防呆：如果網址亂打，一律跳回前台列表 (或你可以改成跳回登入)
  { path: '**', redirectTo: '/list' }
];
