// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isLoggedIn()) {
//     // 有登入標記，放行
//     return true;
//   } else {
//     // 沒登入標記（被 logout 刪掉了），攔截並彈窗 [cite: 177, 187]
//     alert('請先登入後再進行操作！');
//     router.navigate(['/login']); // 踢回登入頁 [cite: 346]
//     return false;
//   }
// };
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    alert('偵測到未登入行為，請先登入！');
    router.navigate(['/login']);
    return false;
  }
};
