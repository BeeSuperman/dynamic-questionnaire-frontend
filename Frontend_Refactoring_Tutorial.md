# 觀念釐清：前端參數 vs. 後端物件

這又是一個非常棒的問題！
「後端明明要 `DeleteReq req`，為什麼前端方法參數卻只傳 `ids: number[]`？」

沒關係！我們換個角度想，用便當來比喻！🍱

---

## 🍱 「便當盒理論」

### 1. 後端 (學校) 的規定：DeleteReq
學校 (後端) 規定：帶便當來學校，一定要把飯裝在一個叫 `quizIdList` 的**便當盒**裡。
如果你直接把飯 (一堆數字) 撒在桌上，學校是不收的！

```java
// 後端看到的 DeleteReq：
public class DeleteReq {
    private List<Integer> quizIdList; //這就是那個便當盒的名字！
}
```

### 2. 你的資料 (前端的 ids)
你手上捧著一碗剛煮好的白飯 (`ids: number[]`)，這就是你要刪除的 ID 列表 (例如 `[1, 2, 3]`)。

### 3. Service 的工作 (媽媽)
`Service` 就像是把你送去上學的媽媽。
你只要把白飯 (`ids`) 交給她，她會自動幫你做這件事：
1.  拿出學校規定的便當盒。
2.  把白飯裝進去。
3.  蓋上蓋子 (`quizIdList`)。
4.  最後把你連人帶便當送去學校。

所以在寫程式的時候：
```typescript
  // 媽媽 (Service) 說：你只要給我白飯 (ids) 就好，其他的我來處理！
  public deleteQuiz(ids: number[]) {
    
    // --- 媽媽正在裝便當 ---
    const body = {
      quizIdList: ids  // 把白飯 (ids) 裝進貼著 'quizIdList' 標籤的盒子裡
    };
    // -------------------

    // 最後送到學校的是裝好的 body (便當盒)，不是散落的白飯
    return this.http.post(url, body); 
  }
```

### 為什麼這樣比較好？
因為你在外面呼叫媽媽的時候很輕鬆：
`媽媽.deleteQuiz([1, 2, 3])`  <-- 你只要給白飯就好，不用自己去找便當盒！

如果不這樣寫，你自己就要去找盒子：
`媽媽.deleteQuiz({ quizIdList: [1, 2, 3] })` <-- 你還要記得盒子叫什麼名字，很麻煩。

---

這樣有稍微懂一點了嗎？
我們寫在 Service 裡面的代碼，就是那個「把白飯裝進便當盒」的過程。
