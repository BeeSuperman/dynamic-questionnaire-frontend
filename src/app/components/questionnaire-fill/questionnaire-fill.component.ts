// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { QuestionnaireService } from '../../services/questionnaire.service';
// import { Questionnaire, QuestionnaireAnswer } from '../../models/questionnaire.model';

// @Component({
//   selector: 'app-questionnaire-fill',
//   standalone: true, // 如果你是 Angular 17+
//   imports: [CommonModule, FormsModule],
//   templateUrl: './questionnaire-fill.component.html',
//   styleUrl: './questionnaire-fill.component.scss'
// })
// export class QuestionnaireFillComponent implements OnInit {
//  // 當前正在填寫的問卷定義
//   questionnaire?: Questionnaire;

//   // 用戶填寫的個人資料與答案資料模型
//   userAnswer: QuestionnaireAnswer = {
//     questionnaireId: 0,
//     username: '',
//     phone: '',
//     email: '',
//     age: undefined,
//     answers: [] // 這裡會存放動態問題的答案
//   };

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private qService: QuestionnaireService
//   ) {}

//   ngOnInit(): void {
//     // 1. 從路由取得問卷 ID (例如: /questionnaire/1)
//     const id = Number(this.route.snapshot.paramMap.get('id'));
//     const data = this.qService.getQuestionnaireById(id);

//     // 2. 檢查問卷是否存在且是否為「進行中」
//     if (data) {
//       this.questionnaire = data;
//       this.userAnswer.questionnaireId = data.id;

//       // 3. 檢查是否有先前「暫存」的答案（回上一頁修改時用）[cite: 128]
//       const temp = this.qService.getTempAnswer();
//       if (temp && temp.questionnaireId === id) {
//         this.userAnswer = temp;
//       } else {
//         // 初始化動態問題的答案空間
//         this.userAnswer.answers = data.questions.map(q => ({
//           questionId: q.id,
//           value: q.type === 'multiple' ? [] : '' // 多選題用陣列，其他用字串
//         }));
//       }
//     } else {
//       alert('問卷不存在！');
//       this.router.navigate(['/list']);
//     }
//   }

//   /**
//    * 處理多選題 (Checkbox) 的選擇邏輯 [cite: 73]
//    */
//   onCheckboxChange(questionId: number, optionContent: string, event: any) {
//     const questionAnswer = this.userAnswer.answers.find(a => a.questionId === questionId);
//     if (questionAnswer && Array.isArray(questionAnswer.value)) {
//       if (event.target.checked) {
//         questionAnswer.value.push(optionContent); // 勾選：加入陣列
//       } else {
//         const index = questionAnswer.value.indexOf(optionContent);
//         if (index > -1) questionAnswer.value.splice(index, 1); // 取消：移出陣列
//       }
//     }
//   }

//   /**
//    * 點擊「送出」按鈕
//    */
//   onSubmit() {
//     // 1. 基礎校驗：必填檢查
//   if (!this.userAnswer.username || !this.userAnswer.phone || !this.userAnswer.email) {
//     alert('請填寫必填的個人資訊 (姓名、手機、Email)！');
//     return;
//   }
//   // 2. [核心功能] Email 格式合法性檢查 (使用 Regex)
//     // 規定：必須包含 @，且 @ 後面必須有網域 (如 .com)
//     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     if (!emailPattern.test(this.userAnswer.email)) {
//       alert('郵箱格式不正確，必須包含 @ 且為有效的郵件地址！');
//       return; // 格式不對就攔截，不往下執行
//     }

//   // --- 新增：Email 重複填寫檢查  ---
//   if (this.questionnaire) {
//     const isDuplicate = this.qService.isEmailSubmited(
//       this.questionnaire.id,
//       this.userAnswer.email
//     );

//     if (isDuplicate) {
//       alert('此 Email 已經填寫過這份問卷，請勿重複提交！');
//       return; // 阻斷後續邏輯，不跳轉到確認頁
//     }
//   }


//   // 2. 動態問題必填檢查
//   for (let q of this.questionnaire?.questions || []) {
//     const ans = this.userAnswer.answers.find(a => a.questionId === q.id);
//     if (q.required && (!ans?.value || (Array.isArray(ans.value) && ans.value.length === 0))) {
//       alert(`請填寫必填問題：${q.title}`);
//       return;
//     }
//   }

//   // 3. 呼叫 Service 暫存到 Session [cite: 75]
//   this.qService.setTempAnswer(this.userAnswer);

//   // 4. 跳轉到確認頁 [cite: 104]
//   this.router.navigate(['/questionnaire/confirm', this.questionnaire?.id]);
// }

//   /**
//    * 點擊「取消」或返回 [cite: 105, 106]
//    */
//   onCancel() {
//     this.router.navigate(['/list']);
//   }

// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { Questionnaire, QuestionnaireAnswer } from '../../models/questionnaire.model';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-questionnaire-fill',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questionnaire-fill.component.html',
  styleUrl: './questionnaire-fill.component.scss'
})
export class QuestionnaireFillComponent implements OnInit {
  questionnaire?: Questionnaire;

