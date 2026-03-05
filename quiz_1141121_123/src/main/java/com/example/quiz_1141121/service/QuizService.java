package com.example.quiz_1141121.service;

import java.text.CollationElementIterator;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import com.example.quiz_1141121.constants.ReplyMessage;
import com.example.quiz_1141121.constants.Type;
import com.example.quiz_1141121.dao.QuestionDao;
import com.example.quiz_1141121.dao.QuizDao;
import com.example.quiz_1141121.entity.Question;
import com.example.quiz_1141121.entity.Quiz;
import com.example.quiz_1141121.req.CreateReq;
import com.example.quiz_1141121.req.DeleteReq;
import com.example.quiz_1141121.req.UpdateReq;
import com.example.quiz_1141121.res.BasicRes;
import com.example.quiz_1141121.res.CreateRes;
import com.example.quiz_1141121.res.GetQuestionRes;
import com.example.quiz_1141121.res.GetQuizRes;
import com.example.quiz_1141121.res.GetSingleQuizRes;
import com.example.quiz_1141121.res.UpdateRes;

@Service
@Transactional(rollbackFor = Exception.class) // 也可以加在類別上，每個方法都有回溯這個效果
public class QuizService {// 注意這是最外層
	@Autowired
	private QuizDao quizDao;
	@Autowired
	private QuestionDao questionDao;

	@Transactional(rollbackFor = Exception.class)
	// 當一個方法裡面一個DAO.多次方法或者不同DAO.方法時候要用 @Transactional ，這樣就兩個都成功兩個都不成功，否則容易有髒資料
	public CreateRes create(CreateReq req) {
		/*
		 * 參數檢查
		 */
		// checkParams(CreateReq req);
		// 家庭作業：檢查完了：寫DAO....新增問卷---》2，取問卷ID 3.新增問題
		/*
		 * 我們需要處理「關聯性」。因為 Question 必須知道它屬於哪一個 Quiz（即 quiz_id）, 所以標準流程是：先儲存問卷主體 -> 取得產生的
		 * ID -> 設定給所有問題 -> 儲存所有問題。
		 */

		CreateRes checkResult = checkParams(req);
		// 因為您現在成功是回傳 SUCCESS 物件，所以要檢查 code 是否為 SUCCESS 的 code
		// if (checkResult.getCode() != ReplyMessage.SUCCESS.getCode()) {
		// return checkResult; // 如果不等於成功，就直接回傳錯誤資訊
		// }
		if (checkResult != null) {
			return checkResult; // 如果不等於成功，就直接回傳錯誤資訊
		} // 因為一個方法裡面一個DAO.多次方法或者不同DAO.方法，所以@Transactional，因為用想catch是Exception,所以要用try-catch.後
			// 把exception拋出去，並且記得加@rollbackFor：Transactional(rollbackFor = Exception.class)
		try {
			// 新增問卷
			quizDao.insertQuiz(req.getTitle(), req.getDescription(), req.getStartDate(), req.getEndDate(),
					req.isPublished());

			// B. 獲取剛剛產生的問卷 ID
			// 調用您在 QuizDao 定義的 getLastInsertId 方法
			int quizId = quizDao.getMaxId();// 就算沒有寫成功，quizid也是會繼續變，因為transactional作用：
			// 可以用在多個人同時寫，一個人一旦開始就被佔了，就算沒成功也不會同樣的數字

			// C. 新增問題列表
			List<Question> questionList = req.getQuestionList();
			int questionNum = 1; // [新增] 自動編號，從 1 開始
			for (Question q : questionList) {
				// 調用您在 QuestionDao 定義的 insertQuestion 方法
				// 將獲取到的 quizId 傳入，並使用自動生成的 questionNum
				questionDao.insertQuestion(quizId, questionNum, q.getQuestion(), q.getType(), q.isRequired(),
						q.getOptions());
				questionNum++; // [新增] 編號遞增
			}

		} catch (Exception e) {
			throw e;
		}
		// 是放在這裡注意哦：
		return new CreateRes(ReplyMessage.SUCCESS.getCode(), ReplyMessage.SUCCESS.getMessage());
	}

	// 右鍵-property-utf8才可以不亂碼

