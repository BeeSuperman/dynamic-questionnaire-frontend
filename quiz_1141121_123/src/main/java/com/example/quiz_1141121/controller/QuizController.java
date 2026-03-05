package com.example.quiz_1141121.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.quiz_1141121.req.CreateReq;
import com.example.quiz_1141121.req.DeleteReq;
import com.example.quiz_1141121.req.FeedbackReq;
import com.example.quiz_1141121.req.FillinReq;
import com.example.quiz_1141121.req.UpdateReq;
import com.example.quiz_1141121.res.BasicRes;
import com.example.quiz_1141121.res.CreateRes;
import com.example.quiz_1141121.res.GetQuestionRes;
import com.example.quiz_1141121.res.GetQuizRes;
import com.example.quiz_1141121.res.GetSingleQuizRes;
import com.example.quiz_1141121.res.UpdateRes;
import com.example.quiz_1141121.service.FillinService;
import com.example.quiz_1141121.service.QuizService;

import jakarta.validation.Valid;

@RestController
// @RequestMapping("/api/quiz")最好有，沒有也沒關係
@CrossOrigin(origins = "http://localhost:4200")
public class QuizController {

	@Autowired
	private QuizService quizService;
	@Autowired
	private FillinService fillinService;
	/* @Valid: 讓 CreateReq 中的屬性限制生效 */
	@PostMapping("quiz/create")
	public CreateRes create(@Valid @RequestBody CreateReq req) {
		return quizService.create(req);
	}

	// 獲取所有問卷列表
	@GetMapping("quiz/getAll")
	public GetQuizRes getQuizRes() {
		return quizService.getQuizList();
	}

	// [新增] 獲取單張問卷完整資訊 (包含問題)
	@GetMapping("quiz/get")
	public GetSingleQuizRes getQuiz(@RequestParam("quizId") int quizId) {
		return quizService.getQuiz(quizId);
	}

	
	
	
	
	
	// 獲取某張問卷的所有問題
	/*
	 * API路徑：http://localhost:8080/quiz/get_QuestionList?quizId=1//後面的quizId是
	 * 
	 */
	@GetMapping("quiz/get_QuestionList") // 有些人嫌棄太長，所以用_的方式鏈接，這是api不是Java@RequestParam裡面的不是int那個
	public GetQuestionRes getQuestionList(@RequestParam("quizId") int quizId) {
		return quizService.getQuestionList(quizId);
	}

	// 更新問卷
	@PostMapping("quiz/update")
	public UpdateRes update(@RequestBody UpdateReq req) {
		return quizService.update(req);
	};

	// 刪除問卷（刪除多個）
	@PostMapping("quiz/delete")
	public BasicRes delete(@RequestBody DeleteReq req) {
		return quizService.delete(req);
	}

	// 刪除一個問卷
	/*
	 * api的路徑：http://localhost:8080/quiz/delete?quizId=1
	 * 
	 */
	/*
	 * @GetMapping("quiz/delete")
	 * public BasicRes delete(@RequestParam("quizId") int quizId) {
	 * return quizService.delete(quizId);
	 * }
	 */
	/*
	 * @GetMapping和 @PostMapping區別：
	 * 
	 * @GetMapping：
	 * 在 RESTful API 中，@GetMapping 指的是透過 URL 來傳遞資料。當你使用 @RequestParam("quizId")
	 * 時，這些資料會附加在網址的最後面（也就是 Query String）。
	 * 
	 * 例如，這個方法對應的實際網址會長這樣： GET http://localhost:8080/quiz/delete?quizId=123
	 * 
	 * URL: /quiz/delete
	 * 
	 * 參數: ?quizId=123 （這就是對應到你的 int quizId）
	 * ------------------其他的總結見：Java筆記----暫存在keep筆記本裡
	 */
	
	
	
	@PostMapping("quiz/fillin")
	public BasicRes fillin(@RequestBody FillinReq req) {
		return fillinService.fillin(req);
	}
	@PostMapping("get_all_fillin_users")
	public BasicRes getAllFillinUsers(@RequestParam("quizId") int quizId) {
		return fillinService.getAllFillinUsers(quizId);
	}
	
	@PostMapping("quiz/feedback")
	public BasicRes feedback(@RequestBody FeedbackReq req) {
		return fillinService.feedback(req);
	}
	

}