  userAnswer: QuestionnaireAnswer = {
    questionnaireId: 0,
    username: '',
    phone: '',
    email: '',
    age: undefined,
    answers: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qService: QuestionnaireService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // [修改] 改用新的 getQuestionnaireById (呼叫 /quiz/get API)
    this.qService.getQuestionnaireById(id).subscribe({
      next: (res) => {
        // res 是 GetSingleQuizRes
        if (res.code === 200) {
          // 轉換後端資料為前端模型
          this.questionnaire = {
            id: res.id,
            title: res.title,
            description: res.description,
            startTime: new Date(res.startDate), // [修正] 模型叫 startTime
            endTime: new Date(res.endDate),     // [修正] 模型叫 endTime
            questions: res.questionList.map((q: any) => ({
              id: q.questionId || q.id,
              title: q.question, // 後端欄位叫 question
              // [修正] 後端回傳 "Multi"，轉小寫變成 "multi"，但 HTML 判斷式是 'multiple'
              type: (q.type.toLowerCase() === 'multi' || q.type.toLowerCase() === 'multiple') ? 'multiple' : q.type.toLowerCase(),
              required: q.required,
              options: this.parseOptions(q.options)
            })),
            status: 'not_started' // 先給預設值
          };

          // [新增] 計算並設置正確的狀態
          const now = new Date();
          if (!res.published) {
            this.questionnaire.status = 'unpublished';
          } else if (now < this.questionnaire.startTime) {
            this.questionnaire.status = 'not_started';
          } else if (now > this.questionnaire.endTime) {
            this.questionnaire.status = 'finished';
          } else {
            this.questionnaire.status = 'in_progress';
          }

          this.userAnswer.questionnaireId = this.questionnaire.id;
          this.initUserAnswer(this.questionnaire.questions);

        } else {
          this.showHint('問卷不存在或無法讀取！', 'error').then(() => {
            this.router.navigate(['/list']);
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.showHint('連線失敗！', 'error').then(() => {
          this.router.navigate(['/list']);
        });
      }
    });
  }

  // 抽出初始化的邏輯，讓代碼乾淨點
  private initUserAnswer(questions: any[]) {
    // 檢查是否有暫存
    const temp = this.qService.getTempAnswer();
    if (temp && temp.questionnaireId === this.questionnaire?.id) {
      this.userAnswer = temp;
    } else {
      this.userAnswer.answers = questions.map(q => ({
        questionId: q.id,
        value: q.type === 'multiple' ? [] : ''
      }));
    }
  }

  /** 通用美化提示彈窗 */
  private showHint(msg: string, icon: any = 'warning') {
    return (Swal as any).fire({
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

  onCheckboxChange(questionId: number, optionContent: string, event: any) {
    const questionAnswer = this.userAnswer.answers.find(a => a.questionId === questionId);
    if (questionAnswer && Array.isArray(questionAnswer.value)) {
      if (event.target.checked) {
        questionAnswer.value.push(optionContent);
      } else {
        const index = questionAnswer.value.indexOf(optionContent);
        if (index > -1) questionAnswer.value.splice(index, 1);
      }
    }
  }

  onSubmit() {
    // 1. 基礎校驗
    if (!this.userAnswer.username || !this.userAnswer.phone || !this.userAnswer.email || !this.userAnswer.age) {
      this.showHint('請填寫必填的個人資訊 (姓名、手機、Email、年齡)！');
      return;
    }

    if (this.userAnswer.age <= 18) {
      this.showHint('年齡必須大於 18 歲才能填寫問卷！');
      return;
    }

    // 2. Email 格式檢查
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.userAnswer.email)) {
      this.showHint('郵箱格式不正確，必須為有效的郵件地址！');
      return;
    }

    // 3. Email 重複檢查
    if (this.questionnaire) {
      const isDuplicate = this.qService.isEmailSubmited(
        this.questionnaire.id,
        this.userAnswer.email
      );

      if (isDuplicate) {
        this.showHint('此 Email 已經填寫過這份問卷，請勿重複提交！', 'error');
        return;
      }
    }

    // 4. 動態問題必填檢查
    for (let q of this.questionnaire?.questions || []) {
      const ans = this.userAnswer.answers.find(a => a.questionId === q.id);
      if (q.required && (!ans?.value || (Array.isArray(ans.value) && ans.value.length === 0))) {
        this.showHint(`請填寫必填問題：${q.title}`);
        return;
      }
    }

    // 5. 暫存並跳轉
    this.qService.setTempAnswer(this.userAnswer);
    this.router.navigate(['/questionnaire/confirm', this.questionnaire?.id]);
  }

  onCancel() {
    this.router.navigate(['/list']);
  }

  private parseOptions(optionsStr: string): any[] {
    if (!optionsStr) return [];
    try {
      // 嘗試解析 JSON
      const parsed = JSON.parse(optionsStr);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // JSON 解析失敗，走原本的分號邏輯
    }
    // 分號分隔
    return optionsStr.split(';').map((opt: string, idx: number) => ({ id: idx + 1, content: opt }));
  }
}
