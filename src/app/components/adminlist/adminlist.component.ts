// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { QuestionnaireService } from '../../services/questionnaire.service';
// import { Questionnaire } from '../../models/questionnaire.model';
// import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

// @Component({
//   selector: 'app-adminlist',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatPaginatorModule],

//   templateUrl: './adminlist.component.html',
//   styleUrl: './adminlist.component.scss'
// })
// export class AdminlistComponent implements OnInit {
//  questionnaires: Questionnaire[] = [];
//   displayedQuestionnaires: Questionnaire[] = [];

//   // 搜尋條件 [cite: 182, 184]
//   searchTitle: string = '';
//   searchStartDate: string = '';
//   searchEndDate: string = '';

//   // 分頁設定 [cite: 186]
//   pageSize = 10;
//   pageIndex = 0;
//   totalItems = 0;

//   // 已勾選的問卷 ID [cite: 211]
//   selectedIds: Set<number> = new Set();

//   constructor(
//     private qService: QuestionnaireService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadData();
//   }

//   /** 1. 載入資料並初始化顯示 [cite: 167] */
//   loadData(): void {
//     this.questionnaires = this.qService.getAllQuestionnaires();
//     this.updateDisplayData();
//   }

//   /** 2. 執行搜尋 (模糊搜尋 + 日期區間) [cite: 183, 185] */
//   onSearch(): void {
//     const all = this.qService.getAllQuestionnaires();
//     this.questionnaires = all.filter(q => {
//       const matchTitle = q.title.toLowerCase().includes(this.searchTitle.toLowerCase());
//       let matchTime = true;
//       if (this.searchStartDate) {
//         matchTime = matchTime && new Date(q.startTime) >= new Date(this.searchStartDate);
//       }
//       if (this.searchEndDate) {
//         matchTime = matchTime && new Date(q.endTime) <= new Date(this.searchEndDate);
//       }
//       return matchTitle && matchTime;
//     });
//     this.pageIndex = 0;
//     this.updateDisplayData();
//   }

//   /** 3. 取得問卷顯示狀態文字 [cite: 187, 188, 189] */
//   getStatusLabel(q: Questionnaire): string {
//     if (q.status === 'unpublished') return '未發佈';
//     const now = new Date();
//     const start = new Date(q.startTime);
//     const end = new Date(q.endTime);
//     if (now < start) return '尚未開始';
//     if (now > end) return '已關閉';
//     return '開放中';
//   }

//   /** 4. 新增問卷功能 (+) [cite: 202, 203] */
//   navToCreate(): void {
//     // 直接跳轉到設計頁面。
//     // 因為沒有帶 id 參數，設計頁面會視為「新增模式」。
//     // 新問卷的 ID 會在儲存時由 Service 的 generateId 自動生成 (AI) 。
//     this.router.navigate(['/adminlist/design']);
//   }

//   /** 5. 點選名稱進行修改或查看 [cite: 205, 206, 224] */
//   onEdit(q: Questionnaire): void {
//     const status = this.getStatusLabel(q);

//     // 修改條件檢查：僅「未發佈」或「尚未開始」可修改
//     const isEditable = (status === '未發佈' || status === '尚未開始');

//     if (isEditable) {
//       // 若符合修改條件，跳轉至設計頁面並帶入問卷 ID [cite: 206]
//       this.router.navigate(['/adminlist/design'], {
//         queryParams: { id: q.id }
//       });
//     } else {
//       // 若狀態為「開放中」或「已關閉」，則跳轉至唯讀頁面 (此處暫定跳轉至顯示提醒後出現統計界面顯示) [cite: 227]
//       alert('進行中或已結束之問卷僅供檢視，不可修改。');

//       // this.router.navigate(['/statistic', q.id]);
//       // 【修正這行】：加上 queryParams
//   this.router.navigate(['/statistic', q.id], {
//     queryParams: { from: 'admin' }
//   });
//     }
//   }
//   /** 7. 前往問卷結果頁面（用於「前往」按鈕） */
// navToResult(q: Questionnaire): void {
//   // 直接跳轉到統計頁面查看結果
//   // this.router.navigate(['/statistic', q.id]);

//   // 跳轉至新整合的結果頁面，路徑帶上問卷 ID
//   this.router.navigate(['/admin/results', q.id]);

// }



//   /** 6. 批次刪除邏輯 (已實現功能) [cite: 210, 212, 213] */
//   onDelete(): void {
//     if (this.selectedIds.size === 0) {
//       alert('請先勾選要刪除的問卷');
//       return;
//     }

//     const idsToDelete = Array.from(this.selectedIds);
//     const canDelete = idsToDelete.every(id => {
//       const q = this.questionnaires.find(item => item.id === id);
//       const status = q ? this.getStatusLabel(q) : '';
//       return status === '未發佈' || status === '尚未開始';
//     });

//     if (!canDelete) {
//       alert('包含無法刪除的問卷 (僅限未發佈或尚未開始)。');
//       return;
//     }