	// 將參數檢查抽成公共的：此類的私有方法
	private CreateRes checkParams(CreateReq req) {
		if (!StringUtils.hasText(req.getTitle())) {
			return new CreateRes(ReplyMessage.TITLE_ERROR.getCode(), //

					ReplyMessage.TITLE_ERROR.getMessage());
		}
		if (!StringUtils.hasText(req.getDescription())) {
			return new CreateRes(ReplyMessage.DESCRIPTION_ERROR.getCode(), //

					ReplyMessage.DESCRIPTION_ERROR.getMessage());
		}
		/* 1. 開始時間不能比今天早 2. 開始時間不能比結束時間晚 3.是要判斷不能是Null，選擇的是null，輸入的字串是hasText檢查 */
		if (req.getStartDate() == null || req.getStartDate().isBefore(LocalDate.now())
				|| req.getStartDate().isAfter(req.getEndDate())) {
			return new CreateRes(ReplyMessage.START_DATE_ERROR.getCode(), //
					ReplyMessage.START_DATE_ERROR.getMessage());
		}
		/* 1. 結束時間不能比今天早 2.是要判斷不能是Null */
		if (req.getEndDate() == null || req.getEndDate().isBefore(LocalDate.now())) {
			return new CreateRes(ReplyMessage.END_DATE_ERROR.getCode(), //
					ReplyMessage.END_DATE_ERROR.getMessage());
		}
		for (Question item : req.getQuestionList()) {
			// 為了知道是哪一題出錯，所以把返回的類型中加上Question
			if (item.getQuestionId() < 0) {
				return new CreateRes(ReplyMessage.QUESTION_ID_ERROR.getCode(), //
						ReplyMessage.QUESTION_ID_ERROR.getMessage(), item.getQuestionId());
			}
			if (!StringUtils.hasText(item.getQuestion())) {
				return new CreateRes(ReplyMessage.QUESTION_ERROR.getCode(), //
						ReplyMessage.QUESTION_ERROR.getMessage(), item.getQuestionId());

			}
			/*
			 * if(!StringUtils.hasText(item.getType())//A: 如果沒有填寫類型
			 * ||!item.getType().equals(Type.SINGLE.getType())//B: 或者 不是單選
			 * &&!item.getType().equals(Type.MULTI.getType())//C: 且 不是多選
			 * &&!item.getType().equals(Type.TEXT.getType())) {//D: 且 不是問答 return new
			 * CreateRes(ReplyMessage.TYPE_ERROR.getCode(), //
			 * ReplyMessage.TYPE_ERROR.getMessage()); 問題點：運算優先級與邏輯陷阱
			 * 
			 * 優先權（Precedence）：在 Java 中，&&（且）的優先權比 ||（或）高。
			 * 
			 * 這段程式碼實際上會被電腦解讀為：A || (B && C && D)。
			 * 
			 * 結果：如果 item.getType() 是 "SINGLE"。
			 * 
			 * A 為假（因為有字串）。
			 * 
			 * (B && C && D) 中，因為 B 是 !SINGLE.equals(SINGLE)，結果為假。
			 * 
			 * 最後變成 false || false，所以檢查通過。看起來是對的？
			 * 
			 * 但是！ 萬一 A 是真（類型是空的），整個式子就會變成 true || ...。雖然這裡剛好會回傳錯誤，但這種混用 || 和 &&
			 * 的寫法非常容易讓讀者產生歧義。 }---------家庭作業3，閱讀這個註解理解
			 */
			/*
			 * if(!StringUtils.hasText(item.getType())////有東西且東西不是種類類型的時候A: 如果沒填寫類型
			 * &&(!item.getType().equals(Type.SINGLE.getType())//且 (不是單選
			 * ||!item.getType().equals(Type.MULTI.getType())//或 不是多選
			 * ||!item.getType().equals(Type.TEXT.getType())) ){ return new
			 * CreateRes(ReplyMessage.TYPE_ERROR.getCode(), //或 不是問答)
			 * ReplyMessage.TYPE_ERROR.getMessage()); 問題點：這段是「絕對錯誤」的邏輯
			 * 
			 * 這段邏輯的意思是：沒有填寫類型 並且 它不是 A 或不是 B 或不是 C。
			 * 
			 * 致命傷 1：如果 !StringUtils.hasText 是真的，代表字串是空的。一個空的字串怎麼去執行後面的 .equals()？這會直接噴
			 * NullPointerException (NPE)。
			 * 
			 * 致命傷 2（邏輯悖論）：內層的 ||（或）永遠為真。因為一個字串不可能「同時是單選又是多選」，所以它「不是單選」或「不是多選」這件事一定會成立。 }
			 */
			/*
			 * 正確的邏輯思考方式: if (!StringUtils.hasText(type) || (!type.equals("SINGLE") &&
			 * !type.equals("MULTI") && !type.equals("TEXT"))) { return ERROR; }
			 */

			if (!Type.check(item.getType())) {
				return new CreateRes(ReplyMessage.TYPE_ERROR.getCode(), //
						ReplyMessage.TYPE_ERROR.getMessage(), item.getQuestionId());

			}

			// 家庭作業：還要檢查“選項---------1.
			// 如果是單選或多選，選項字串不可以是空的
			if (item.getType().equalsIgnoreCase(Type.SINGLE.getType())
					|| item.getType().equalsIgnoreCase(Type.MULTI.getType())) {
				if (!StringUtils.hasText(item.getOptions())) {
					return new CreateRes(ReplyMessage.OPTIONS_ERROR.getCode(), ReplyMessage.OPTIONS_ERROR.getMessage(),
							item.getQuestionId());
				}
			}

		}
		// 只要經過了if(!Type.check(item.getType())){，所以只可能是三選一。--
		/// 邏輯推論（排除法）能讓代碼更精簡，也減少了 || 判斷的複雜度。
		/*
		 * 所以還有一種寫法是：所以可以用這個讓代碼更短： if
		 * (！item.getType().equalsIgnoreCase(Type.TEXT.getType()) ){ if
		 * (!StringUtils.hasText(item.getOptions())) { return new
		 * CreateRes(ReplyMessage.OPTIONS_ERROR.getCode(),
		 * ReplyMessage.OPTIONS_ERROR.getMessage()); }
		 * 
		 */

		return null;
		// return new CreateRes(ReplyMessage.SUCCESS.getCode(),
		// ReplyMessage.SUCCESS.getMessage());
		/*
		 * 為什麼選 return null？ 在 Java 開發（特別是 Service 層）中，將參數檢查抽成一個 private 方法時，約定俗成的做法是：
		 * 
		 * 返回 null：代表「一切正常，沒有錯誤」。
		 * 
		 * 返回 Object：代表「發現錯誤，這是錯誤的詳細資訊」。
		 */
	}

