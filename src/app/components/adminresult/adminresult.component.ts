
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { Questionnaire, QuestionnaireAnswer, Question } from '../../models/questionnaire.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-adminresult',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adminresult.component.html',
  styleUrl: './adminresult.component.scss'
})
export class AdminresultComponent implements OnInit {
  questionnaire?: Questionnaire;
  answers: any[] = [];
  activeTab: 'feedback' | 'stat' = 'feedback';
  selectedAnswer: any = null;
  isDetailView = false;

  constructor(
    private route: ActivatedRoute,
    private qService: QuestionnaireService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // 1. 獲取問卷定義
    this.qService.getQuestionnaireById(id).subscribe({
      next: (res) => {
        // 相容不同後端回傳格式 (直接物件 or 包在 quiz 裡)
        const data = res.quiz || res;
        this.questionnaire = data;

        // [新增] 加上資料欄位映射 (questionList -> questions)
        if (this.questionnaire && !this.questionnaire.questions && (data as any).questionList) {
          this.questionnaire.questions = (data as any).questionList;
        }

        // 使用區域變數避免 TS Object possibly undefined 錯誤
        const quiz = this.questionnaire;
        if (quiz && quiz.questions) {
          quiz.questions.forEach((q: any) => {
            // [新增] 修正 title 欄位 (後端可能叫 question)
            if (!q.title && q.question) {
              q.title = q.question;
            }
            // [新增] 修正 id 欄位 (後端可能叫 questionId)
            if (!q.id && q.questionId) {
              q.id = q.questionId;
            }

            if (typeof q.options === 'string') {
              try {
                let parsed = JSON.parse(q.options);
                if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                if (Array.isArray(parsed)) {
                  q.options = parsed;
                } else {
                  throw new Error('Not an array');
                }
              } catch (e) {
                q.options = q.options.split(';').map((val: string, idx: number) => ({ id: idx + 1, content: val }));
              }
            }
            // 確保 type 為小寫
            if (q.type) q.type = q.type.toLowerCase();
          });
        }
      },
      error: (err) => {
        console.error('獲取問卷失敗', err);
        // this.router.navigate(['/adminlist']); // 暫不強制跳轉，方便除錯
      }
    });

    // 2. 獲取填寫回饋與統計
    this.qService.getFeedback(id).subscribe({
      next: (res) => {
        if (res.code === 200 && res.userVoList) {
          const rawData = res.userVoList;

          this.answers = rawData.map((item: any) => {
            // 時間處理：若後端給的是 LocalDate (yyyy-MM-dd)，轉為 ISO 格式方便排序
            // 注意：FeedbackUserVo 的欄位是 fiilindate (可能拼寫錯誤，依後端為準)
            const dateStr = item.fiilindate || item.fillinDate || new Date().toISOString();

            return {
              name: item.username || item.name,
              phone: item.phone,
              email: item.email,
              age: item.age,
              fillDate: dateStr,
              // 轉換 answerVoList -> 前端需要的結構 { questionId, value }
              answers: item.answerVoList.map((a: any) => ({
                questionId: a.question.questionId || a.questionId,
                // 若是多選 (包含分號)，轉為陣列；否則維持字串
                value: (a.answer && a.answer.includes(';')) ? a.answer.split(';') : a.answer
              }))
            };
          });

          // 3. 排序：最新的在最上面
          this.answers.sort((a, b) => {
            const timeA = new Date(a.fillDate).getTime();
            const timeB = new Date(b.fillDate).getTime();
            return timeB - timeA;
          });

          // 4. 重新繪製圖表 (因為資料更新了)
          setTimeout(() => {
            if (this.activeTab === 'stat') this.renderCharts();
          }, 500);
        }
      },
      error: (err) => {
        console.error('獲取回饋失敗', err);
      }
    });
  }

  switchTab(tab: 'feedback' | 'stat') {
    this.activeTab = tab;
    this.isDetailView = false;
    if (tab === 'stat') {
      // 切換到統計頁籤時，確保圖表有被繪製
      setTimeout(() => this.renderCharts(), 100);
    }
  }

  viewDetail(ans: any) {
    this.selectedAnswer = ans;
    this.isDetailView = true;
  }

  getAnswerVal(qId: number): string {
    if (!this.selectedAnswer?.answers) return '未填寫';
    // 強制轉型為數字比較，避免 string vs number 問題
    const match = this.selectedAnswer.answers.find((a: any) => Number(a.questionId) === Number(qId));
    if (!match) return '未填寫';
    return Array.isArray(match.value) ? match.value.join(' ; ') : match.value;
  }

  renderCharts() {
    if (!this.questionnaire) return;
    this.questionnaire.questions.forEach(q => {
      if (q.type === 'text') return;
      const labels = q.options?.map(opt => opt.content) || [];
      const counts = this.calculateVoteCounts(q);
      const totalVotes = counts.reduce((a, b) => a + b, 0);
      const canvasId = `chart-${q.id}`;
      const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

      if (ctx) {
        const existChart = Chart.getChart(canvasId);
        if (existChart) existChart.destroy();
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: counts,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      }

      const listContainer = document.getElementById(`data-list-${q.id}`);
      if (listContainer) {
        let html = '';
        counts.forEach((count, idx) => {
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          html += `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;">
            <span style="font-weight:bold; width:50px;">${percent}%</span>
            <span style="flex:1;">${labels[idx]}</span>
            <span style="color:#888;">${count} 票</span>
          </div>`;
        });
        listContainer.innerHTML = html;
      }
    });
  }

  private calculateVoteCounts(question: Question): number[] {
    const counts = (question.options || []).map(() => 0);
    this.answers.forEach(ans => {
      const match = ans.answers?.find((a: any) => a.questionId === question.id);
      if (match) {
        const val = match.value;
        question.options?.forEach((opt, idx) => {
          if (Array.isArray(val)) {
            if (val.includes(opt.content)) counts[idx]++;
          } else if (val === opt.content) counts[idx]++;
        });
      }
    });
    return counts;
  }

  goBack() { this.router.navigate(['/adminlist']); }
}
