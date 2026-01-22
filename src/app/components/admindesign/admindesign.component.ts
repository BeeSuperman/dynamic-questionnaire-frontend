// import { Component, OnInit } from '@angular/core';
// import { CommonModule, DatePipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { QuestionnaireService } from '../../services/questionnaire.service';
// import { Questionnaire, Question } from '../../models/questionnaire.model';

// @Component({
//   selector: 'app-admindesign',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   providers: [DatePipe],
//   templateUrl: './admindesign.component.html',
//   styleUrls: ['./admindesign.component.scss']
// })
// export class AdmindesignComponent implements OnInit {
//   // --- 1. 核心資料模型 ---
//   questionnaire: Questionnaire = {
//     id: 0,
//     title: '',
//     description: '',
//     status: 'unpublished', // 預設狀態為未發佈
//     startTime: new Date(),
//     endTime: new Date(),
//     questions: []
//   };

//   // 控制當前顯示的頁籤：info(問卷), questions(題目), confirm(預覽確認)
//   activeTab = 'info';
//   isEditMode = false;
//   todayStr: string = '';

//   // --- 2. 題目設計 (界面 2) 用的暫存變數 ---
//   isModalOpen = false; // 控制彈窗顯示
//   editingQuestionIndex: number | null = null; // 區分新增或編輯題目
//   currentEditQuestion: Question = {
//     id: 0,
//     title: '',
//     type: 'single',
//     required: false,
//     options: []
//   };

//   constructor(
//     private route: ActivatedRoute,
//     public router: Router, // 設為 public 讓 HTML 可以調用跳轉方法
//     private qService: QuestionnaireService,
//     private datePipe: DatePipe
//   ) {
//     // 取得今日日期字串用於 min 屬性限制
//     this.todayStr = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
//   }

//   ngOnInit(): void {
//     // 根據路由參數 ID 判斷是新增還是編輯模式
//     const id = this.route.snapshot.queryParams['id'];
//     if (id) {
//       this.isEditMode = true;
//       const data = this.qService.getQuestionnaireById(Number(id));
//       if (data) {
//         // 帶入原有資料並確保日期格式正確
//         this.questionnaire = JSON.parse(JSON.stringify(data));
//         this.questionnaire.startTime = new Date(this.questionnaire.startTime);
//         this.questionnaire.endTime = new Date(this.questionnaire.endTime);
//       }
//     } else {
//       // 新增模式預設日期為今日
//       this.isEditMode = false;
//       this.questionnaire.startTime = new Date();
//       this.questionnaire.endTime = new Date();
//     }
//   }

//   // --- 3. 基礎工具與跳轉邏輯 ---
//   formatDate(date: Date): string {
//     return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
//   }

//   onDateChange(field: 'start' | 'end', value: string) {
//     if (field === 'start') this.questionnaire.startTime = new Date(value);
//     else this.questionnaire.endTime = new Date(value);
//   }

//   // 返回管理列表
//   cancel() {
//     this.router.navigate(['/adminlist']);
//   }

//   // 進入題目頁籤前的檢查
//   nextStep() {
//     if (!this.questionnaire.title.trim() || !this.questionnaire.description.trim()) {
//       alert('問卷名稱與說明為必填！');
//       return;
//     }
//     this.activeTab = 'questions';
//   }

//   // --- 4. 題目設計 (界面 1 & 2) 邏輯 ---

//   // 開啟新增彈窗
//   openAddModal() {
//     this.editingQuestionIndex = null;
//     this.currentEditQuestion = {
//       id: Date.now(),
//       title: '',
//       type: 'single',
//       required: false,
//       options: [{id: 1, content: ''}]
//     };
//     this.isModalOpen = true;
//   }

//   // 開啟編輯彈窗
//   editQuestion(index: number) {
//     this.editingQuestionIndex = index;
//     this.currentEditQuestion = JSON.parse(JSON.stringify(this.questionnaire.questions[index]));
//     this.isModalOpen = true;
//   }

//   // 彈窗確定：將資料存入問卷問題陣列
//   confirmQuestion() {
//     if (!this.currentEditQuestion.title.trim()) {
//       alert('請輸入題目名稱');
//       return;
//     }
//     if (this.editingQuestionIndex !== null) {
//       // 編輯現有問題
//       this.questionnaire.questions[this.editingQuestionIndex] = JSON.parse(JSON.stringify(this.currentEditQuestion));
//     } else {
//       // 新增問題
//       this.questionnaire.questions.push(JSON.parse(JSON.stringify(this.currentEditQuestion)));
//     }
//     this.isModalOpen = false;
//   }

//   // 刪除題目
//   deleteQuestion(index: number) {
//     this.questionnaire.questions.splice(index, 1);
//   }

