import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
// ---[新增] 引入 HttpClient 相關設定
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    // ----[新增] 啟用 HttpClient，並開啟 fetch API 支援 (效能較好)
    provideHttpClient(withFetch())
  ]
};
