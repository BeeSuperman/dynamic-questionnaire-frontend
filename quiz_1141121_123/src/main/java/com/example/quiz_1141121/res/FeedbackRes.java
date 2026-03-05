package com.example.quiz_1141121.res;

import java.util.List;

import com.example.quiz_1141121.vo.AnswerVo;

public class FeedbackRes extends BasicRes{

	private int quizId;
	

	private String email;


	private String name;


	private String phone;
	

	private int age;
	
	private List<AnswerVo> answerVoList;

	public FeedbackRes() {
		super();
	}
	

	public FeedbackRes(int quizId, String email, String name, String phone, int age) {
		super();
		this.quizId = quizId;
		this.email = email;
		this.name = name;
		this.phone = phone;
		this.age = age;
	}


	public FeedbackRes(int code, String message) {
		super(code, message);
	}

	public FeedbackRes(int code, String message, int quizId, String email, String name, String phone, int age,
			List<AnswerVo> answerVoList) {
		super(code, message);
		this.quizId = quizId;
		this.email = email;
		this.name = name;
		this.phone = phone;
		this.age = age;
		this.answerVoList = answerVoList;
	}

	public int getQuizId() {
		return quizId;
	}

	public void setQuizId(int quizId) {
		this.quizId = quizId;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public int getAge() {
		return age;
	}

	public void setAge(int age) {
		this.age = age;
	}

	public List<AnswerVo> getAnswerVoList() {
		return answerVoList;
	}

	public void setAnswerVoList(List<AnswerVo> answerVoList) {
		this.answerVoList = answerVoList;
	}

	
}