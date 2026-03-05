# 串接前後端：給絕對新手的完全教學

這份教學會帶你「一行一行」看懂為什麼你的 **新增問卷 (Create)** API 是成功的，並教你如何模仿這個成功模式，把剩下的 **獲取列表 (Get All)** 和 **獲取詳細問題 (Get One)** 也串接起來。

我們把這個過程想像成「寄信」：前端是寄信人，後端是收信人。

---

## 第一部分：解剖成功的案例 (新增問卷)

你的「新增問卷」功能已經成功了，我們來看看它是怎麼運作的。

### 1. 後端 (收信人)：`QuizController.java`

這是後端打開門準備收信的地方。

```java
// 1. 設定這個控制器的「門牌號碼」是 /api/quiz
@RequestMapping("/api/quiz") 
public class QuizController {

    // 2. 定義一個「收信窗口」，專門處理「新增」請求
    // @PostMapping 代表：只收「POST」類型的信 (通常用來傳送新資料)
    // 完整地址 = 門牌(/api/quiz) + 窗口(quiz/create) = /api/quiz/quiz/create
    @PostMapping("quiz/create") 
    public CreateRes create(@RequestBody CreateReq req) {
        // @RequestBody 代表：信的內容 (JSON) 請自動幫我轉成 Java 物件 (CreateReq)
        // req 就是轉化好的資料
        return quizService.create(req); 
    }
}
```

*   **關鍵點 1 (網址)**：後端聽的地址是 `/api/quiz` 接上 `quiz/create`，所以前端必須寄到 `http://localhost:8080/api/quiz/quiz/create`。
*   **關鍵點 2 (方法)**：用的是 `@PostMapping`，所以前端必須用 `http.post`。
*   **關鍵點 3 (資料)**：用了 `@RequestBody`，表示前端要送一個 JSON 物件過來，而且長相要跟 `CreateReq` 一樣。

### 2. 前端 (寄信人)：`questionnaire.service.ts`

這是前端打包資料並寄出的地方。

```typescript
// 定義資料的長相 (要跟後端的 CreateReq 對得上)
export interface QuestionnaireParam {
  title: string;
  // ... 其他欄位
}

@Injectable(...)
export class QuestionnaireService {
  
  constructor(private http: HttpClient) {} // 注入 HttpClient，它是負責送信的郵差

  // 這是你的寄信方法
  createQuestionnaire(param: QuestionnaireParam): Observable<any> {
    // 呼叫 http.post (對應後端的 @PostMapping)
    // 第一個參數：網址 (對應後端的 @RequestMapping + @PostMapping)
    // 第二個參數：param (就是要寄出去的信件內容，會變成後端的 @RequestBody)
    return this.http.post<any>('http://localhost:8080/api/quiz/quiz/create', param);
  }
}
```

---

## 第二部分：模仿秀 (換你實作其他兩個 API)

現在我們要模仿上面的模式，把剩下兩個 API 接起來。

### 任務 1：獲取所有問卷 (Get All)

**後端代碼 (`QuizController.java`):**
```java
// 方法是 GetMapping (讀取資料用 GET)
// 完整地址 = /api/quiz/quiz/getAll
@GetMapping("quiz/getAll")
public GetQuizRes getQuizRes(){
    return quizService.getQuizList();		
}
```

**前端怎麼寫 (請模仿)：**
在 `questionnaire.service.ts` 裡找到 `getAllQuestionnaires` (或類似的方法)，修改成這樣：

```typescript
// 注意：這次後端是 @GetMapping，所以前端要用 http.get
// 注意：這次沒有 @RequestBody (因為只是去拿資料，不用帶像問卷內容那麼大的資料過去)，所以 get()括號裡通常只有網址

getAllQuestionnairesFromApi(): Observable<any> {
    // 1. 網址要對上：http://localhost:8080/api/quiz/quiz/getAll
    // 2. 方法要對上：http.get
    return this.http.get<any>('http://localhost:8080/api/quiz/quiz/getAll');
}
```
*(備註：原本的 `getAllQuestionnaires` 是讀 SessionStorage 的，你可以新建這個方法來測試 API)*

---

### 任務 2：獲取單一問卷內容 (Get Question List)

這題稍微難一點點，因為它有帶參數 (`?quizId=1`)。

**後端代碼 (`QuizController.java`):**
```java
// 方法是 GetMapping
// 完整地址 = /api/quiz/quiz/get_QuestionList
@GetMapping("quiz/get_QuestionList")
// @RequestParam("quizId") 代表：你要在網址後面告訴我 quizId 是多少
public GetQuestionRes getQuestionList(@RequestParam("quizId") int quizId){
    return quizService.getQuestionList(quizId);		
}
```

**前端怎麼寫 (請模仿)：**

```typescript
// 需要傳入一個 id 給後端
getQuestionnaireByIdFromApi(id: number): Observable<any> {
    // 方式 A (簡單暴力法)：直接用字串拼接把 ID 貼到網址後面
    // 網址會變成：http://localhost:8080/api/quiz/quiz/get_QuestionList?quizId=1
    
    // 1. 基礎網址
    const baseUrl = 'http://localhost:8080/api/quiz/quiz/get_QuestionList';
    
    // 2. 拼上參數 (注意問號 ? 和參數名 quizId 要跟後端 @RequestParam 一模一樣)
    const fullUrl = `${baseUrl}?quizId=${id}`; 

    // 3. 發送 GET 請求
    return this.http.get<any>(fullUrl);
}
```

---

## 總結口訣

1.  **看後端方法**：
    *   `@PostMapping` -> 前端用 `http.post`
    *   `@GetMapping` -> 前端用 `http.get`
2.  **看後端網址**：
    *   類別上的 `@RequestMapping` + 方法上的網址 = **完整網址**。
3.  **看後端參數**：
    *   `@RequestBody` -> 前端要把資料放在 `.post(url, 資料)` 的第二個參數。
    *   `@RequestParam` -> 前端要把資料拼在網址後面 `?key=value`。

現在，試試看把這些代碼加到你的 `src/app/services/questionnaire.service.ts` 裡，然後在元件裡呼叫看看！
