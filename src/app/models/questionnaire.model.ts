// export class QuestionnaireModel {
// }
// 資料庫表設計 (Database Tables)
/**
 * "問卷單個選項"定義介面
 * 用於單選題 (single) 或多選題 (multiple) 的選項定義
 */
export interface Option {
  /** 選項唯一識別碼 (通常為遞增 ID 或 UUID) */
  id: number;
  /** 選項顯示的文字內容 */
  content: string;
}




// 這一塊對應了PPT17，16
/**
 * "題目即問題"定義介面：
 * 描述單個問題的屬性與類型
 *
 */
export interface Question {
  /** 問題唯一識別碼 */
  id: number;
  /** 問題標題 (例如：您對本次服務滿意嗎？) */
  //  對應PPT16
  title: string;
  /** * 問題類型：
   * - 'single': 單選題
   * - 'multiple': 多選題
   * - 'text': 簡答/文字輸入題
   */
  type: 'single' | 'multiple' | 'text';
  /** 是否為必填項目 (前端校驗與後端存檔依據) */
  required: boolean;
  /** * 選項列表
   * 當 type 為 'single' 或 'multiple' 時必填；'text' 類型時可不傳或為空陣列
   */

  // 這點最重要！ 建議存成一個字串（例如：
  // 何廢料;+7/77;wensen），或用 JSON 格式儲存該題目的所有選項。
  // 文字題可能沒有選項，所以不一定存在所以用？
  options?: Option[];
}



// 對應PPT6,12
/**
 * "問卷"定義介面
 * 包含問卷的基本資訊、題目列表及初步的統計結果
 */
export interface Questionnaire {
  /** 問卷 ID */
  id: number;
  /** 問卷名稱 (標題) */
  title: string;
  /** 問卷詳細描述或導言 */

  description: string;
  /** 問卷開放填寫的時間 */
  /** * 問卷當前運作狀態：
   * - 'unpublished': 未發佈（草稿狀態）
   * - 'not_started': 已發佈但尚未到開始時間
   * - 'in_progress': 進行中
   * - 'finished': 已過截止日期或手動關閉
   */
  status: 'not_started' | 'in_progress' | 'finished' | 'unpublished';
  startTime: Date;
  /** 問卷截止填寫的時間 */
  endTime: Date;
  /** 是否已發佈 */
  published?: boolean;

  /** 包含的所有問題列表，順序由陣列索引決定 */
  questions: Question[];
  /** * 問卷統計數據 (選填)
   * 用於報表展現。Key 為 questionId，Value 包含該題目的選項標籤與對應票數
   * 範例：{ 1: { labels: ['滿意', '不滿意'], data: [10, 2] } }
   * 即投票數據是一個JSON數據類型，包含問題編號，問題選項，選項對應的票數
   */
  // 狀態是進行中、已結束才可觀看，狀態若是尚未開始，
  // 取消點選連結，這種情況是沒有voteData的，所以用？
  voteData?: {
    // 它對應 Question 介面中的 id。
    [questionId: number]: {
      // 儲存該題所有選項的文字
      // （例如：問你最喜歡的參賽選手是誰？labels是所有選項，
      // 即參賽選手的名字['何廢料', '+7/77']）
      labels: string[];
      // 儲存與 labels 一一對應的票數
      data: number[];
    };
  };
}



// PPT7，8

/**
 *"用戶提交的答案"定義介面
 * 用於定義填答者上傳的數據格式
 */
export interface QuestionnaireAnswer {
  /** 對應的問卷 ID */
  questionnaireId: number;
  /** 填寫人姓名 */
  username: string;
  /** 填寫人手機號 (可用於身份校驗或通知) */
  phone: string;
  /** 填寫人電子郵件 */
  email: string;
  /** 填寫人年齡 (選填項目) */
  age?: number;
  /** * 答案列表
   * 每個對象對應一個 questionId 及其作答內容
   */
  // 所有選項的所有答案：
  // answers: { ... }[]:
  // 意味著一封問卷裡可以有多個問題，每個問題的答案都是這個陣列裡的一個「元素」。
  answers: {
    /** 對應的問題 ID */
    questionId: number;
    /** * 答案值：
     * - 文字題：string (輸入內容)。答案是一串文字，所以是 string
     * - 單選題：string，答案是選中的那一個選項，所以也是 string
     * - 多選題：string[]：答案可能是多個選項，所以用 string[] (字串陣列) 來儲存
     */
    value: string | string[];
  }[];
}
