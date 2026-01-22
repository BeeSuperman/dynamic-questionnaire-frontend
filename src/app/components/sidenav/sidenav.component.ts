
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { AuthService } from '../../services/auth.service';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-sidenav',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './sidenav.component.html',
//   styleUrls: ['./sidenav.component.scss']
// })
// export class SidenavComponent {
//   // 將 router 設為 public，修復 HTML 模板無法訪問 private 屬性的問題
//   constructor(public authService: AuthService, public router: Router) {}

//   get isLoggedIn(): boolean {
//     return this.authService.isLoggedIn();
//   }

//   /** 獲取當前登入者的 Email 用於 Sidenav 顯示 */
//   get userEmail(): string {
//     const user = this.authService.getCurrentUser();
//     return user ? user.email : '';
//   }

//   /** 即時判斷是否為管理員 */
//   get isAdmin(): boolean {
//     const user = this.authService.getCurrentUser();
//     return user ? user.email.startsWith('admin') : false;
//   }

//   onLogout() {
//     if (confirm('確定要登出系統嗎？')) {
//       this.authService.logout();
//       alert('已成功登出');
//       this.router.navigate(['/login']);
//     }
//   }

// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  // 將 router 設為 public，修復 HTML 模板無法訪問 private 屬性的問題
  constructor(public authService: AuthService, public router: Router) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /** 獲取當前登入者的 Email 用於 Sidenav 顯示 */
  get userEmail(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.email : '';
  }

  /** 即時判斷是否為管理員 */
  get isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? user.email.startsWith('admin') : false;
  }

  /** 美化後的登出彈窗 */
  onLogout() {
    // 使用 (Swal as any).fire 繞過類型檢查，確保 borderRadius 能生效
    (Swal as any).fire({
      title: '確定要登出系統嗎？',
      text: "登出後需要重新登入才能訪問您的問卷資料。",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8b2d2d',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '確定登出',
      cancelButtonText: '取消',
      width: '400px',
      padding: '1.5rem',
      borderRadius: '15px', // 剛才報錯的屬性，現在可以正常編譯了
      backdrop: `rgba(0,0,0,0.4)`,
      customClass: {
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-text'
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.authService.logout();

        (Swal as any).fire({
          title: '已成功登出',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false,
          width: '350px'
        });

        this.router.navigate(['/login']);
      }
    });
  }
}