	public GetQuizRes getQuizList() {
		// 因為這個方法也是會返回code和message的，所以另外再生成一個新的res
		// List<Quiz> list=quizDao.getAll();不寫這個後續使用匿名
		return new GetQuizRes(ReplyMessage.SUCCESS.getCode(), ReplyMessage.SUCCESS.getMessage(), quizDao.getAll());

	}

	public GetQuestionRes getQuestionList(int quizId) {
		return new GetQuestionRes(ReplyMessage.SUCCESS.getCode(), //
				ReplyMessage.SUCCESS.getMessage(), questionDao.getByQuizId(quizId));
	}

	// [新增] 獲取單個問卷的完整資訊 (包含問題)
	public GetSingleQuizRes getQuiz(int quizId) {
		Quiz quiz = quizDao.getById(quizId);
		if (quiz == null) {
			return new GetSingleQuizRes(ReplyMessage.QUIZ_NOT_FOUND.getCode(), //
					ReplyMessage.QUIZ_NOT_FOUND.getMessage());
		}
		List<Question> questions = questionDao.getByQuizId(quizId);
		return new GetSingleQuizRes(ReplyMessage.SUCCESS.getCode(), ReplyMessage.SUCCESS.getMessage(), //
				quiz.getId(), quiz.getTitle(), quiz.getDescription(), quiz.getStartDate(), //
				quiz.getEndDate(), quiz.isPublished(), questions);
	}
	
	
	
	

