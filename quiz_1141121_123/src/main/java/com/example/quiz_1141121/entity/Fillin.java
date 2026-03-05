package com.example.quiz_1141121.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "fillin")
@IdClass(value = FillinId.class)
public class Fillin {
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

	public String getAnswer() {
		return answer;
	}

	public void setAnswer(String answer) {
		this.answer = answer;
	}

	public LocalDateTime getFillinDate() {
		return fillinDate;
	}

	public void setFillinDate(LocalDateTime fillinDate) {
		this.fillinDate = fillinDate;
	}

	@Id
	@Column(name = "quiz_id")
	private int quizId;
	@Id
	@Column(name = "question_id")
	private int questionId;
	@Id
	@Column(name = "user_email")
	private String userEmail;

	@Column(name = "answer")
	private String answer;

	@Column(name = "fillin_date")
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime fillinDate;

}