//   // 彈窗內新增選項
//   addOption() {
//     const newId = (this.currentEditQuestion.options?.length || 0) + 1;
//     this.currentEditQuestion.options?.push({ id: newId, content: '' });
//   }

//   // --- 5. 預覽確認與最終儲存邏輯 ---

//   // 跳轉至確認頁籤
//   goToConfirm() {
//     if (this.questionnaire.questions.length === 0) {
//       alert('請至少加入一個題目！');
//       return;
//     }
//     this.activeTab = 'confirm';
//   }

//   // 最終寫入 SessionStorage
//   finalSave(isPublish: boolean) {
//     // 僅儲存 (unpublished) 或 儲存並發佈 (not_started)
//     this.questionnaire.status = isPublish ? 'not_started' : 'unpublished';
//     this.qService.saveQuestionnaire(this.questionnaire);
//     alert('儲存成功！');
//     this.router.navigate(['/adminlist']);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { Questionnaire, Question } from '../../models/questionnaire.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admindesign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './admindesign.component.html',
  styleUrls: ['./admindesign.component.scss']
})
export class AdmindesignComponent implements OnInit {
  questionnaire: Questionnaire = {
    id: 0,
    title: '',
    description: '',
    status: 'unpublished',
    startTime: new Date(),
    endTime: new Date(),
    questions: []
  };

  activeTab = 'info';
  isEditMode = false;
  todayStr: string = '';
  isModalOpen = false;
  editingQuestionIndex: number | null = null;
  currentEditQuestion: Question = {
    id: 0,
    title: '',
    type: 'single',
    required: false,
    options: []
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private qService: QuestionnaireService,
    private datePipe: DatePipe
  ) {
    this.todayStr = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParams['id'];
    if (id) {
      this.isEditMode = true;
      const data = this.qService.getQuestionnaireById(Number(id));
      if (data) {
        this.questionnaire = JSON.parse(JSON.stringify(data));
        this.questionnaire.startTime = new Date(this.questionnaire.startTime);
        this.questionnaire.endTime = new Date(this.questionnaire.endTime);
      }
    } else {
      this.isEditMode = false;
      this.questionnaire.startTime = new Date();
      this.questionnaire.endTime = new Date();
    }
  }

  /** 通用美化提示彈窗 */
  private showHint(msg: string, icon: any = 'warning') {
    (Swal as any).fire({
      title: '提示',
      text: msg,
      icon: icon,
      confirmButtonColor: '#8b2d2d',
      confirmButtonText: '確定',
      width: '400px',
      padding: '1.5rem',
      borderRadius: '12px'
    });
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  onDateChange(field: 'start' | 'end', value: string) {
    if (field === 'start') this.questionnaire.startTime = new Date(value);
    else this.questionnaire.endTime = new Date(value);
  }

  cancel() {
    this.router.navigate(['/adminlist']);
  }

  nextStep() {
    if (!this.questionnaire.title.trim() || !this.questionnaire.description.trim()) {
      this.showHint('問卷名稱與說明為必填！');
      return;
    }
    this.activeTab = 'questions';
  }

  openAddModal() {
    this.editingQuestionIndex = null;
    this.currentEditQuestion = {
      id: Date.now(),
      title: '',
      type: 'single',
      required: false,
      options: [{id: 1, content: ''}]
    };
    this.isModalOpen = true;
  }

  editQuestion(index: number) {
    this.editingQuestionIndex = index;
    this.currentEditQuestion = JSON.parse(JSON.stringify(this.questionnaire.questions[index]));
    this.isModalOpen = true;
  }

  confirmQuestion() {
    if (!this.currentEditQuestion.title.trim()) {
      this.showHint('請輸入題目名稱');
      return;
    }
    if (this.editingQuestionIndex !== null) {
      this.questionnaire.questions[this.editingQuestionIndex] = JSON.parse(JSON.stringify(this.currentEditQuestion));
    } else {
      this.questionnaire.questions.push(JSON.parse(JSON.stringify(this.currentEditQuestion)));
    }
    this.isModalOpen = false;
  }

  deleteQuestion(index: number) {
    this.questionnaire.questions.splice(index, 1);
  }

  addOption() {
    const newId = (this.currentEditQuestion.options?.length || 0) + 1;
    this.currentEditQuestion.options?.push({ id: newId, content: '' });
  }

  goToConfirm() {
    if (this.questionnaire.questions.length === 0) {
      this.showHint('請至少加入一個題目！');
      return;
    }
    this.activeTab = 'confirm';
  }

  finalSave(isPublish: boolean) {
    this.questionnaire.status = isPublish ? 'not_started' : 'unpublished';
    this.qService.saveQuestionnaire(this.questionnaire);

    (Swal as any).fire({
      title: '儲存成功！',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      width: '400px'
    }).then(() => {
      this.router.navigate(['/adminlist']);
    });
  }
}
