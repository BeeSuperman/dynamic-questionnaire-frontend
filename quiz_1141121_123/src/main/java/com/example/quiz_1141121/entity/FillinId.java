package com.example.quiz_1141121.entity;

import java.io.Serializable;

//@SuppressWarnings
public class FillinId implements Serializable {
	private int quizId;
	private int questionId;
	private String userEmail;

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

	public String getUserEmail() {
		return userEmail;
	}

	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}
}
