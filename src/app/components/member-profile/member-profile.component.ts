// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-member-profile',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './member-profile.component.html',
//   styleUrl: './member-profile.component.scss'
// })
// export class MemberProfileComponent implements OnInit {
//   user: any = { name: '', email: '', password: '', phone: '' };

//   constructor(private authService: AuthService, private router: Router) {}

//   ngOnInit(): void {
//     // 從 Service 抓取當前登入者資訊
//     const currentUser = this.authService.getCurrentUser();
//     if (currentUser) {
//       this.user = { ...currentUser }; // 展開複製，避免改動原始參考
//     } else {
//       alert('請先登入！');
//       this.router.navigate(['/login']);
//     }
//   }

//   onConfirm() {
//     if (!this.user.name.trim()) { alert('姓名不可為空！'); return; }
//     if (this.user.password.length < 8 || this.user.password.length > 12) {
//       alert('新密碼須為8到12個字！');
//       return;
//     }

//     this.authService.updateUserProfile(this.user);
//     alert('會員資料已成功更新！');
//     this.onCancel(); // 返回列表
//   }

//   onCancel() {
//     const role = sessionStorage.getItem('user_role');
//     this.router.navigate([role === 'admin' ? '/adminlist' : '/list']);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-profile.component.html',
  styleUrl: './member-profile.component.scss'
})
export class MemberProfileComponent implements OnInit {
  user: any = { name: '', email: '', password: '', phone: '' };

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // 從 Service 抓取當前登入者資訊
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = { ...currentUser }; // 展開複製，避免改動原始參考
    } else {
      // 未登入時的美化彈窗
      (Swal as any).fire({
        title: '提示',
        text: '請先登入系統！',
        icon: 'warning',
        confirmButtonColor: '#8b2d2d',
        width: '380px',
        borderRadius: '12px',
        customClass: {
          title: 'swal-small-title',
          htmlContainer: 'swal-small-text'
        }
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  /**
   * 通用美化提示框 (精緻小尺寸版)
   */
  private showHint(msg: string, iconType: any = 'warning') {
    (Swal as any).fire({
      title: '提示',
      text: msg,
      icon: iconType,
      confirmButtonText: '確定',
      confirmButtonColor: '#8b2d2d', // 配合您的紅棕色按鈕主題
      width: '380px',               // 縮小寬度
      padding: '1rem',
      borderRadius: '12px',
      customClass: {
        title: 'swal-small-title',
        htmlContainer: 'swal-small-text'
      }
    });
  }

  onConfirm() {
    // 1. 基礎卡控
    if (!this.user.name.trim()) {
      this.showHint('姓名不可為空！');
      return;
    }

    if (this.user.password.length < 8 || this.user.password.length > 12) {
      this.showHint('新密碼須為 8 到 12 個字！');
      return;
    }

    // 2. 呼叫後端 API 更新資料
    this.authService.updateUserProfile(this.user).subscribe({
      next: (res) => {
        if (res.code === 200) {
          // 成功提示：自動關閉並跳轉
          (Swal as any).fire({
            title: '更新成功！',
            text: '您的會員資料已成功更新。',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            width: '380px',
            borderRadius: '12px',
            customClass: {
              title: 'swal-small-title',
              htmlContainer: 'swal-small-text'
            }
          }).then(() => {
            this.onCancel(); // 返回列表
          });
        } else {
          this.showHint(res.message || '更新失敗', 'error');
        }
      },
      error: (err) => {
        console.error('更新失敗:', err);
        this.showHint('更新失敗: ' + err.message, 'error');
      }
    });
  }

  onCancel() {
    const role = sessionStorage.getItem('user_role');
    this.router.navigate([role === 'admin' ? '/adminlist' : '/list']);
  }
}
