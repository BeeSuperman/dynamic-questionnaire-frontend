import { Injectable } from '@angular/core';
import { Questionnaire, QuestionnaireAnswer } from '../models/questionnaire.model';
// 這個代碼說明：
// -------------------------------------------
// 代码里先写 if (!sessionStorage.getItem(...)) 再调用 initMockData() 执行 setItem，本质是 「按需初始化」 —— 只有当 sessionStorage 里没有问卷数据时，才执行 setItem 存入测试数据；如果已有数据，就跳过存储操作，避免覆盖已有数据。
// 如果反过来「先 setItem 再判断」，会导致每次服务初始化都覆盖已有数据（比如用户新增 / 修改的问卷会被测试数据冲掉），这是不符合业务逻辑的。
// ---------------------
// getItem(键名) 的作用是「按这个键名去查有没有对应值」，不是「查这个键名是否存在」；
// 首次执行时，「键名 dynamic_questionnaires 下没有值」→ getItem 返回 null → 触发 setItem 绑定「键名 - 值」；
// 非首次执行时，「键名 dynamic_questionnaires 下已有值」→ getItem 返回值 → 跳过 setItem。
// ----------------------------------
// 先厘清：getItem 只认「键名」，不认「是否存过值」
// -----------------------------
// getItem('xxx')	「按 xxx 这个名字，去 sessionStorage 里找有没有对应的数值」→ 找不到就返回 null，找得到就返回值；
// setItem('xxx', y)	「把 y 这个值，绑定到 xxx 这个名字下，存到 sessionStorage 里」→ 不管之前有没有值，都会覆盖；
@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  // 聲明一個變數=右邊這個，右邊這個是sessionStorage的getItem(鍵名字串)和
  // setItem(鍵名字串, 值字串)中的鍵名字串，
  // =左右兩邊都是我們自取的名字
  private readonly STORAGE_KEY = 'dynamic_questionnaires';
  private readonly ANSWER_KEY = 'questionnaire_answers';
  // 構造函數是初始化這個類的屬性STORAGE_KEY和ANSWER_KEY後第一個執行的方法
  constructor() {
    // 初始化判斷：如果 storage 是空的，可以預設塞入一些測試資料（對應 PPT 第 6 頁的範例）

    if (!sessionStorage.getItem(this.STORAGE_KEY)) {
      // sessionStorage 是瀏覽器提供的「鍵值對（Key-Value）」儲存物件，核心規則：
      // 儲存時：必須用 setItem(鍵名字串, 值字串) 把「鍵名」和「值」綁定：
      // 讀取時：用 getItem(鍵名字串) 根據綁定關係找對應值：
      // sessionStorage 的設計規則就是「鍵名必須是字串類型」（這是瀏覽器原生約定）；
      // 用 getItem(鍵名字串) 根據綁定關係找對應值，因為上面說了STORAGE_KEY等於''dynamic_questionnaires,同時
      this.initMockData();
    }
  }

  // --- 問卷管理 (後台/列表) -----------------------------------

  /** 獲取所有問卷列表 [cite: 39, 167] */
  getAllQuestionnaires(): Questionnaire[] {
    const data = sessionStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /** 根據 ID 獲取單份問卷 [cite: 71] */
  getQuestionnaireById(id: number): Questionnaire | undefined {
    return this.getAllQuestionnaires().find(q => q.id === id);
  }

  /** 儲存或更新問卷 [cite: 339, 340] */
  saveQuestionnaire(questionnaire: Questionnaire): void {
    const list = this.getAllQuestionnaires();
    const index = list.findIndex(q => q.id === questionnaire.id);

    if (index > -1) {
      list[index] = questionnaire; // 更新
    } else {
      questionnaire.id = this.generateId(list); // 新增並自動產生 ID
      // generateId 方法 —— 它会自动生成比现有问卷最大 ID 大 1 的新 ID，完全贴合文档中编号 Auto Increments（自动递增）的需求。
      list.push(questionnaire);
    }
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  /** 刪除問卷 [cite: 210, 214] */
  deleteQuestionnaires(ids: number[]): void {
    let list = this.getAllQuestionnaires();
    list = list.filter(q => !ids.includes(q.id));
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  // --- 填寫與答案處理 (前台) ------------------------------------------------------






  //   暫存作答內容到 Session (確認頁使用)，正式將答案寫入「資料庫」並清除暫存 ，請問這兩個對應了什麼功能：
  //   1。暂存作答内容（确认页专用）-----解决痛点：用户填写问卷时（比如填了一半刷新页面、切换题目），
  //   内容不会丢失；跳转到确认页时，能读取到之前填的所有信息。
  // 2.正式提交答案（写入 + 清暂存）
  // 文档明确要求：「确认后才能储存」「按下送出按钮：写到资料库，并跳回问卷列表」「取消暂存（返回填写页时带回数据，提交后清除）」；
  // 解决痛点：用户确认填写无误后，将答案永久保存，同时清理临时数据，避免重复提交或暂存数据占用空间。


  /** 暫存作答內容到 Session (確認頁使用) [cite: 75, 111] */
  setTempAnswer(answer: QuestionnaireAnswer): void {
    sessionStorage.setItem('temp_current_answer', JSON.stringify(answer));
  }

  /** 獲取暫存答案 [cite: 128] */
  getTempAnswer(): QuestionnaireAnswer | null {
    const data = sessionStorage.getItem('temp_current_answer');
    return data ? JSON.parse(data) : null;
  }

  /** 正式將答案寫入「資料庫」並清除暫存 [cite: 115, 136] */
  submitFinalAnswer(answer: QuestionnaireAnswer): void {
    const allAnswers = this.getAllAnswers();
    allAnswers.push(answer);
    sessionStorage.setItem(this.ANSWER_KEY, JSON.stringify(allAnswers));
    sessionStorage.removeItem('temp_current_answer');

    // 同時更新問卷的統計數據 (voteData) [cite: 42, 400]
    this.updateVoteData(answer);
  }
  // 用於從 sessionStorage 獲取問卷答案數據
  private getAllAnswers(): QuestionnaireAnswer[] {
    const data = sessionStorage.getItem(this.ANSWER_KEY);

    return data ? JSON.parse(data) : [];

    // return data ? JSON.parse(data) : [];
    // 三元運算判斷：

    // 如果 data 存在：JSON.parse(data) 將 JSON 字符串轉換為 JavaScript 對象/數組

    // 如果 data 不存在：返回空數組 []




  }

  // --- 工具類方法 ---

  private generateId(list: any[]): number {
    return list.length > 0 ? Math.max(...list.map(i => i.id)) + 1 : 1;
    // deepseek註解就很好，用多種AI解釋
    // 1. 檢查數組是否為空
    //     list.length > 0 ? ... : 1
    // 如果數組為空（length === 0），直接返回 1
    // 如果數組有元素，執行後面的邏輯：{
    // 2. 找出最大 ID
    // math.max(...list.map(i => i.id))
    // • list.map(i => i.id)：提取數組中所有物件的 id 屬性，返回一個數字數組
    // • Math.max(...array)：使用展開運算符找到最大的 ID 值}
    // 3. 生成新 ID
    // 最大ID + 1：確保新 ID 比現有所有 ID 都大



  }

  /** 更新統計百分比邏輯 [cite: 152, 402] */
  private updateVoteData(answer: QuestionnaireAnswer) {
    // 此處實作邏輯：讀取問卷 -> 根據 answer 更新 voteData -> 存回 sessionStorage
  }
  isEmailSubmited(questionnaireId: number, email: string): boolean {
  const allAnswers = this.getAllAnswers();
  // 檢查所有已提交的答案中，是否存在相同的問卷 ID 且 Email 相同的人
  return allAnswers.some(ans =>
    ans.questionnaireId === questionnaireId &&
    ans.email.trim().toLowerCase() === email.trim().toLowerCase()
  );
}
  // 這裡是死數據，我們手動在service.ts裡面敲的，因為當session裡面沒有數據的時候會想測試，所以先有個死數據測試一下
  private initMockData() {
    // 這裡可以放入 PPT 第 6 頁的範例問卷資料
    const mockData: Questionnaire[] = [
      {
       id: 1,
        title: '青春洋溢高中生人氣投票戰',
        description: '歡迎參加年度人氣投票！請選出您心目中最支持的參賽者，並分享您的看法。您的每一票都是對選手最大的鼓勵！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'),
        questions: [
          {
            id: 1,
            title: '【單選】請選出您最支持的人氣選手',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '何廢料 (建國中學)' },
              { id: 2, content: '+7/77 (金女中)' },
              { id: 3, content: '林小明 (台中一中)' },
              { id: 4, content: '陳大華 (高雄中學)' }
            ]
          },
          {
            id: 2,
            title: '【可多選】您支持該選手的原因有哪些？',
            type: 'multiple',
            required: true,
            options: [
              { id: 1, content: '才華洋溢' },
              { id: 2, content: '外型出眾' },
              { id: 3, content: '性格親民' },
              { id: 4, content: '學習成績優異' },
              { id: 5, content: '社團表現傑出' }
            ]
          },
          {
            id: 3,
            title: '【文字】請寫下您對支持選手的一句加油話語',
            type: 'text',
            required: true
          },
          {
            id: 4,
            title: '【可多選】您平時透過哪些管道關注校園人氣賽事？',
            type: 'multiple',
            required: false,
            options: [
              { id: 1, content: 'Instagram' },
              { id: 2, content: 'Facebook' },
              { id: 3, content: '校園公告欄' },
              { id: 4, content: 'Dcard' },
              { id: 5, content: '朋友介紹' }
            ]
          },
          {
            id: 5,
            title: '【文字】對於下一屆人氣投票活動，您有什麼建議嗎？',
            type: 'text',
            required: false
          }
        ]
      },
      {
        id: 2,
        title: 'E312購買傾向市調',
        description: '市場調查問卷',
        status: 'not_started', // 尚未開始 [cite: 52, 53]
        startTime: new Date('2025-12-22'),
        endTime: new Date('2025-12-31'),
        questions: []
      },
      {
        id: 3,
        title: '美食大賽',
        description: '請選出你心中最愛的食物',
        status: 'finished',
        startTime: new Date('2025-12-01'),
        endTime: new Date('2025-12-17'),
        questions: [{
          id: 1,
          title: '請選取最喜歡的食物',
          type: 'single',
          required: true,
          options: [
            { id: 1, content: '螺螄粉' },
            { id: 2, content: '鹽酥雞' }
          ]
        }]
      },
      {
        id: 4,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 5,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2025-12-29'),
        endTime: new Date('2025-12-30'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          },
          {
            id: 2,
            title: '請說明理由',
            type: 'text', // 类型设为text
            required: true // 可根据需要设置是否必填
          },
          {
            id: 3,
            title: '請選取在活動開始前有聽過的人',
            type: 'multiple', // 类型设为multiple
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' },
              // 可补充其他选项
              { id: 3, content: 'wen wen (金門高中)' },
              { id: 4, content: 'uily (基隆高中)' }
            ]
          }
        ]
      },
      {
        id: 6,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 7,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'not_started', // 尚未開始
        startTime: new Date('2025-12-28'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 8,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 9,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-20'), // 設為未來時間以便測試
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          },
          {
            id: 2,
            title: '請說明理由',
            type: 'text', // 类型设为text
            required: true // 可根据需要设置是否必填
          },
          {
            id: 3,
            title: '請選取在活動開始前有聽過的人',
            type: 'multiple', // 类型设为multiple
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' },
              // 可补充其他选项
              { id: 3, content: 'wen wen (金門高中)' },
              { id: 4, content: 'uily (基隆高中)' }
            ]
          }
        ]
      },
      {
        id: 10,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 11,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 12,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 13,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 14,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 15,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 16,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試 [cite: 79]
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
      {
        id: 17,
        title: '青春洋溢小學生人氣投票戰',
        description: '請選出你心中最支持的參賽者！',
        status: 'in_progress', // 進行中
        startTime: new Date('2023-08-12'),
        endTime: new Date('2025-12-31'), // 設為未來時間以便測試
        questions: [
          {
            id: 1,
            title: '請選取最喜歡的人',
            type: 'single',
            required: true,
            options: [
              { id: 1, content: '111(建國中學)' },
              { id: 2, content: '222(金女中)' }
            ]
          }
        ]
      },
    ];
    // 綁定：鍵名 = 'dynamic_questionnaires' ↔ 值 = 問卷資料的JSON字串
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockData));
  }
}

