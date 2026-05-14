import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'user_login_status';
  private readonly USER_KEY = 'current_user';
  private readonly API_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  /** 檢查是否已登入：看盒子裡有沒有 'true' */
  isLoggedIn(): boolean {
    return sessionStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  /**
   * [修改] 登入 API
   */
  login(req: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/user/login`, req).pipe(
      tap(res => {
        if (res.code === 200 && res.user) {
          this.loginSuccess(res.user);
        }
      })
    );
  }

  /**
   * [DEMO] 一鍵體驗登入 — 完全不呼叫後端 API，直接注入假資料
   * 用於 GitHub Pages 展示，讓面試官無需後端即可體驗完整功能
   * @param role 'admin' | 'user'
   */
  mockLogin(role: 'admin' | 'user'): Observable<any> {
    const mockUser = role === 'admin'
      ? { email: 'admin@demo.com', name: '管理員 Demo', phone: '0912345678', age: 30 }
      : { email: 'user@demo.com', name: '測試使用者 Demo', phone: '0987654321', age: 25 };

    // 直接寫入 sessionStorage，模擬後端登入成功後的狀態
    sessionStorage.setItem(this.STORAGE_KEY, 'true');
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
    sessionStorage.setItem('user_role', role);
    sessionStorage.setItem('mock_mode', 'true'); // ← 關鍵：讓所有 API 知道現在是 Demo 模式

    // 回傳一個即時成功的假 Observable
    return of({ code: 200, user: mockUser, message: 'Demo 模式登入成功' });
  }

  /** * 登入成功處理 */
  loginSuccess(user: any) {
    sessionStorage.setItem(this.STORAGE_KEY, 'true');
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    // 簡單判斷：如果 Email 是 admin 開頭則是管理員 (此邏輯僅供範例)
    const role = user.email.startsWith('admin') ? 'admin' : 'user';
    sessionStorage.setItem('user_role', role);
  }

  /** 登出：徹底清空所有相關標記 */
  logout() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem('mock_mode'); // ← 退出時同步清除 Demo 標記
  }

  /** [修改] 註冊 API */
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/user/register`, userData);
  }

  /** 獲取當前登入中的使用者資料 */
  getCurrentUser(): any {
    const data = sessionStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  /** [新增] 檢查 Email 是否為註冊會員 */
  checkRegistered(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/user/check_registered`, { email });
  }

  /** [修改] 更新使用者資料（呼叫後端 API，密碼會在後端加密後存入資料庫） */
  updateUserProfile(updatedUser: any): Observable<any> {
    const body = {
      email: updatedUser.email,
      name: updatedUser.name,
      password: updatedUser.password,
      phone: updatedUser.phone,
      age: updatedUser.age || 20
    };
    return this.http.post<any>(`${this.API_URL}/user/update`, body).pipe(
      tap(res => {
        if (res.code === 200) {
          // 同步更新瀏覽器暫存（清除密碼避免明文保留）
          const safeUser = { ...updatedUser, password: '' };
          sessionStorage.setItem(this.USER_KEY, JSON.stringify(safeUser));
        }
      })
    );
  }
}
