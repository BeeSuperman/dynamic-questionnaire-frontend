
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
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.questionnaire = this.qService.getQuestionnaireById(id);

    const rawData = (this.qService as any).getAllAnswers() || [];
    const filtered = rawData.filter((a: any) => a.questionnaireId === id);

    // 1. 先補齊時間數據
    const now = new Date();
    const processedData = filtered.map((ans: any, index: number) => {
      if (!ans.fillDate) {
        // 模擬數據：編號越大的時間越新（現在），編號越小的時間越舊
        const mockTime = new Date(now.getTime() - ((filtered.length - 1 - index) * 5 * 60000));
        ans.fillDate = mockTime.toISOString();
      }
      return ans;
    });

    // 2. 【核心修正】：執行逆序排序（最新的在最上面）
    this.answers = processedData.sort((a: any, b: any) => {
      const timeA = new Date(a.fillDate).getTime();
      const timeB = new Date(b.fillDate).getTime();
      return timeB - timeA; // 降序：大時間（新）排在前面
    });

    if (!this.questionnaire) {
      this.router.navigate(['/adminlist']);
    }
  }

  switchTab(tab: 'feedback' | 'stat') {
    this.activeTab = tab;
    this.isDetailView = false;
    if (tab === 'stat') setTimeout(() => this.renderCharts(), 100);
  }

  viewDetail(ans: any) {
    this.selectedAnswer = ans;
    this.isDetailView = true;
  }

  getAnswerVal(qId: number): string {
    if (!this.selectedAnswer?.answers) return '未填寫';
    const match = this.selectedAnswer.answers.find((a: any) => a.questionId === qId);
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
