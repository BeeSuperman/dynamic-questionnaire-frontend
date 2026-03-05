package com.example.quiz_1141121.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;
import com.example.quiz_1141121.constants.ReplyMessage;
import com.example.quiz_1141121.constants.Type;
import com.example.quiz_1141121.dao.FillinDao;
import com.example.quiz_1141121.dao.QuestionDao;
import com.example.quiz_1141121.dao.UserDao;
import com.example.quiz_1141121.entity.Fillin;
import com.example.quiz_1141121.entity.Question;
import com.example.quiz_1141121.entity.User;
import com.example.quiz_1141121.req.FeedbackReq;
import com.example.quiz_1141121.req.FillinReq;
import com.example.quiz_1141121.res.BasicRes;
import com.example.quiz_1141121.res.FeedbackRes;
import com.example.quiz_1141121.res.FeedbackUserVo;
import com.example.quiz_1141121.res.GetFeedbackUserRes;
import com.example.quiz_1141121.vo.AnswerVo;

@Service
public class FillinService {
	@Autowired
	private FillinDao fillinDao;

	@Autowired
	private UserDao userDao;
	@Autowired
	private QuestionDao questionDao;

	@Transactional(rollbackFor = Exception.class) // 也可以加在類別上，每個方法都有回溯這個效果
	public BasicRes fillin(FillinReq req) {

		try {
			BasicRes res = checkParams(req);
			if (res != null) {
				return res;
			}

			// [新增] 重複填寫檢查 (防止 PK 衝突導致 500 錯誤)
			if (fillinDao.existsByQuizIdAndUserEmail(req.getQuizId(), req.getEmail())) {
				return new BasicRes(400, "您已填寫過此問卷，請勿重複提交！");
			}

			// ▼▼▼▼▼ [新增邏輯開始] ▼▼▼▼▼

			// 步驟 1: 檢查這個 Email 是否已經存在 User 表中
			// getEmailCount 會回傳 0 (不存在) 或 1 (存在)
			int count = userDao.getEmailCount(req.getEmail());

			if (count == 0) {
				// 分支 A: 如果是新訪客 (count == 0)
				// 幫他在 User 表新增一筆資料 (注意：密碼設為 null，因為他不是註冊會員)
				userDao.insert(req.getEmail(), req.getName(), null, req.getPhone(), req.getAge());
			} else {
				// 分支 B: 如果 Email 已存在
				// 1. 先把這個使用者查出來
				User currentUser = userDao.getByEmail(req.getEmail());

				// 2. 檢查他是否有密碼（判斷是否為註冊會員）
				boolean isRegisteredUser = StringUtils.hasText(currentUser.getPassword());

				// 3. 只有當他「不是」註冊會員（即 password 為空）時，才允許更新資料
				if (!isRegisteredUser) {
					userDao.update(req.getName(), req.getPhone(), req.getAge(), req.getEmail());
				}
				// 如果是註冊會員 (else)，就什麼都不做，保留他原本的會員資料 (Safe!)
			}

			// ▲▲▲▲▲ [新增邏輯結束] ▲▲▲▲▲

			// 新增資料：
			// [修正] 獲取當前時間並傳入 DAO
			LocalDateTime now = LocalDateTime.now();
			for (AnswerVo vo : req.getAnswerVoList()) {
				fillinDao.insert(req.getQuizId(), vo.getQuestion().getQuestionId(), req.getEmail(), vo.getAnswer(),
						now);
			}

		} catch (Exception e) {
			e.printStackTrace(); // 保持控制台輸出
			return new BasicRes(500, "Error: " + e.getMessage()); // 回傳詳細錯誤
		}

		return new BasicRes(200, "Success!!");
	}

	private BasicRes checkParams(FillinReq req) {
		if (req.getQuizId() <= 0) {
			return new BasicRes(ReplyMessage.QUIZ_ID_ERROR.getCode(), //
					ReplyMessage.QUIZ_ID_ERROR.getMessage());
		}
		if (!StringUtils.hasText(req.getName())) {
			return new BasicRes(ReplyMessage.USER_NAME_ERROR.getCode(), //
					ReplyMessage.USER_NAME_ERROR.getMessage());
		}
		if (req.getAge() <= 18) {
			return new BasicRes(ReplyMessage.USER_AGE_ERROR.getCode(), //
					ReplyMessage.USER_AGE_ERROR.getMessage());
		}
		if (!StringUtils.hasText(req.getEmail())) {
			return new BasicRes(ReplyMessage.USER_EMAIL_ERROR.getCode(), //
					ReplyMessage.USER_EMAIL_ERROR.getMessage());
		}
		// 要檢查每一個 答案
		for (AnswerVo vo : req.getAnswerVoList()) {
			// 檢查必填但沒有答案（沒有選項或者沒有答案）
			if (vo.getQuestion().isRequired()) {
				if (vo.getNumber() <= 0 || !StringUtils.hasText(vo.getAnswer())) {
					return new BasicRes(ReplyMessage.ANSWER_REQUIRED.getCode(), //
							ReplyMessage.ANSWER_REQUIRED.getMessage());
				}
			}
			// 檢查選項與答案是否匹配,看看是不是對應的quesion中的選項和我選的選擇是不是要一致的(前提是答案要有值）
			// --》是選擇題且有答案的情況下，檢查是否與question中的選項匹配
			if (Type.isChoiceType(vo.getQuestion().getType())) {
				if (StringUtils.hasText(vo.getAnswer())) {
					if (StringUtils.hasText(vo.getAnswer())) {

					}

				}

			}

		}
		return null;

	}

