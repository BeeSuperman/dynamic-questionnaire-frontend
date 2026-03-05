// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { QuestionnaireService } from '../../services/questionnaire.service';
// import { Questionnaire, QuestionnaireAnswer } from '../../models/questionnaire.model';
import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-questionnaire-confirm',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './questionnaire-confirm.component.html',
//   styleUrl: './questionnaire-confirm.component.scss'
// })
// export class QuestionnaireConfirmComponent implements OnInit{
// questionnaire?: Questionnaire;
//   userAnswer: QuestionnaireAnswer | null = null;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private qService: QuestionnaireService
//   ) {}

//   ngOnInit(): void {
//     const id = Number(this.route.snapshot.paramMap.get('id'));
//     this.questionnaire = this.qService.getQuestionnaireById(id);

//     // 從 Session 讀取填寫內容
//     this.userAnswer = this.qService.getTempAnswer();

//     // 安全檢查：若無暫存資料則退回列表
//     if (!this.userAnswer || this.userAnswer.questionnaireId !== id) {
//       alert('無有效的填寫記錄，請重新填寫');
//       this.router.navigate(['/list']);
//     }
//   }

//   /**
//    * 取得特定問題的答案顯示文字
//    */
//   getAnswerText(questionId: number): string {
//     const ans = this.userAnswer?.answers.find(a => a.questionId === questionId);
//     if (!ans) return '未填寫';

//     if (Array.isArray(ans.value)) {
//       // 若是複選題，用分號串接顯示 [cite: 73]
//       return ans.value.length > 0 ? ans.value.join(' ; ') : '未選取';
//     }
//     return ans.value || '未填寫';
//   }

//   /**
//    * 修改按鈕：回到填寫頁，資料會因 Service 暫存而帶回
//    */
//   onModify() {
//     if (confirm('確定要返回修改嗎？')) {
//       this.router.navigate(['/questionnaire', this.questionnaire?.id]);
//     }
//   }

//   /**
//    * 送出按鈕：寫入資料庫並跳回列表
//    */
//   onFinalSubmit() {
//     if (this.userAnswer && confirm('確認送出問卷？送出後將無法修改。')) {
//       // 呼叫 Service 正式存檔 [cite: 115]
//       this.qService.submitFinalAnswer(this.userAnswer);
//       alert('問卷已成功送出！');
//       this.router.navigate(['/list']);
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { Questionnaire, QuestionnaireAnswer } from '../../models/questionnaire.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-questionnaire-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './questionnaire-confirm.component.html',
  styleUrl: './questionnaire-confirm.component.scss'
})
export class QuestionnaireConfirmComponent implements OnInit {
  questionnaire?: Questionnaire;
  userAnswer: QuestionnaireAnswer | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qService: QuestionnaireService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // [修改] 改為訂閱 Observable 並映射資料
    this.qService.getQuestionnaireById(id).subscribe(res => {
      if (res.code === 200) {
        this.questionnaire = {
          id: res.id,
          title: res.title,
          description: res.description,
          startTime: new Date(res.startDate),
          endTime: new Date(res.endDate),
          questions: res.questionList.map((q: any) => ({
            id: q.questionId || q.id,
            title: q.question,
            type: q.type.toLowerCase(),
            required: q.required,
            options: q.options ? q.options.split(';').map((opt: string, idx: number) => ({ id: idx + 1, content: opt })) : []
          })),
          status: 'not_started' // 這裡僅用於顯示，狀態計算可選
        };
      }
    });

    // 從 Session 讀取填寫內容
    this.userAnswer = this.qService.getTempAnswer();

    // 安全檢查：若無暫存資料則退回列表
    if (!this.userAnswer || this.userAnswer.questionnaireId !== id) {
      (Swal as any).fire({
        title: '提示',
        text: '無有效的填寫記錄，請重新填寫',
        icon: 'warning',
        confirmButtonColor: '#8b2d2d',
        width: '400px'
      }).then(() => {
        this.router.navigate(['/list']);
      });
    }
  }

  /**
   * 取得特定問題的答案顯示文字
   */
  getAnswerText(questionId: number): string {
    const ans = this.userAnswer?.answers.find(a => a.questionId === questionId);
    if (!ans) return '未填寫';

    if (Array.isArray(ans.value)) {
      // 若是複選題，用分號串接顯示
      return ans.value.length > 0 ? ans.value.join(' ; ') : '未選取';
    }
    return ans.value || '未填寫';
  }

  /**
   * 修改按鈕：美化後的確認回退彈窗
   */
  onModify() {
    (Swal as any).fire({
      title: '確定要返回修改嗎？',
      text: '您之前的填寫內容將被保留。',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8b2d2d',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '確定返回',
      cancelButtonText: '取消',
      width: '400px'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.router.navigate(['/questionnaire', this.questionnaire?.id]);
      }
    });
  }

  /**
   * 送出按鈕：美化後的送出確認與成功提示
   */
  onFinalSubmit() {
    if (!this.userAnswer) return;

    // [新增] 提交前檢查是否為註冊會員
    this.authService.checkRegistered(this.userAnswer.email).subscribe({
      next: (res) => {
        if (res.code === 200) {
          // 是註冊會員 -> 先顯示提示
          (Swal as any).fire({
            title: '提示',
            text: '郵箱已註冊，個人資料將保持原樣，僅更新問卷答案！請到懸浮按鈕修改會員資料',
            icon: 'info',
            confirmButtonColor: '#8b2d2d',
            confirmButtonText: '了解'
          }).then(() => {
            // 用戶點擊了解後，繼續執行原本的提交確認
            this.showConfirmDialog();
          });
        } else {
          // 是訪客 -> 直接執行原本的提交確認
          this.showConfirmDialog();
        }
      },
      error: () => {
        // 檢查失敗也繼續執行 (避免卡住)
        this.showConfirmDialog();
      }
    });
  }

  // 將原本的確認邏輯抽出來
  private showConfirmDialog() {
    (Swal as any).fire({
      title: '確認送出問卷？',
      text: '送出後將無法再次修改內容。',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8b2d2d',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '確認送出',
      cancelButtonText: '再檢查一下',
      width: '400px'
    }).then((result: any) => {
      if (result.isConfirmed) {
        if (this.questionnaire && this.questionnaire.questions) {
          this.qService.submitQuestionnaire(this.userAnswer!, this.questionnaire.questions)
            .subscribe({
              next: (res) => {
                if (res.code === 200) {
                  sessionStorage.removeItem('temp_current_answer');

                  // 成功提示：1.5秒後自動關閉並跳轉
                  (Swal as any).fire({
                    title: '送出成功！',
                    text: '感謝您的參與，正在為您跳轉列表...',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    width: '400px'
                  }).then(() => {
                    this.router.navigate(['/list']);
                  });
                } else {
                  (Swal as any).fire('送出失敗', res.message, 'error');
                }
              },
              error: (err) => {
                console.error(err);
                (Swal as any).fire('連線錯誤', '請稍後再試', 'error');
              }
            });
        }
      }
    });
  }
}
