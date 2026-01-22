// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private readonly AUTH_KEY = 'user_login_status';
//   private readonly USER_KEY = 'registered_users';

//   constructor() {
//     // 初始化判斷：若無用戶資料，建立預設管理員帳號
//     if (!sessionStorage.getItem(this.USER_KEY)) {
//       const adminUser = [{
//         email: 'admin@test.com',
//         password: 'password123',
//         name: '管理員',
//         phone: '0900111222'
//       }];
//       sessionStorage.setItem(this.USER_KEY, JSON.stringify(adminUser));
//     }
//   }

//   /** 檢查是否已登入：看盒子裡有沒有 'true' */
//   isLoggedIn(): boolean {
//     return sessionStorage.getItem(this.AUTH_KEY) === 'true';
//   }

//   /** 獲取所有註冊用戶 */
//   getUsers(): any[] {
//     const data = sessionStorage.getItem(this.USER_KEY);
//     return data ? JSON.parse(data) : [];
//   }

//   /** 驗證登入資訊：比對 Email 和密碼 */
//   checkUser(email: string, pass: string): any {
//     const users = this.getUsers();
//     return users.find(u => u.email === email && u.password === pass);
//   }

//   /** * 登入成功：
//    * 1. 存入登入標記 2. 存入角色 3. 存入當前用戶完整資訊 (重要！)
//    */
//   loginSuccess(user: any) {
//     sessionStorage.setItem(this.AUTH_KEY, 'true');
//     sessionStorage.setItem('current_user', JSON.stringify(user));
//     const role = user.email.startsWith('admin') ? 'admin' : 'user';
//     sessionStorage.setItem('user_role', role);
//   }

//   /** 登出：徹底清空所有相關標記 */
//   logout() {
//     sessionStorage.removeItem(this.AUTH_KEY);
//     sessionStorage.removeItem('user_role');
//     sessionStorage.removeItem('current_user');
//   }

//   /** 註冊新帳號 */
//   register(userData: any) {
//     const users = this.getUsers();
//     users.push(userData);
//     sessionStorage.setItem(this.USER_KEY, JSON.stringify(users));
//   }

//   /** 獲取當前登入中的使用者資料 (修改資料頁面會用到) */
//   getCurrentUser(): any {
//     const data = sessionStorage.getItem('current_user');
//     return data ? JSON.parse(data) : null;
//   }

//   /** 更新使用者資料庫中的資訊 */
//   updateUserProfile(updatedUser: any) {
//     const users = this.getUsers();
//     const index = users.findIndex(u => u.email === updatedUser.email);
//     if (index > -1) {
//       users[index] = updatedUser;
//       sessionStorage.setItem(this.USER_KEY, JSON.stringify(users));
//       sessionStorage.setItem('current_user', JSON.stringify(updatedUser));
//     }
//   }
// }
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'user_login_status';
  private readonly USER_KEY = 'registered_users';

  constructor() {
    // 初始化判斷：若無用戶資料，建立預設管理員帳號
    if (!sessionStorage.getItem(this.USER_KEY)) {
      const adminUser = [{
        email: 'admin@test.com',
        password: 'password123',
        name: '管理員',
        phone: '0900111222'
      }];
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(adminUser));
    }
  }

  /** 檢查是否已登入 */
  isLoggedIn(): boolean {
    return sessionStorage.getItem(this.AUTH_KEY) === 'true';
  }

  /** 獲取所有註冊用戶清單 */
  getUsers(): any[] {
    const data = sessionStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : [];
  }

  /** 驗證登入資訊 */
  checkUser(email: string, pass: string): any {
    const users = this.getUsers();
    return users.find(u => u.email === email && u.password === pass);
  }

  /** 登入成功：存入標記、角色及完整用戶資訊 */
  loginSuccess(user: any) {
    sessionStorage.setItem(this.AUTH_KEY, 'true');
    sessionStorage.setItem('current_user', JSON.stringify(user));
    const role = user.email.startsWith('admin') ? 'admin' : 'user';
    sessionStorage.setItem('user_role', role);
  }

  /** 登出：清除所有 Session 標記 */
  logout() {
    sessionStorage.removeItem(this.AUTH_KEY);
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('current_user');
  }

  /** 【關鍵修正】新增註冊方法，將新用戶存入資料庫 */
  register(userData: any) {
    const users = this.getUsers();
    users.push(userData);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(users));
  }

  /** 獲取當前登入中的使用者資料 */
  getCurrentUser(): any {
    const data = sessionStorage.getItem('current_user');
    return data ? JSON.parse(data) : null;
  }

  /** 更新使用者資料 */
  updateUserProfile(updatedUser: any) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.email === updatedUser.email);
    if (index > -1) {
      users[index] = updatedUser;
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(users));
      sessionStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
  }
}
