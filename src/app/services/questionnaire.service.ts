
//---新增前兩個
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // 用於處理非同步回應
import { map } from 'rxjs/operators'; // [新增] 用於資料轉換
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
// 這是對應後端的 Request 參數---新增
// 對應後端 CreateReq 的格式
//----------------------串接第一步：創建接口，對應後端需要的傳入的格式，注意左邊的名字要和後端的屬性名對應一樣---這個文件有串接前後端的文件內容。如果這個武器 (Service) 都打造好了，現在我們要把它們裝到戰場上 (Component) 去試射看看！
export interface CreateQuestionnaireParam {
  title: string;
  description: string;
  startDate: string;      // 改為 startDate
  endDate: string;        // 改為 endDate
  published: boolean;
  questionList: Question[];
  /*
  []：代表它是一個 陣列 (Array)，也就是一串東西。
any：代表 「隨便什麼都可以」。
所以 any[] 的意思是：「這是一個裝了一堆隨便什麼東西的盒子」。
 前端工程師告訴 TypeScript 說：「我不確定裡面問題的長相是什麼，反正就是一堆東西，你不要管我，讓我過。」

這樣寫好嗎？
優點：寫起來很快，不用定義問題長什麼樣子。 缺點：容易寫錯。
例如你不小心打錯字 tiltle (多一個 l)，電腦不會幫你檢查出來，直到跑程式的時候才會報錯。
  */
}
// 定義「一個問題」長什麼樣
export interface Question {
  title: string;      // 問題標題
  type: string;       // 問題類型 (單選/多選/文字)
  required: boolean;  // 必填?
  options: string;    // 選項 (注意：後端通常把選項存成一個長字串，中間用分號隔開，例如 "A;B;C")
}


export interface UpdateQuestionnaireParam extends CreateQuestionnaireParam {
  quizId: number;
}









@Injectable({
  providedIn: 'root'
})
//----------------------串接第二步：創建service
export class QuestionnaireService {
  // 聲明一個變數=右邊這個，右邊這個是sessionStorage的getItem(鍵名字串)和
  // setItem(鍵名字串, 值字串)中的鍵名字串，
  // =左右兩邊都是我們自取的名字
  private readonly STORAGE_KEY = 'dynamic_questionnaires';
  private readonly ANSWER_KEY = 'questionnaire_answers';
  // 構造函數是初始化這個類的屬性STORAGE_KEY和ANSWER_KEY後第一個執行的方法

  // -----[新增] 這是後端的網址
  // 新增這行：我們現在直接連到 localhost:8080，因為後端沒有 /api/quiz 了,如果後端有加註解：@RequestMapping("/api/quiz")，
  // 就是8080後面機上/api/quiz。
  //表示網址前面這部分都是長這樣是固定的。現在後端的沒有註解@RequestMapping("/api/quiz")，所以是：http://localhost:8080'
  //這是後端伺服器的根目錄。
  // -----[新增] 這是後端的網址
  // 新增這行：我們現在直接連到 localhost:8080，因為後端沒有 /api/quiz 了
  // [修正] 指向 8080，這是後端 Spring Boot 啟動的 Port
  private readonly API_URL = 'http://localhost:8080';
  // -----[新增修改] 這裡把 HttpClient 注入進來
  constructor(private http: HttpClient) {
    // [刪除] 不需要再塞假資料了，因為我們要直接看資料庫
  }
  //----------------------串接第三步：在service裡開始寫各種呼叫後端api方法的方法

  // [新增] 這是呼叫後端新增問卷的方法
  // 修改這裡：網址改成後端的正確路徑，其中
  // post,req: QuestionnaireParam是要傳到controller的參數。後端參數是：@RequestBody CreateReq req.req是前端給的名字：後面是對應的類型。類型要在前端定義哦
  public createQuiz(req: CreateQuestionnaireParam): Observable<any> {
    // 2. 使用 API_URL 常數，網址變成 http://localhost:8080/quiz/create
    return this.http.post<any>(`${this.API_URL}/quiz/create`, req);
  }
  // 後端 Controller 是 @RequestMapping("/api/quiz") + @PostMapping("quiz/create")
  // 所以完整路徑是 http://localhost:8080/api/quiz/quiz/create
  // 不再是：return this.http.post<any>('http://localhost:8080/api/quiz/quiz/create', param);而是如上

