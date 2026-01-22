import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { Questionnaire, QuestionnaireAnswer, Question } from '../../models/questionnaire.model';
import { Chart, registerables } from 'chart.js';

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
  ) {}

  ngOnInit(): void {
    // 1. 取得網址參數中的問卷 ID [cite: 71]
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // 2. 【核心功能】：獲取 URL 中的查詢參數 from，用來判斷是從前台還是後台點進來的
    this.source = this.route.snapshot.queryParamMap.get('from');

    // 3. 根據 ID 載入問卷定義 [cite: 71]
    const data = this.qService.getQuestionnaireById(id);

    if (data) {
      this.questionnaire = data;
      // 獲取所有填答紀錄並過濾屬於此問卷的答案 [cite: 141, 163]
      const answersData = (this.qService as any).getAllAnswers();
      this.allAnswers = answersData.filter((a: any) => a.questionnaireId === id);
    } else {
      // 若找不到問卷資料，導回前台列表
      this.router.navigate(['/list']);
    }
  }

  ngAfterViewInit(): void {
    // 視圖初始化完成後延遲渲染，確保 DOM 完全準備好才繪製圖表
    setTimeout(() => this.renderCharts(), 100);
  }

  /**
   * 核心功能：返回按鈕邏輯。
   * 會根據 source 變數判斷應該回後台還是前台。
   */
  onBack() {
    // 如果來源標記是 'admin'，則返回後台管理列表頁
    if (this.source === 'admin') {
      this.router.navigate(['/adminlist']);
    } else {
      // 否則預設返回前台問卷列表頁
      this.router.navigate(['/list']);
    }
  }

  /**
   * 繪製圓餅圖：遍歷所有非文字題並渲染
   */
  renderCharts() {
    if (!this.questionnaire) return;

    // 過濾出非文字類型的題目來匹配畫布 [cite: 142, 402]
    const nonTextQuestions = this.questionnaire.questions.filter(q => q.type !== 'text');

    this.chartCanvases.forEach((canvas, index) => {
      const q = nonTextQuestions[index];
      const labels = q.options?.map(opt => opt.content) || [];
      const counts = this.calculateVoteCounts(q); // 統計各選項的真實票數

      new Chart(canvas.nativeElement, {
        type: 'pie', // 指定為圓餅圖 [cite: 304]
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
            legend: { display: false } // 隱藏預設圖例，改用 HTML 自定義列表顯示 [cite: 152]
          }
        }
      });
    });
  }

  /**
   * 統計算法：計算單個問題中各個選項的實際得票數
   */
  calculateVoteCounts(question: Question): number[] {
    // 初始化每個選項的計數為 0
    const counts = (question.options || []).map(() => 0);

    this.allAnswers.forEach(ans => {
      // 找到使用者對該題目的回答
      const match = ans.answers.find(a => a.questionId === question.id);
      if (match) {
        const val = match.value;
        question.options?.forEach((opt, idx) => {
          if (Array.isArray(val)) {
            // 多選題邏輯：檢查陣列是否包含該選項 [cite: 150]
            if (val.includes(opt.content)) counts[idx]++;
          } else {
            // 單選題邏輯：直接比對字串 [cite: 149]
            if (val === opt.content) counts[idx]++;
          }
        });
      }
    });
    return counts;
  }

  /**
   * 計算並格式化百分比字串
   */
  getPercentage(q: Question, optionIdx: number): string {
    const counts = this.calculateVoteCounts(q);
    const total = counts.reduce((a, b) => a + b, 0);
    if (total === 0) return '0%';
    // 計算比例並顯示百分比 [cite: 315, 318]
    return Math.round((counts[optionIdx] / total) * 100) + '%';
  }

  /**
   * 獲取簡答題的所有文字答案 [cite: 151]
   */
  getTextAnswers(questionId: number): string[] {
    const answers: string[] = [];
    this.allAnswers.forEach(ans => {
      const match = ans.answers.find(a => a.questionId === questionId);
      if (match && typeof match.value === 'string') {
        answers.push(match.value);
      }
    });
    // 若無真實填答，顯示提示訊息
    return answers.length > 0 ? answers : ["目前無作答內容"];
  }
}
