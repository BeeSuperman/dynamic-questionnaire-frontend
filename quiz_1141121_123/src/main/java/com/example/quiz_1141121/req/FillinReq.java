package com.example.quiz_1141121.req;

import java.util.List;

import com.example.quiz_1141121.entity.Fillin;
import com.example.quiz_1141121.vo.AnswerVo;

import jakarta.persistence.Column;
import jakarta.persistence.Id;

public class FillinReq extends Fillin{
	
private int quizId;


private String email;


private String name;


private String phone;


private String password;


private int age;

List<AnswerVo> answerVoList;



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
public String getPassword() {
	return password;
}
public void setPassword(String password) {
	this.password = password;
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
