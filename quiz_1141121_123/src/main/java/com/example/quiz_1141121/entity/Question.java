package com.example.quiz_1141121.entity;

import com.example.quiz_1141121.constants.ValidationMsg;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "question")
@IdClass(value=QuestionId.class)
public class Question {
	////這幾個都要要檢查，因為DAO層“插入”的時候是需要這個欄位的。
	@Id
	@Column(name = "quiz_id")
	private int quizId;//一開始沒有，新增完問卷ID後才有了,所以沒有填完問卷，不管填什麼進資料庫都不會理我們，所以不用檢查
	//update的時候，要檢查問題的quizId和問卷的quizId是要一樣的
	
	@Min(value = 1, message = ValidationMsg.QUESTION_ID_ERROR)
	@Id
	@Column(name = "question_id")
	private int questionId;//要檢查，questionId不能是負數，因為都是從1及後面的數字

	@NotBlank(message = ValidationMsg.QUESTION_ERROR)
	@Column(name = "question")
	private String question;//要檢查

	@Column(name = "type")
	private String type;//要檢查

	@Column(name = "is_required")//就只有兩種結果的常常定義布林值
	private boolean required;//不需要檢查，原因是：
	/*
	 * 型態特性： boolean 是基本型態（primitive type），它的值只有 true 或 false。
	 * 不像 String 可能會有空字串或 null 的問題，boolean 永遠有一個明確的狀態。

業務邏輯： 在問卷系統中，「必填」或「不必填」都是合理的選項。
不存在「無效」的布林值，
因此不像 questionId 需要檢查是否為負數。
所以String，int都注意要檢查，但boolean兩種都是合理的，所以不需要檢查

	 */

	@Column(name = "options")
	private String options;//有條件的檢查，只有在特殊種類的問題才需要檢查。單選複選才需要檢查


	public int getQuizId() {
		return quizId;
	}

	public void setQuizId(int quizId) {
		this.quizId = quizId;
	}

	public int getQuestionId() {
		return questionId;
	}

	public void setQuestionId(int questionId) {
		this.questionId = questionId;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public boolean isRequired() {
		return required;
	}

	public void setRequired(boolean required) {
		this.required = required;
	}

	public String getOptions() {
		return options;
	}

	public void setOptions(String options) {
		this.options = options;
	}

	
}
