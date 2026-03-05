package com.example.quiz_1141121.entity;

import java.io.Serializable;

@SuppressWarnings("serial")
public class QuestionId implements Serializable {
	private int quizId;
	private int questionId;

	public int getQuizid() {
		return quizId;
	}

	public void setQuizid(int quizid) {
		this.quizId = quizId;
	}

	public int getQuestionid() {
		return questionId;
	}

	public void setQuestionid(int questionid) {
		this.questionId = questionId;
	}
}