	public GetFeedbackUserRes getAllFillinUsers(int quizId) {
		if (quizId <= 0) {
			return new GetFeedbackUserRes(ReplyMessage.QUIZ_ID_ERROR.getCode(), //
					ReplyMessage.QUIZ_ID_ERROR.getMessage());
		}
		List<Fillin> list = fillinDao.getByQuizId(quizId);
		List<AnswerVo> answerVoList = new ArrayList<>();
		Map<String, FeedbackUserVo> map = new HashMap<>();
		List<FeedbackUserVo> userVoList = new ArrayList<>();
		Map<String, List<AnswerVo>> answerVomap = new HashMap<>();
		for (Fillin fillin : list) {
			if (!map.containsKey(fillin.getUserEmail())) {
				/*
				 * 使用 map 可以防止同一位使用者有多題的作答時，會產生多個 FeedbackUserVo，
				 * 因為是同一位使用者對同一張問卷作答多題
				 */
				/* 新的使用者必須要重置 List<AnswerVo> answerVoList */
				User user = userDao.getByEmail(fillin.getUserEmail());
				answerVoList = new ArrayList<>();
				FeedbackUserVo userVo = new FeedbackUserVo(user.getName(), user.getPhone(), //
						user.getEmail(), user.getAge(), fillin.getFillinDate(), answerVoList); // Assuming
																								// fillin.getFillinDate()
																								// is already
																								// LocalDateTime or
																								// compatible
				userVoList.add(userVo);
				map.put(fillin.getUserEmail(), userVo);
				answerVomap.put(fillin.getUserEmail(), answerVoList);
			}
			List<Question> questionList = questionDao.getByQuizId(quizId);
			for (Question question : questionList) {
				/* 比對 question_id: 一樣的就把答案放到 AnswerVo */
				if (fillin.getQuestionId() == question.getQuestionId()) {
					AnswerVo answerVo = new AnswerVo(question, fillin.getAnswer());
					/* 取出特定使用者舊的 answerVoList */
					answerVoList = answerVomap.get(fillin.getUserEmail());
					/* 增加新的 answerVo */
					answerVoList.add(answerVo);
					/* 把新的 answerVoList 放回到 answerVomap 中 */
					answerVomap.put(fillin.getUserEmail(), answerVoList);
				}
			}
		}
		return new GetFeedbackUserRes(ReplyMessage.SUCCESS.getCode(), //
				ReplyMessage.SUCCESS.getMessage(), userVoList);
	}
	public FeedbackRes feedback(FeedbackReq req) {
		/* 參數檢查 */
		/* 透過 quizId 取得所有問題 */
		/* questionsList縮寫等於= quList*/
		List<Question>  quList = questionDao.getByQuizId(req.getQuizId());
		List<Fillin> fillinList = fillinDao.getByQuizIdAndEmail(req.getQuizId(), req.getEmail());
		User user = userDao.getByEmail(req.getEmail());
		if (user == null) {
			return new FeedbackRes(ReplyMessage.USER_NOT_FOUND.getCode(), //
					ReplyMessage.USER_NOT_FOUND.getMessage());
		}
		List<AnswerVo> answerVoList = new ArrayList<>();
		FeedbackRes res = new FeedbackRes(ReplyMessage.SUCCESS.getCode(), //
				ReplyMessage.SUCCESS.getMessage(), //
				req.getQuizId(), req.getEmail(), user.getName(), //
				user.getPhone(), user.getAge(), answerVoList);
		
		/* 把答案匹配到對應的問題上面 */
	
		for (Question qu : quList) {
			AnswerVo vo = new AnswerVo(qu);// vo 中一定會包含 question，但不一定會有使用者的答案(因為若不是必選他可能部會作答而空白)
			for (Fillin fillin : fillinList) {
				if(qu.getQuestionId() == fillin.getQuestionId()) {
					/*若兩個QuestionIdID, 把Ans 放到 vo 中*/
					vo.setAnswer(fillin.getAnswer());
					answerVoList.add(vo);
					/* 有匹配到相同題號, 就可以跳過剩下 fillin (題目)的比對*/
					break;
				}
			}
		}
		return res;
	}
}
