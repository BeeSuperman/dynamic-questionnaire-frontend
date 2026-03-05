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
      this.qService.getQuestionnaireById(Number(id)).subscribe({
        next: (res) => {
          // res 從 Service 過來已經是經過 map 轉換後的物件 (包含 startTime/endTime Date)
          // 或者是原始 response (但我們在 Service 做了 map)
          // 如果 Service map 成功，res 就是那個物件
          // 如果 Service map 失敗或沒做，res 是 {code, quiz...}

          let data = res;
          // 雙重檢查：如果還包在 quiz 裡，就拿出來
          if (res.quiz) {
            data = res.quiz;
          }

          if (data) {
            // 深拷貝一份
            this.questionnaire = JSON.parse(JSON.stringify(data));

            // 處理日期：優先使用 map 過後的 startTime
            // 如果沒有 startTime，試著用 startDate 轉
            if (this.questionnaire.startTime) {
              this.questionnaire.startTime = new Date(this.questionnaire.startTime);
            } else if ((this.questionnaire as any).startDate) {
              this.questionnaire.startTime = new Date((this.questionnaire as any).startDate);
            }

            if (this.questionnaire.endTime) {
              this.questionnaire.endTime = new Date(this.questionnaire.endTime);
            } else if ((this.questionnaire as any).endDate) {
              this.questionnaire.endTime = new Date((this.questionnaire as any).endDate);
            }

            // [修正] 對應後端欄位：questionList -> questions
            if ((data as any).questionList) {
              this.questionnaire.questions = (data as any).questionList;
            }

            // [新增] 確保 questions 陣列存在
            this.questionnaire.questions = this.questionnaire.questions || [];

            // [轉換] 選項字串轉陣列
            this.questionnaire.questions.forEach(q => {
              // [新增] 修正 title 欄位 (後端叫 question)
              if (!q.title && (q as any).question) {
                q.title = (q as any).question;
              }

              if (typeof q.options === 'string') {
                const optStr = q.options as string;
                q.options = optStr.split(';').map((val, idx) => ({ id: idx + 1, content: val }));
              }
              // [轉換] type 大小寫
              if (q.type) q.type = q.type.toLowerCase() as any;
            });
          }
        },
        error: (err) => {
          console.error(err);
          this.showHint('無法載入問卷資料', 'error');
          this.router.navigate(['/adminlist']);
        }
      });
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
      options: [{ id: 1, content: '' }]
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
    // 檢查選項
    if (this.currentEditQuestion.type !== 'text') {
      if (!this.currentEditQuestion.options || this.currentEditQuestion.options.length === 0) {
        this.showHint('選擇題至少要有一個選項');
        return;
      }
      // 過濾掉空選項
      this.currentEditQuestion.options = this.currentEditQuestion.options.filter(o => o.content.trim() !== '');
      if (this.currentEditQuestion.options.length === 0) {
        this.showHint('選擇題至少要有一個有效選項');
        return;
      }
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
    // 1. 設定狀態
    this.questionnaire.status = isPublish ? 'not_started' : 'unpublished';

    // 2. [轉換資料] 前端 -> 後端
    const questionListForBackend = this.questionnaire.questions.map((q, index) => {
      let optionsString = '';
      if (q.type !== 'text' && q.options) {
        optionsString = q.options.map(o => o.content).join(';');
      }

      let backendType = 'Single';
      if (q.type === 'single') backendType = 'Single';
      else if (q.type === 'multiple') backendType = 'Multi';
      else if (q.type === 'text') backendType = 'Text';

      return {
        questionId: index + 1,
        quizId: this.questionnaire.id,
        question: q.title,
        type: backendType,
        required: q.required,
        options: optionsString
      } as any;
    });

    // 3. 準備 Payload
    const baseParam = {
      title: this.questionnaire.title,
      description: this.questionnaire.description,
      startDate: this.formatDate(this.questionnaire.startTime),
      endDate: this.formatDate(this.questionnaire.endTime),
      published: isPublish,
      questionList: questionListForBackend
    };

    if (this.isEditMode && this.questionnaire.id > 0) {
      const updateParam = { ...baseParam, quizId: this.questionnaire.id };
      this.qService.updateQuiz(updateParam).subscribe({
        next: (res) => {
          if (res.code === 200 || res.message?.includes('Success')) {
            this.handleSuccess('更新成功！');
          } else {
            this.showHint(res.message || '更新失敗', 'error');
          }
        },
        error: (err) => {
          console.error('更新失敗:', err);
          this.showHint('更新失敗: ' + err.message, 'error');
        }
      });
    } else {
      this.qService.createQuiz(baseParam).subscribe({
        next: (res) => {
          if (res.code === 200 || res.message?.includes('Success')) {
            this.handleSuccess('新增成功！');
          } else {
            this.showHint(res.message || '新增失敗', 'error');
          }
        },
        error: (err) => {
          console.error('新增失敗:', err);
          this.showHint('新增失敗: ' + err.message, 'error');
        }
      });
    }
  }

  private handleSuccess(msg: string) {
    (Swal as any).fire({
      title: msg,
      text: '資料已傳送至後端',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      this.router.navigate(['/adminlist']);
    });
  }
}
