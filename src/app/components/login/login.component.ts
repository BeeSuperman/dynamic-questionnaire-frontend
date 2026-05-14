// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import {RouterModule } from '@angular/router'; // 1. 匯入 RouterModule
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule,RouterModule],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.scss'
// })
// export class LoginComponent {
//   loginData = { email: '', password: '' };
//   showPassword = false;

//   constructor(private authService: AuthService, private router: Router) {}

//   onLogin() {
//     const { email, password } = this.loginData;
//     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//     // 1. 基礎卡控：空值檢查
//     if (!email) { alert('請輸入電子信箱'); return; }
//     if (!password) { alert('請輸入密碼'); return; }

//     // 2. 格式卡控
//     if (!emailPattern.test(email)) { alert('電子信箱格式不正確！'); return; }
//     if (password.length < 8 || password.length > 12) { alert('請輸入8至12個字的密碼'); return; }

//     // 3. 資料庫比對
//     const user = this.authService.checkUser(email, password);

//     if (user) {
//       // 匹配成功
//       this.authService.loginSuccess(user);
//       alert(`${user.name}，歡迎回來！`);

//       // 分流跳轉
//       if (email.startsWith('admin')) {
//         this.router.navigate(['/adminlist']);
//       } else {
//         this.router.navigate(['/list']);
//       }
//     } else {
//       // 匹配失敗判定
//       const allUsers = this.authService.getUsers();
//       if (allUsers.some(u => u.email === email)) {
//         alert('密碼錯誤，請重新輸入！');
//       } else {
//         alert('此帳號尚未註冊，請先點擊下方連結創建新帳號！');
//       }
//     }
//   }

//   togglePassword() { this.showPassword = !this.showPassword; }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginData = { email: '', password: '' };
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    const { email, password } = this.loginData;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // 1. 基礎卡控
    if (!email) { this.showHint('請輸入電子信箱', 'info'); return; }
    if (!password) { this.showHint('請輸入密碼', 'info'); return; }

    // 2. 格式卡控
    if (!emailPattern.test(email)) { this.showHint('電子信箱格式不正確！', 'warning'); return; }
    if (password.length < 8 || password.length > 12) {
      this.showHint('請輸入8至12個字的密碼', 'warning');
      return;
    }

    // 3. 呼叫後端登入 API
    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        if (res.code === 200 && res.user) { // 假設後端成功回傳 code 200
          // 登錄成功彈窗
          (Swal as any).fire({
            title: '歡迎回來！',
            text: `${res.user.name}，正在為您跳轉界面...`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            width: '400px',
            padding: '1.5rem',
            borderRadius: '15px'
          }).then(() => {
            if (email.startsWith('admin')) {
              this.router.navigate(['/adminlist']);
            } else {
              this.router.navigate(['/list']);
            }
          });
        } else {
          // 登入失敗 (帳號不存在或密碼錯誤)
          this.showHint(res.message || '帳號或密碼錯誤', 'error');
        }
      },
      error: (err) => {
        console.error(err);
        this.showHint('伺服器連線失敗，請稍後再試', 'error');
      }
    });
  }

  /** 通用美化提示框 (小尺寸版) */
  private showHint(msg: string, iconType: any) {
    (Swal as any).fire({
      title: '提示',
      text: msg,
      icon: iconType,
      confirmButtonText: '確定',
      confirmButtonColor: '#8b2d2d',
      width: '400px',
      padding: '1.2rem',
      borderRadius: '12px'
    });
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  /**
   * [DEMO] 一鍵體驗，直接注入 Mock 資料
   * 完全不需要後端，首頁按鈕即廳體驗
   */
  quickDemo(role: 'admin' | 'user') {
    this.authService.mockLogin(role).subscribe(() => {
      const name = role === 'admin' ? '管理員' : '測試使用者';
      (Swal as any).fire({
        title: `🎉 歡迎體驗！`,
        html: `正在以《${name}》身分進入系統...`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        width: '400px'
      }).then(() => {
        if (role === 'admin') {
          this.router.navigate(['/adminlist']);
        } else {
          this.router.navigate(['/list']);
        }
      });
    });
  }
}
