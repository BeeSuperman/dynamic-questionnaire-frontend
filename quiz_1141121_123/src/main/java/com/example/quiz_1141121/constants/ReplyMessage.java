package com.example.quiz_1141121.constants;

public enum ReplyMessage {

	SUCCESS(200, "Success!!"), //
	TITLE_ERROR(400, "Title Error!!"), //
	DESCRIPTION_ERROR(400, "Description Error!!"), //
	START_DATE_ERROR(400, "Start Date Error!!"), //
	END_DATE_ERROR(400, "End Date Error!!"), //
	QUESTION_ID_ERROR(400, "Question Id Error!!"), //
	QUESTION_ERROR(400, "Question Error!!"), //
	TYPE_ERROR(400, "Type Error!!"), //
	OPTIONS_ERROR(400, "Options Error!!"),
	QUIZ_ID_ERROR(400, " QUIZ_ID_ERRORR Error!!"),
	QUIZ_ID_MISMATCH(400, " QUIZ_ID_MISMATCH Error!!"),
	QUIZ_UPDATE_FORBIDDEN(400, " 	QUIZ_UPDATE_FORBIDDEN Error!!"),
	QUIZ_NOT_FOUND(404, " 	QUIZ_NOT_FOUND Error!!"),
	//可以用註解分類
	//user的
	USER_EMAIL_ERROR(404, " 	USER_EMAIL_ERROR!!"),
	USER_NAME_ERROR(400, " USER_NAME_ERROR Error!!"),
	USER_AGE_ERROR(400, " USER_AGE_ERROR!!"),
	USER_PASSWORD_ERROR(400, " USER_PASSWORD_ERROR!!"),
	USER_EMAIL_EXISTED(404, " USER_EMAIL_EXISTED!!"),
	USER_NOT_FOUND(404, " USER_NOT_FOUND!!"),
	ANSWER_REQUIRED(400,"ANSWER_REQUIRED");
	
	

	private int code;
	private String message;

	private ReplyMessage(int code, String message) {
		this.code = code;
		this.message = message;
	}

	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}
