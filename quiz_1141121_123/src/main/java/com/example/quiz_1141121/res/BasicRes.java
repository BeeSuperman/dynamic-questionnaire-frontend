package com.example.quiz_1141121.res;

public class BasicRes {
	private int code;
	private String message;
public int getCode() {
		return code;
	}
	public void setCode(int code) {
		this.code = code;
	}
	public String getMessage() {
		return message;
	}
	public BasicRes(int code, String message) {
		super();
		this.code = code;
		this.message = message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	/*
 *一般res回復，都會有建構方法，因為要返回常常是return new Res
 */
	public BasicRes() {
		super();
		// TODO Auto-generated constructor stub
	}
}
