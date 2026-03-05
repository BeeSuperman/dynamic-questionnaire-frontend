package com.example.quiz_1141121.res;

import java.util.List;

import com.example.quiz_1141121.entity.Question;

public class GetQuestionRes extends BasicRes {
	public List<Question> questionList;

	public GetQuestionRes() {
		super();
	}

	
	
	public List<Question> getQuestionList() {
		return questionList;
	}

	public void setQuestionList(List<Question> questionList) {
		this.questionList = questionList;
	}

	public GetQuestionRes(int code, String message, List<Question> questionList) {
		super(code, message);
		this.questionList = questionList;
	}

	public GetQuestionRes(int code, String message) {
		super(code, message);
	}

}
