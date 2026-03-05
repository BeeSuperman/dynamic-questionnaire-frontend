package com.example.quiz_1141121.res;

import com.example.quiz_1141121.entity.Question;

public class CreateRes extends BasicRes {
	private int questionId;//加這個是為了檢查哪一個問題出現問題
//	private int code;
//	private String message;

	

	
	public CreateRes() {
		super();
		// TODO Auto-generated constructor stub
	}
//	public CreateRes( int code, String message,int questionId) {
//		super();
//		this.questionId = questionId;
//		this.code = code;
//		this.message = message;
//	}
//
//	public CreateRes(int code, String message) {
//		super();
//		this.code = code;
//		this.message = message;
//	}
//	public int getQuestionId() {
//		return questionId;
//	}
//
//	public void setQuestionId(int questionId) {
//		this.questionId = questionId;
//	}
//
//	public int getCode() {
//		return code;
//	}
//
//	public void setCode(int code) {
//		this.code = code;
//	}
//
//	public String getMessage() {
//		return message;
//	}
//
//
//
//
//	public void setMessage(String message) {
//		this.message = message;
//	}




	public CreateRes(int code, String message, int questionId) {
		super(code, message);
		this.questionId = questionId;
	}




	public CreateRes(int code, String message) {
		super(code, message);
		// TODO Auto-generated constructor stub
	}




	public int getQuestionId() {
		return questionId;
	}




	public void setQuestionId(int questionId) {
		this.questionId = questionId;
	}
	
}
