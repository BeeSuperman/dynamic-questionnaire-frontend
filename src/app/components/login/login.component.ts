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

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    const { email, password } = this.loginData;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // 1. 基礎卡控：使用美化彈窗
    if (!email) { this.showHint('請輸入電子信箱', 'info'); return; }
    if (!password) { this.showHint('請輸入密碼', 'info'); return; }

    // 2. 格式卡控
    if (!emailPattern.test(email)) { this.showHint('電子信箱格式不正確！', 'warning'); return; }
    if (password.length < 8 || password.length > 12) {
      this.showHint('請輸入8至12個字的密碼', 'warning');
      return;
    }

    // 3. 資料庫比對
    const user = this.authService.checkUser(email, password);

    if (user) {
      this.authService.loginSuccess(user);

      // 登錄成功彈窗：字體適中，自動跳轉
      (Swal as any).fire({
        title: '歡迎回來！',
        text: `${user.name}，正在為您跳轉界面...`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        width: '400px', // 調小寬度
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
      // 匹配失敗判定
      const allUsers = this.authService.getUsers();
      if (allUsers.some(u => u.email === email)) {
        this.showHint('密碼錯誤，請重新輸入！', 'error');
      } else {
        this.showHint('此帳號尚未註冊，請先創建帳號', 'error');
      }
    }
  }

  /** 通用美化提示框 (小尺寸版) */
  private showHint(msg: string, iconType: any) {
    (Swal as any).fire({
      title: '提示',
      text: msg,
      icon: iconType,
      confirmButtonText: '確定',
      confirmButtonColor: '#8b2d2d', // 配合您的紅棕色按鈕
      width: '400px',
      padding: '1.2rem',
      borderRadius: '12px'
    });
  }

  togglePassword() { this.showPassword = !this.showPassword; }
}