	// 更新問卷：
	@Transactional(rollbackFor = Exception.class)
	public UpdateRes update(UpdateReq req) {
		/*
		 * 因為是更新，所以要檢查quizId，因為存在DB中的quizId一定是大於0的，就算數據庫是AI的，但在 插入的時候是檢查PK是否存在，不存在則插入。
		 * 但更新的時候是也會更新QUIZEID的？？通常不會更新！只是作為where的條件而已。
		 * 做這個判斷的原因是：
		 * 這個會被sql用到！使用這個QUIZEID作為where的條件！所以：不如在 API 一進來就攔截掉無效的，避免浪費查詢。
		 * 這是軟體開發中的重要原則。與其讓程式跑完所有邏輯、
		 * 準備好資料，最後去問資料庫「請更新 ID 是 -5 的資料」，不如在 API 一進來就攔截掉。
		 */
		if (req.getQuizId() <= 0) {
			return new UpdateRes(ReplyMessage.QUIZ_ID_ERROR.getCode(), ReplyMessage.QUIZ_ID_ERROR.getMessage());
		}
		/*
		 * 檢查req中的quizId和：每個Qustion中的quizID是否相同
		 * 
		 */
		for (Question item : req.getQuestionList()) {
			if (req.getQuizId() != item.getQuizId()) {
				return new UpdateRes(ReplyMessage.QUIZ_ID_MISMATCH.getCode(),
						ReplyMessage.QUIZ_ID_MISMATCH.getMessage());

			}
		}
		/*
		 * WAY1:檢查是否可以被修改的狀態，1.未發佈2.已發佈且尚未開始(開始時間比現在時間晚）
		 * WAY2:排除法：！（已發佈且已經開始或已發佈已經結束）:
		 * WAY2:
		 * if((req.isPublished()&&(req.getStartDate().isBefore(LocalDate.now())||req.
		 * getStartDate().isEqual(LocalDate.now())))
		 * || req.getEndDate().isBefore(LocalDate.now())){
		 * WAY3:第二層排除法：已發佈&&！（未開始）||已經發佈&&“已經結束”：
		 * 思想一：已知①：從創建問卷的時候獲取：結束日期晚於開始日期，是開始日期===》結束日期。start>end
		 * 你要求：我再加個什麼條件②（這個條件就是填進if的條件）進去，可以由已知①②求得已經結束:end>today
		 * 可以知道：當我if寫：當today>start的時候，可以得出today>end，所以！today>start的時候，！(today>start)
		 * 的時候就是
		 * 可以得出end>today,那你可能會疑惑？！(today>start)的相反不應該是>=嗎？
		 * 注意：可以理解為>=，但有沒有可能>和=的返回值是一樣的呢？所以要動手去看源代碼或者方法解釋，不要想當然，不要無依據！
		 * 將鼠標移動到isAfter方法，可以看到懸浮窗：只有符合的是true，其他都是false（包括的等號），所以不需要考慮=情況
		 * LocalDate a = LocalDate.of(2012, 6, 30);
		 * LocalDate b = LocalDate.of(2012, 7, 1);
		 * a.isAfter(b) == false
		 * a.isAfter(a) == false
		 * b.isAfter(a) == true
		 * 思想二：也可以這樣思考：我要得出已發佈且已開始或已發佈且已結束。用一個表示：
		 * 畫圖法： (區塊a)start(區塊b）end（區塊c）====》我想要得到b+c,所以就取！a，a在這裡的表示就是：
		 * !req.getStartDate().isAfter(LocalDate.now()
		 */

		// &&優先於||
		// WAY1:
		/*
		 * if(!req.isPublished()||
		 * req.isPublished()&&req.getStartDate().isAfter(LocalDate.now()) ){
		 */
		// * 2.檢查更新的問卷是否有存在:主要是取得問卷的發佈狀態
		Quiz quiz = quizDao.getById(req.getQuizId());
		if (quiz == null) {
			return new UpdateRes(ReplyMessage.QUIZ_NOT_FOUND.getCode(),
					ReplyMessage.QUIZ_NOT_FOUND.getMessage());

		}
		// 檢查是否可以被修改的狀態:
		// WAY3:
		if (quiz.isPublished() && !req.getStartDate().isAfter(LocalDate.now())) {
			return new UpdateRes(ReplyMessage.QUIZ_UPDATE_FORBIDDEN.getCode(), //
					ReplyMessage.QUIZ_UPDATE_FORBIDDEN.getMessage());
		}

		/*
		 * 檢查其餘參數
		 * 
		 */
		// new一個子類別用一個父類別接，
		// CreateReq req1=(CreateReq)req;
		// Animal bird=（Animal)new Bird("打本鳥");相當於Animal bird=（Animal)new
		// Bird("打本鳥").---多態：可以省略（Animal)
		// 多態：無法使用子類的自由 方法。
		// 以上是解釋下一行的：
		CreateRes res = checkParams(req);
		if (res != null) {
			return new UpdateRes(res.getCode(), res.getMessage());
			// return (UpdateRes) res; 錯的
			// 不知道是什麼錯誤的時候鼠標移動上去看原因
			// 父類別強制轉型成子類別會錯！所以(UpdateRes) res;錯的
			// 類比是爸爸=new兒子。兒子會繼承爸爸的東西，但爸爸不能使用兒子私有的特性.
			// 那如果左邊是兒子右邊new是爸爸,那就是會錯！
		}
		try {
			// 插入的時候PK存在會發生什麼事：報錯。
			// 更新問卷流程：1.更新問卷2.檢查更新的問卷是否有存在(在上面）3.刪除同一個quizId下的所有Qestion4.新增更新後的問題
			/* 1.更新問卷 */
			quizDao.update(req.getQuizId(), req.getTitle(), req.getDescription(),
					req.getStartDate(), req.getEndDate(), req.isPublished());
			/*
			
			 */
			/*
			 * 3. 智慧更新問題列表 (Diff Update)
			 * 避免直接刪除所有問題，導致 Fillin 表的關聯資料遺失
			 */

			// A. 找出目前資料庫中該問卷的所有問題
			List<Question> oldQuestions = questionDao.getByQuizId(req.getQuizId());
			List<Integer> oldIds = oldQuestions.stream().map(Question::getQuestionId).toList();

			// B. 找出前端傳過來的問題 ID 列表
			List<Integer> newIds = req.getQuestionList().stream()
					.map(Question::getQuestionId)
					.filter(id -> id > 0) // 只看大於 0 的有效 ID
					.toList();

			// C. 找出需要刪除的 ID (在舊的中，但不在新的中)
			List<Integer> idsToDelete = oldIds.stream()
					.filter(id -> !newIds.contains(id))
					.toList();

			if (!idsToDelete.isEmpty()) {
				questionDao.deleteByIds(req.getQuizId(), idsToDelete);
			}

			// 準備新的 Question ID (取目前最大值 + 1)
			int nextId = oldIds.stream().max(Integer::compare).orElse(0) + 1;

			// D. 遍歷前端傳來的問題，決定是 Update 還是 Insert
			for (Question item : req.getQuestionList()) {
				// 如果 ID > 0 且在舊 ID 列表中 -> Update
				if (item.getQuestionId() > 0 && oldIds.contains(item.getQuestionId())) {
					questionDao.update(req.getQuizId(), item.getQuestion(), item.getType(),
							item.isRequired(), item.getOptions(), item.getQuestionId());
				} else {
					// 否則 (ID <= 0 或 是新 ID) -> Insert
					// 使用自動生成的 nextId，並遞增
					questionDao.insertQuestion(req.getQuizId(), nextId, item.getQuestion(), //
							item.getType(), item.isRequired(), item.getOptions());
					nextId++;
				}
			}
		} catch (Exception e) {
			throw e;
		}
		return new UpdateRes(ReplyMessage.SUCCESS.getCode(), //
				ReplyMessage.SUCCESS.getMessage());
	}

