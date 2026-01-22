// import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionnaireService } from '../../services/questionnaire.service'; // 注意路徑
import { Questionnaire } from '../../models/questionnaire.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; // 新增
import { MatSelectModule } from '@angular/material/select'; // 新增
import { MatFormFieldModule } from '@angular/material/form-field'; // 新增
import { Component, OnInit } from '@angular/core';
// 路徑說明：list.component.ts的位置是 src/app/components/list/
// questionnaire.service.ts的位置是 src/app/services/
// 从list目录往上走：
// 第一层../ → 到components目录
// 第二层../ → 到app目录
// 然后进入services/questionnaire.service.ts

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'] ,// 根據截圖，你使用的是 scss
  imports: [CommonModule, FormsModule,
    MatPaginatorModule,  // 新增
    MatSelectModule,     // 新增
    MatFormFieldModule   // 新增
  ],

})
export class ListComponent implements OnInit {
// 存放所有問卷的陣列
  questionnaires: Questionnaire[] = [];


  displayedQuestionnaires: Questionnaire[] = [];
   // 存放當前頁顯示的問卷（分頁後數據）- 新增變數
  // 分頁相關變數 - 新增這5個變數
  pageSize = 10; // 預設每頁10筆
  pageIndex = 0; // 當前頁索引（從0開始）
  pageSizeOptions = [5, 10, 20, 50]; // 每頁筆數選項
  totalItems = 0; // 總筆數

  // 搜尋用的變數 [cite: 44, 45]
  searchTitle: string = '';
  searchStartDate: string = '';
  searchEndDate: string = '';

  constructor(
    private qService: QuestionnaireService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }



  // 從 Service 載入問卷列表 [cite: 47, 49]
  loadData(): void {
    this.questionnaires = this.qService.getAllQuestionnaires();
    this.updateDisplayData(); // [修改：添加這行調用分頁更新]
  }

  // 搜尋按鈕點擊事件
  // 注意：我點選的時間區間是要“包含”要搜索的問卷的時間的區間，
  // 如果我是只想控制開始時間，那結束時間就不要填，然後搜索，
  // 那樣就可以搜索出來只要問卷開始，不用管結束時間的問卷

 onSearch(): void {
  // 搜索標題和日期的功能
  const all = this.qService.getAllQuestionnaires();

  this.questionnaires = all.filter(q => {
    // 條件1：標題模糊搜尋
    let matchTitle = true;

    if (this.searchTitle && this.searchTitle.trim() !== '') {
      // searchTitle：檢查 searchTitle 變數是否存在（不是 null、undefined 或空值）
      // this.searchTitle.trim() !== ''：將字串去除前後空白後，檢查是否不是空字串
      // 只有當搜尋框「有輸入內容」且「不是只有空白字元」時，才執行搜尋邏輯
      const searchText = this.searchTitle.trim().toLowerCase();
      const questionTitle = q.title.toLowerCase();

      // 強化模糊搜尋：支援中文部分匹配
      // 例如："青春" 可以匹配 "青春洋溢高中生人氣投票戰"
      matchTitle = questionTitle.includes(searchText);

      // 如果需要更強的模糊搜尋（非連續字元匹配），可以使用：
      // matchTitle = this.fuzzySearch(questionTitle, searchText);
    }

    // 條件2：開始/結束時間區間過濾
    let matchTime = true;

    // 開始日期篩選
    if (this.searchStartDate) {
      const searchStart = new Date(this.searchStartDate);
      const qStart = new Date(q.startTime);

      // 清除時間部分，只比較日期
      searchStart.setHours(0, 0, 0, 0);
      qStart.setHours(0, 0, 0, 0);

      // 問卷開始時間 >= 搜尋開始時間
      matchTime = matchTime && qStart.getTime() >= searchStart.getTime();
    }

    // 結束日期篩選
    if (this.searchEndDate) {
      const searchEnd = new Date(this.searchEndDate);
      const qEnd = new Date(q.endTime);

      // 清除時間部分，只比較日期
      searchEnd.setHours(23, 59, 59, 999); // 設為當天的最後時刻
      qEnd.setHours(23, 59, 59, 999);

      // 問卷結束時間 <= 搜尋結束時間
      matchTime = matchTime && qEnd.getTime() <= searchEnd.getTime();
    }

    return matchTitle && matchTime;
  });

  this.pageIndex = 0;
  this.updateDisplayData();
}

// 可選：添加模糊搜尋方法（支援中文非連續匹配）
private fuzzySearch(text: string, pattern: string): boolean {
  if (!pattern) return true;

  // 將中文拆分成單字進行匹配
  const textChars = text.split('');
  const patternChars = pattern.split('');

  let patternIndex = 0;

  for (let i = 0; i < textChars.length; i++) {
    if (textChars[i] === patternChars[patternIndex]) {
      patternIndex++;
      if (patternIndex === patternChars.length) {
        return true;
      }
    }
  }

  return false;
}

  // [新增方法：更新顯示數據（分頁邏輯）]
  updateDisplayData(): void {
    this.totalItems = this.questionnaires.length;

    // 計算當前頁的數據
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedQuestionnaires = this.questionnaires.slice(startIndex, endIndex);
  }

  // [新增方法：分頁事件處理]
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayData();
  }

  // [新增方法：每頁筆數改變事件]
  onPageSizeChange(event: any): void {
    this.pageSize = event.value;
    this.pageIndex = 0; // 切換每頁筆數時回到第一頁
    this.updateDisplayData();
  }



  /**
   * 根據時間動態判斷問卷狀態 [cite: 52]
   * @param q 問卷物件
   */
  getQuestionnaireStatus(q: Questionnaire): '尚未開始' | '進行中' | '已結束' {
    const now = new Date();
    const start = new Date(q.startTime);
    const end = new Date(q.endTime);

    if (now < start) return '尚未開始';
    if (now > end) return '已結束';
    return '進行中';
  }

  /**
   * 點擊問卷名稱或前往按鈕 [cite: 50, 54]
   */
  navToFill(q: Questionnaire): void {
    const status = this.getQuestionnaireStatus(q);
    // 只有「進行中」的問卷可以點擊進入作答頁面 [cite: 54, 59]
    if (status === '進行中') {
      this.router.navigate(['/questionnaire', q.id]);
    }
  }

  /**
   * 觀看統計結果 [cite: 55, 56]
   */
  navToStatistic(q: Questionnaire): void {
    const status = this.getQuestionnaireStatus(q);
    // 狀態是「進行中」或「已結束」才可觀看統計 [cite: 56]
    if (status !== '尚未開始') {
      this.router.navigate(['/statistic', q.id]);
    }
  }
}
