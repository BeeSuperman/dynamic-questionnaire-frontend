import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { Questionnaire, QuestionnaireAnswer, Question } from '../../models/questionnaire.model';
import { Chart, registerables } from 'chart.js';
import Swal from 'sweetalert2';

// 註冊 Chart.js 組件
Chart.register(...registerables);

@Component({
  selector: 'app-statistic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.scss'
})
export class StatisticComponent implements OnInit, AfterViewInit {
  questionnaire?: Questionnaire;
  allAnswers: QuestionnaireAnswer[] = [];
  source: string | null = null; // 用於辨識來源的變數 (admin 或 null)

  // 取得 HTML 中所有的畫布元素
  @ViewChildren('pieChart') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qService: QuestionnaireService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.source = this.route.snapshot.queryParamMap.get('from');

    // 1. [修改] 改為呼叫 API 獲取問卷定義
    this.qService.getQuestionnaireById(id).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.questionnaire = {
            id: res.id,
            title: res.title,
            description: res.description,
            startTime: new Date(res.startDate),
            endTime: new Date(res.endDate),
            status: 'unpublished', // 預設值，稍後計算
            questions: res.questionList.map((q: any) => ({
              id: q.questionId || q.id,
              title: q.question,
              type: q.type.toLowerCase(),
              required: q.required,
              options: this.parseOptions(q.options)
            }))
          };

          const now = new Date();
          if (!res.published) {
            this.questionnaire.status = 'unpublished';
          } else if (now < this.questionnaire.startTime!) {
            this.questionnaire.status = 'not_started';
          } else if (now > this.questionnaire.endTime!) {
            this.questionnaire.status = 'finished';
          } else {
            this.questionnaire.status = 'in_progress';
          }

          // 2. [新增] 成功後，再獲取填寫回饋
          this.fetchFeedback(id);
        } else {
          this.showError('找不到該問卷！');
          this.router.navigate(['/list']);
        }
      },
      error: (err) => {
        console.error(err);
        this.showError('無法載入問卷資料');
        this.router.navigate(['/list']);
      }
    });
  }

  // [新增] 獲取統計回饋數據
  fetchFeedback(id: number) {
    this.qService.getFeedback(id).subscribe({
      next: (res) => {
        if (res.code === 200 && res.userVoList) {
          this.allAnswers = res.userVoList.map((vo: any) => ({
            questionnaireId: id,
            username: vo.username,
            phone: vo.phone,
            email: vo.email,
            age: vo.age,
            answers: vo.answerVoList.map((ansVo: any) => ({
              questionId: ansVo.question.questionId,
              value: ansVo.answer.includes(';') ? ansVo.answer.split(';') : ansVo.answer
            }))
          }));

          // 4. 資料準備好後渲染圖表
          // 避免重複呼叫，這裡不需要 setTimeout，因為 ngAfterViewInit 會處理初始渲染
          // 或者如果是動態加載數據，這裡呼叫是必要的，但要確保 destroy
          setTimeout(() => this.renderCharts(), 100);
        }
      },
      error: (err) => {
        console.error('Feedback API Error:', err);
      }
    });

  }

  private showError(msg: string) {
    (Swal as any).fire({
      title: '錯誤',
      text: msg,
      icon: 'error',
      confirmButtonColor: '#8b2d2d'
    });
  }

  ngAfterViewInit(): void {
    // 移除這裡的呼叫，統一由 fetchFeedback 數據回來後觸發，或者保留但加強防護
    // 因為數據是異步的，ngAfterViewInit 時數據可能還沒到
    // 只要確保 renderCharts 內部有防護即可
  }

  onBack() {
    if (this.source === 'admin') {
      this.router.navigate(['/adminlist']);
    } else {
      this.router.navigate(['/list']);
    }
  }

  // 管理圖表實例以確保銷毀
  private charts: Chart[] = [];

  renderCharts() {
    if (!this.questionnaire) return;

    // 先銷毀舊圖表
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    const nonTextQuestions = this.questionnaire.questions.filter(q => q.type !== 'text');

    this.chartCanvases.forEach((canvas, index) => {
      const q = nonTextQuestions[index];
      const labels = q.options?.map(opt => opt.content) || [];
      const counts = this.calculateVoteCounts(q);

      const newChart = new Chart(canvas.nativeElement, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: counts,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
      this.charts.push(newChart);
    });
  }

  calculateVoteCounts(question: Question): number[] {
    const counts = (question.options || []).map(() => 0);

    this.allAnswers.forEach(ans => {
      const match = ans.answers.find(a => a.questionId === question.id);
      if (match) {
        const val = match.value;
        question.options?.forEach((opt, idx) => {
          if (Array.isArray(val)) {
            if (val.includes(opt.content)) counts[idx]++;
          } else {
            if (val === opt.content) counts[idx]++;
          }
        });
      }
    });
    return counts;
  }

  getPercentage(q: Question, optionIdx: number): string {
    const counts = this.calculateVoteCounts(q);
    const total = counts.reduce((a, b) => a + b, 0);
    if (total === 0) return '0%';
    return Math.round((counts[optionIdx] / total) * 100) + '%';
  }

  getTextAnswers(questionId: number): string[] {
    const answers: string[] = [];
    this.allAnswers.forEach(ans => {
      const match = ans.answers.find(a => a.questionId === questionId);
      if (match && typeof match.value === 'string') {
        answers.push(match.value);
      }
    });
    return answers.length > 0 ? answers : ["目前無作答內容"];
  }

  // [新增] 解析選項 (兼容 JSON 與分號分隔)
  private parseOptions(optionsStr: string): any[] {
    if (!optionsStr) return [];
    try {
      let parsed = JSON.parse(optionsStr);
      // 處理重複編碼的情況 "[\"... \"]"
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch (e) { }
      }
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return optionsStr.split(';').map((opt: string, idx: number) => ({ id: idx + 1, content: opt }));
  }
}