	// 刪除多個的問卷
	@Transactional(rollbackFor = Exception.class)
	public BasicRes delete(DeleteReq req) {
		/*
		 * 檢查參數
		 */
		if (CollectionUtils.isEmpty(req.getQuizIdList())) {
			return new BasicRes(ReplyMessage.QUIZ_ID_ERROR.getCode(), //
					ReplyMessage.QUIZ_ID_ERROR.getMessage());

		}
		for (int id : req.getQuizIdList()) {
			if (id <= 0) {
				return new BasicRes(ReplyMessage.QUIZ_ID_ERROR.getCode(), //
						ReplyMessage.QUIZ_ID_ERROR.getMessage());
			}
		}
		try {
			quizDao.delete(req.getQuizIdList());
			questionDao.delete(req.getQuizIdList());

		} catch (Exception e) {
			throw e;
		}

		return new BasicRes(ReplyMessage.SUCCESS.getCode(), //
				ReplyMessage.SUCCESS.getMessage());
	}

	// 刪除一個的問卷
	@Transactional(rollbackFor = Exception.class)
	public BasicRes delete(int quizId) {
		// 參數檢查
		if (quizId <= 0) {
			return new BasicRes(ReplyMessage.QUIZ_ID_ERROR.getCode(), //
					ReplyMessage.QUIZ_ID_ERROR.getMessage());

		}
		try {
			quizDao.delete(quizId);
			questionDao.delete(quizId);

		} catch (Exception e) {
			throw e;
		}

		return new BasicRes(ReplyMessage.SUCCESS.getCode(), //
				ReplyMessage.SUCCESS.getMessage());

	}

	// 刪除一個的問卷
	@Transactional(rollbackFor = Exception.class)
	public BasicRes delete2(int quizId) {
		List<Integer> list = List.of(quizId);// 只用在list不更動大小的時候
		DeleteReq req = new DeleteReq(list);
		BasicRes res = delete(req);
		return res;
		/*
		 * 上述代碼可以濃縮成一行：
		 * return delete(new DeleteReq(List.of(quizId)));
		 */

	}
}