//     if (confirm(`確定要刪除選中的 ${this.selectedIds.size} 筆問卷嗎？`)) {
//       this.qService.deleteQuestionnaires(idsToDelete);
//       this.selectedIds.clear();
//       this.loadData();
//     }
//   }

//   // --- 分頁輔助方法 ---
//   updateDisplayData(): void {
//     this.totalItems = this.questionnaires.length;
//     const start = this.pageIndex * this.pageSize;
//     this.displayedQuestionnaires = this.questionnaires.slice(start, start + this.pageSize);
//   }

//   onPageChange(event: PageEvent): void {
//     this.pageIndex = event.pageIndex;
//     this.pageSize = event.pageSize;
//     this.updateDisplayData();
//   }

//   toggleSelect(id: number): void {
//     if (this.selectedIds.has(id)) this.selectedIds.delete(id);
//     else this.selectedIds.add(id);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { Questionnaire } from '../../models/questionnaire.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2'; // 確保有這行

@Component({
  selector: 'app-adminlist',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './adminlist.component.html',
  styleUrl: './adminlist.component.scss'
})
export class AdminlistComponent implements OnInit {
  questionnaires: Questionnaire[] = [];
  displayedQuestionnaires: Questionnaire[] = [];
  searchTitle: string = '';
  searchStartDate: string = '';
  searchEndDate: string = '';
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  selectedIds: Set<number> = new Set();

  constructor(
    private qService: QuestionnaireService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.questionnaires = this.qService.getAllQuestionnaires();
    this.updateDisplayData();
  }

  onSearch(): void {
    const all = this.qService.getAllQuestionnaires();
    this.questionnaires = all.filter(q => {
      const matchTitle = q.title.toLowerCase().includes(this.searchTitle.toLowerCase());
      let matchTime = true;
      if (this.searchStartDate) {
        matchTime = matchTime && new Date(q.startTime) >= new Date(this.searchStartDate);
      }
      if (this.searchEndDate) {
        matchTime = matchTime && new Date(q.endTime) <= new Date(this.searchEndDate);
      }
      return matchTitle && matchTime;
    });
    this.pageIndex = 0;
    this.updateDisplayData();
  }

  getStatusLabel(q: Questionnaire): string {
    if (q.status === 'unpublished') return '未發佈';
    const now = new Date();
    const start = new Date(q.startTime);
    const end = new Date(q.endTime);
    if (now < start) return '尚未開始';
    if (now > end) return '已關閉';
    return '開放中';
  }

  navToCreate(): void {
    this.router.navigate(['/adminlist/design']);
  }

  /** 5. 美化後的 修改/查看 判斷 */
  onEdit(q: Questionnaire): void {
    const status = this.getStatusLabel(q);
    const isEditable = (status === '未發佈' || status === '尚未開始');

    if (isEditable) {
      this.router.navigate(['/adminlist/design'], {
        queryParams: { id: q.id }
      });
    } else {
      // 替換原生的 alert
      (Swal as any).fire({
        title: '無法修改',
        text: '進行中或已結束之問卷僅供檢視，不可修改。',
        icon: 'info',
        confirmButtonColor: '#8b2d2d',
        confirmButtonText: '我知道了',
        width: '350px'
      });

      this.router.navigate(['/statistic', q.id], {
        queryParams: { from: 'admin' }
      });
    }
  }

  navToResult(q: Questionnaire): void {
    this.router.navigate(['/admin/results', q.id]);
  }

  /** 6. 美化後的 批次刪除邏輯 */
  onDelete(): void {
    if (this.selectedIds.size === 0) {
      (Swal as any).fire({
        title: '提示',
        text: '請先勾選要刪除的問卷',
        icon: 'warning',
        confirmButtonColor: '#8b2d2d',
        width: '400px'
      });
      return;
    }

    const idsToDelete = Array.from(this.selectedIds);
    const canDelete = idsToDelete.every(id => {
      const q = this.questionnaires.find(item => item.id === id);
      const status = q ? this.getStatusLabel(q) : '';
      return status === '未發佈' || status === '尚未開始';
    });

    if (!canDelete) {
      (Swal as any).fire({
        title: '無法刪除',
        text: '包含無法刪除的問卷 (僅限未發佈或尚未開始)。',
        icon: 'error',
        confirmButtonColor: '#8b2d2d',
        width: '450px'
      });
      return;
    }

    // 替換原生的 confirm
    (Swal as any).fire({
      title: '確定要刪除嗎？',
      text: `您即將刪除選中的 ${this.selectedIds.size} 筆問卷，此動作無法撤銷。`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8b2d2d',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      width: '300px'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.qService.deleteQuestionnaires(idsToDelete);
        this.selectedIds.clear();
        this.loadData();

        (Swal as any).fire({
          title: '刪除成功',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  updateDisplayData(): void {
    this.totalItems = this.questionnaires.length;
    const start = this.pageIndex * this.pageSize;
    this.displayedQuestionnaires = this.questionnaires.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayData();
  }

  toggleSelect(id: number): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
  }
}
