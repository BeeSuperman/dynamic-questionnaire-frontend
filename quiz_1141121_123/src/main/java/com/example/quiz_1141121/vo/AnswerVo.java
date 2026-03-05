package com.example.quiz_1141121.vo;

import com.example.quiz_1141121.entity.Question;

//一個AnswerVo表示一題問題的所有資訊以及答案

public class AnswerVo {
	private Question question;
	private int number;// 問題的編號
	private String answer;// 問題的答案也是就選的選項

	public Question getQuestion() {
		return question;
	}

	public void setQuestion(Question question) {
		this.question = question;
	}

	public int getNumber() {
		return number;
	}

	public void setNumber(int number) {
		this.number = number;
	}

	public String getAnswer() {
		return answer;
	}

	public void setAnswer(String answer) {
		this.answer = answer;
	}

	public AnswerVo(Question question, String answer) {
		super();
		this.question = question;
		this.answer = answer;
	}

	public AnswerVo(Question question) {
		super();
		this.question = question;
	}

	public AnswerVo() {
		super();
	}
}
