package com.example.quiz_1141121.req;

import java.util.List;

public class DeleteReq {
private List<Integer> quizIdList;



public List<Integer> getQuizIdList() {
	return quizIdList;
}

public DeleteReq(List<Integer> quizIdList) {
	super();
	this.quizIdList = quizIdList;
}

public DeleteReq() {
	super();
	// TODO Auto-generated constructor stub
}

public void setQuizIdList(List<Integer> quizIdList) {
	this.quizIdList = quizIdList;
}

}
