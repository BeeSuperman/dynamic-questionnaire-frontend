# 📋 Dynamic Questionnaire System

> 一個基於 **Angular 19** 構建的全功能問卷管理平台，涵蓋動態問卷設計、即時統計圖表、前後台角色分離與 Token 身份驗證，並已部署至 GitHub Pages。

<div align="center">

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Angular_Material-19-7B1FA2?style=for-the-badge&logo=angular&logoColor=white)](https://material.angular.io/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)](https://rxjs.dev/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

**🔗 Live Demo：[https://BeeSuperman.github.io/dynamic-questionnaire-frontend](https://BeeSuperman.github.io/dynamic-questionnaire-frontend)**

</div>

---

## 📌 專案簡介

本專案是一套完整的「動態問卷系統」前端應用，實作了前台（一般使用者）與後台（管理者）兩大角色的完整業務流程。系統透過 **RESTful API** 與後端溝通，使用 **Angular Reactive Forms** 處理複雜表單，並整合 **Chart.js** 提供直覺的統計視覺化呈現。

本專案旨在展示以下企業級前端開發能力：
- ✅ **Component-Based Architecture** — 高度模組化的元件拆分設計
- ✅ **Route Guard（路由守衛）** — 基於 Token 的前端身份驗證與頁面保護
- ✅ **Reactive Forms** — 複雜的表單驗證與動態控件管理
- ✅ **服務層抽象（Service Layer）** — 統一的 HttpClient 封裝，關注點分離
- ✅ **CI/CD 自動部署** — 透過 `gh-pages` 一鍵發布至 GitHub Pages

---

## ✨ 功能特色

### 👤 使用者端（公開頁面）

| 功能 | 說明 |
|------|------|
| 問卷列表瀏覽 | 呈現所有已發布的公開問卷，含標題、狀態等資訊 |
| 動態問卷填寫 | 根據後端資料結構，**動態渲染**單選、多選、簡答等題型 |
| 填寫確認頁 | 送出前讓使用者完整預覽並二次確認作答內容 |
| 統計圖表查看 | 以 **Chart.js** 圓餅圖／長條圖可視化呈現各題統計結果 |

### 🔐 會員系統

| 功能 | 說明 |
|------|------|
| 會員註冊 | 含欄位格式驗證的完整帳號建立流程 |
| 登入 / 登出 | JWT Token 身份驗證，Session 安全管理 |
| 個人資料管理 | 查看與編輯會員基本資訊 |

### 🛠️ 管理者端（受保護頁面，需登入）

| 功能 | 說明 |
|------|------|
| 問卷管理列表 | 查看所有問卷狀態，執行發布 / 下架 / 刪除 |
| 問卷動態設計 | 可視化介面新增 / 編輯問卷題目，支援多種題型 |
| 問卷結果管理 | 逐筆查閱每位使用者的作答紀錄 |

---

## 🏗️ 專案架構

```
src/
└── app/
    ├── components/                  # 功能元件（Feature Components）
    │   ├── login/                   # 登入頁
    │   ├── register/                # 會員註冊
    │   ├── list/                    # 前台問卷列表
    │   ├── questionnaire-fill/      # 動態問卷填寫
    │   ├── questionnaire-confirm/   # 填寫確認頁
    │   ├── statistic/               # 統計圖表（Chart.js）
    │   ├── adminlist/               # 後台問卷管理列表
    │   ├── admindesign/             # 問卷設計器
    │   ├── adminresult/             # 後台作答結果查看
    │   ├── member-profile/          # 個人資料頁
    │   └── sidenav/                 # 側邊導覽列元件
    ├── guards/
    │   └── auth.guard.ts            # 路由守衛（Token 驗證）
    ├── models/                      # TypeScript 型別定義（介面）
    ├── services/
    │   ├── auth.service.ts          # 身份驗證服務
    │   └── questionnaire.service.ts # 問卷相關 API 封裝
    ├── app.routes.ts                # 三層路由配置
    └── app.config.ts                # 應用程式全域設定
```

---

## 🔧 技術棧

| 類別 | 技術 | 版本 |
|------|------|------|
| 前端框架 | Angular | 19.0 |
| 程式語言 | TypeScript | 5.6 |
| UI 元件庫 | Angular Material + CDK | 19.2 |
| 圖表視覺化 | Chart.js | 4.5 |
| 表單處理 | Angular Reactive Forms | 內建 |
| 路由管理 | Angular Router + Route Guards | 內建 |
| HTTP 通訊 | Angular HttpClient | 內建 |
| 彈窗通知 | SweetAlert2 | 11.x |
| 非同步處理 | RxJS | 7.8 |
| 樣式預處理 | SCSS | - |
| 部署工具 | gh-pages | 6.x |

---

## 🚀 技術亮點

### 1. 三層式路由架構（Route Strategy）

```typescript
// app.routes.ts

// ── 第一層：公開路由（任何人皆可訪問）──
{ path: 'list',            component: ListComponent },
{ path: 'questionnaire/:id', component: QuestionnaireFillComponent },
{ path: 'statistic/:id',   component: StatisticComponent },

// ── 第二層：受保護路由（需通過 authGuard）──
{
  path: 'adminlist',
  component: AdminlistComponent,
  canActivate: [authGuard]   // ← Token 驗證守衛
},
{
  path: 'member-profile',
  component: MemberProfileComponent,
  canActivate: [authGuard]
},

// ── 第三層：防呆重定向 ──
{ path: '',    redirectTo: '/login', pathMatch: 'full' },
{ path: '**',  redirectTo: '/list' }
```

### 2. 動態問卷渲染（Data-Driven Rendering）

問卷填寫頁完全由後端 API 回傳的資料結構驅動，透過 `*ngFor` 迭代題目、`@switch` 判斷題型，**無需任何硬編碼**，新增題型只需擴展資料模型即可，高度符合 Open/Closed Principle。

### 3. 服務層統一封裝（Service Abstraction）

所有 API 呼叫集中在 `questionnaire.service.ts`，元件僅依賴 Service 方法，不直接操作 HttpClient，達到**關注點分離（Separation of Concerns）**，便於測試與維護。

### 4. Chart.js 統計視覺化

整合 Chart.js 將問卷回覆數據即時渲染為圓餅圖與長條圖，每次頁面進入時**自動銷毀舊 Chart 實例**（避免記憶體洩漏），確保圖表資料正確刷新。

### 5. SweetAlert2 使用者體驗優化

全站操作（送出、刪除、錯誤）統一使用 SweetAlert2 提供語意明確的互動反饋，取代原生 `alert()`，提升整體使用者體驗。

---

## ⚡ 快速開始

### 環境需求

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Angular CLI** ≥ 19.x

### 安裝與啟動

```bash
# 1. Clone 專案
git clone https://github.com/BeeSuperman/dynamic-questionnaire-frontend.git

# 2. 進入專案目錄
cd dynamic-questionnaire-frontend

# 3. 安裝相依套件
npm install

# 4. 啟動本地開發伺服器
npm start
```

開啟瀏覽器前往 `http://localhost:4200/` 即可看到應用程式。

---

## 📦 建置與部署

```bash
# 建置生產版本（輸出至 dist/）
npm run build

# 一鍵部署至 GitHub Pages
npm run deploy
```

> 部署腳本會自動執行 `ng build --base-href` 並透過 `gh-pages` 將 `dist/` 發布至 `gh-pages` 分支。

---

## 📁 NPM 腳本說明

| 指令 | 說明 |
|------|------|
| `npm start` | 啟動本地開發伺服器 (`localhost:4200`) |
| `npm run build` | 建置生產版本至 `dist/` |
| `npm run watch` | 開發模式，監聽檔案變更自動重建 |
| `npm test` | 執行 Karma 單元測試 |
| `npm run deploy` | 建置並自動部署至 GitHub Pages |

---

## 👨‍💻 作者

**BeeSuperman**

- 🐙 GitHub：[@BeeSuperman](https://github.com/BeeSuperman)
- 如果這個專案對你有幫助，歡迎給個 ⭐ Star 支持！

---

<p align="center">Made with ❤️ using Angular 19 · TypeScript · Angular Material · Chart.js</p>
