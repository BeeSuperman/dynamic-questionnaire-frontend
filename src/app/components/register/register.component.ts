// // import { Component } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { Router, RouterModule } from '@angular/router';
// // import { AuthService } from '../../services/auth.service';

// // @Component({
// //   selector: 'app-register',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule,RouterModule],
// //   templateUrl: './register.component.html',
// //   styleUrl: './register.component.scss'
// // })
// // export class RegisterComponent {
// //   userData = { name: '', email: '', password: '', phone: '' };

// //   constructor(private authService: AuthService, private router: Router) {}

// //   onRegister() {
// //     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// //     if (!this.userData.name || !this.userData.email || !this.userData.password) {
// //       alert('請填寫完整資訊！'); return;
// //     }
// //     if (!emailPattern.test(this.userData.email)) {
// //       alert('電子信箱格式不正確！'); return;
// //     }
// //     if (this.userData.password.length < 8 || this.userData.password.length > 12) {
// //       alert('密碼須為8到12個字！'); return;
// //     }

// //     const users = this.authService.getUsers();
// //     if (users.some(u => u.email === this.userData.email)) {
// //       alert('此信箱已被註冊！'); return;
// //     }

// //     this.authService.register(this.userData);
// //     alert('註冊成功！請使用新帳號登入。');
// //     this.router.navigate(['/login']);
// //   }
// // }
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './register.component.html',
//   styleUrl: './register.component.scss'
// })
// export class RegisterComponent {
//   userData = { name: '', email: '', password: '', phone: '' };

//   constructor(private authService: AuthService, private router: Router) {}

//   onRegister() {
//     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//     if (!this.userData.name || !this.userData.email || !this.userData.password) {
//       alert('請填寫完整資訊！');
//       return;
//     }
//     if (!emailPattern.test(this.userData.email)) {
//       alert('電子信箱格式不正確！');
//       return;
//     }
//     if (this.userData.password.length < 8 || this.userData.password.length > 12) {
//       alert('密碼須為8到12個字！');
//       return;
//     }

//     const users = this.authService.getUsers();
//     if (users.some(u => u.email === this.userData.email)) {
//       alert('此信箱已被註冊！');
//       return;
//     }

//     // 調用 AuthService 中新增的 register 方法
//     this.authService.register(this.userData);
//     alert('註冊成功！請使用新帳號重新登入。');
//     this.router.navigate(['/login']);
//   }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  userData = { name: '', email: '', password: '', phone: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // 1. 基礎卡控：使用美化彈窗
    if (!this.userData.name || !this.userData.email || !this.userData.password) {
      this.showHint('請填寫完整資訊！', 'info');
      return;
    }
    if (!emailPattern.test(this.userData.email)) {
      this.showHint('電子信箱格式不正確！', 'warning');
      return;
    }
    if (this.userData.password.length < 8 || this.userData.password.length > 12) {
      this.showHint('密碼須為 8 到 12 個字！', 'warning');
      return;
    }

    // 2. 檢查重複註冊
    const users = this.authService.getUsers();
    if (users.some(u => u.email === this.userData.email)) {
      this.showHint('此信箱已被註冊！', 'error');
      return;
    }

    // 3. 註冊成功處理
    this.authService.register(this.userData);

    (Swal as any).fire({
      title: '註冊成功！',
      text: '請使用新帳號重新登入系統。',
      icon: 'success',
      confirmButtonText: '前往登入',
      confirmButtonColor: '#8b2d2d', // 配合您的紅棕色按鈕主題
      width: '380px',               // 縮小寬度
      padding: '1.2rem',
      borderRadius: '12px',
      customClass: {
        title: 'swal-small-title',
        htmlContainer: 'swal-small-text'
      }
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  /**
   * 通用美化提示框 (精緻小尺寸版)
   */
  private showHint(msg: string, iconType: any) {
    (Swal as any).fire({
      title: '提示',
      text: msg,
      icon: iconType,
      confirmButtonText: '確定',
      confirmButtonColor: '#8b2d2d',
      width: '380px',
      padding: '1rem',
      borderRadius: '12px',
      customClass: {
        title: 'swal-small-title',
        htmlContainer: 'swal-small-text'
      }
    });
  }
}
