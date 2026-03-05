package com.example.quiz_1141121.res;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.List;

import com.example.quiz_1141121.vo.AnswerVo;

public class FeedbackUserVo {

	private String name;
	private String phone;
	private String email;
	private int age;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime fillinDate;
	private List<AnswerVo> answerVoList;

	public FeedbackUserVo() {
		super();
	}

	public FeedbackUserVo(String name, String phone, String email, int age, LocalDateTime fillinDate,
			List<AnswerVo> answerVoList) {
		super();
		this.name = name; 
		this.phone = phone;
		this.email = email;
		this.age = age;
		this.fillinDate = fillinDate;
		this.answerVoList = answerVoList;
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

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public int getAge() {
		return age;
	}

	public void setAge(int age) {
		this.age = age;
	}

	public LocalDateTime getFillinDate() {
		return fillinDate;
	}

	public void setFillinDate(LocalDateTime fillinDate) {
		this.fillinDate = fillinDate;
	}

	public List<AnswerVo> getAnswerVoList() {
		return answerVoList;
	}

	public void setAnswerVoList(List<AnswerVo> answerVoList) {
		this.answerVoList = answerVoList;
	}

}