  //獲得所有問卷列表的方法，get,無參
  public getQuizList(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/quiz/getAll`).pipe(
      map(response => {
        if (response.code === 200 && response.quizList) {
          response.quizList = response.quizList.map((item: any) => {
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);
            const now = new Date();
            let status = 'unpublished';

            if (item.published) {
              if (now < start) status = 'not_started';
              else if (now > end) status = 'finished';
              else status = 'in_progress';
            }

            return {
              ...item,
              startTime: start,
              endTime: end,
              status: status
            };
          });
        }
        return response;
      })
    );
  }
  //獲取某張問卷的所有問題，get，參數是@RequestParam("quizId") int quizId
  public getQuestionList(quizId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/quiz/get_QuestionList?quizId=${quizId}`);

  }
  //更新問卷，post，(@RequestBody UpdateReq req) {
  public updateQuiz(updateReq: UpdateQuestionnaireParam): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/quiz/update`, updateReq);

  }

  // 刪除問卷 (支持一次刪除多個)
  // 參數 ids--只是個名字: 我們想刪除的問卷 ID 陣列 (例如：[1, 2, 3])value是類型
  //這樣寫完之後，你在外面使用的時候就會非常簡單： service.deleteQuiz([1, 2, 3]) (給我刪掉 1, 2, 3 號)，就這麼簡單！
  public deleteQuiz(ids: number[]): Observable<any> {

    // 1. 準備便當盒 (包裝資料)
    // 後端規定要收到一個物件，裡面有個屬性叫 "quizIdList"，這個屬性名和後端對應上的
    const body = {
      quizIdList: ids  // 把我們傳進來的 ids 放進去
    };
    // 2. 寄出請求
    // 網址：http://localhost:8080/quiz/delete
    // 方法：POST
    //的內容：body (也就是那個包好的物件)
    return this.http.post<any>(`${this.API_URL}/quiz/delete`, body);
  }



  // --- 問卷管理 (後台/列表) -----------------------------------

  /** 獲取所有問卷列表 [cite: 39, 167] */
  getAllQuestionnaires(): Questionnaire[] {
    const data = sessionStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /** [修改] 根據 ID 獲取單份問卷 (呼叫後端 API) */
  getQuestionnaireById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/quiz/get?quizId=${id}`).pipe(
      map(response => {
        if (response.code === 200 && response.quiz) {
          const item = response.quiz;
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);
          const now = new Date();
          let status = 'unpublished';

          if (item.published) {
            if (now < start) status = 'not_started';
            else if (now > end) status = 'finished';
            else status = 'in_progress';
          }

          return {
            ...item,
            startTime: start,
            endTime: end,
            status: status
          };
        }
        return response; // 或 null/error handling
      })
    );
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

  /**
   * [新增] 提交問卷 (呼叫後端 API)
   * 將前端的 QuestionnaireAnswer 轉換為後端需要的 FillinReq 格式
   * 
   * @param answer 前端收集的答案模型
   * @param questions 問卷的題目定義 (用於獲取 type 和 required 資訊供後端校驗)
   */
  submitQuestionnaire(answer: QuestionnaireAnswer, questions: any[]): Observable<any> {
    const body = {
      quizId: answer.questionnaireId,
      name: answer.username,
      phone: answer.phone,
      email: answer.email,
      age: answer.age,
      // 將答案陣列轉換為後端 AnswerVo 結構
      answerVoList: answer.answers.map(ans => {
        // 必須找到對應的問題定義，因為後端 Service 層的 checkParams 需要檢查 type 和 required
        const qDef = questions.find(q => q.id === ans.questionId);
        return {
          question: {
            quizId: answer.questionnaireId, // 補上 quizId 以符合後端 Question 實體結構
            questionId: ans.questionId,
            // 後端 Enum 是大寫 (SINGLE/MULTI/TEXT)，前端是小寫，這裡做轉換
            type: qDef?.type.toUpperCase(),
            required: qDef?.required
          },
          // 如果是陣列(多選)，用 ; 串接，否則直接傳字串
          answer: Array.isArray(ans.value) ? ans.value.join(';') : ans.value,
          number: ans.questionId // [新增] 後端 AnswerVo 需要 number 欄位 (對應題目編號/ID)
        };
      })
    };
    return this.http.post<any>(`${this.API_URL}/quiz/fillin`, body);
  }

  /**
   * [新增] 獲取統計回饋 (呼叫後端 API)
   * 
   * @param quizId 問卷 ID
   * @returns 包含 UserVoList 的回應
   */
  getFeedback(quizId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/quiz/feedback?quizId=${quizId}`);
  }

  /** (已棄用) 儲存最終答案到 Session [cite: 133] */
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
    ];
    // 綁定：鍵名 = 'dynamic_questionnaires' ↔ 值 = 問卷資料的JSON字串
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockData));
  }
}

