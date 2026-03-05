package com.example.quiz_1141121.res;
//單純改名字，是為了配合service層Update方法返回的類型創建的class而已,不然那返回類型是CreateRes很奇怪，不符合見名知意。也可以直接用
//CreateRes，但有人會介意
public class UpdateRes extends CreateRes{

	public UpdateRes() {
		super();
		// TODO Auto-generated constructor stub
	}

	public UpdateRes(int code, String message, int questionId) {
		super(code, message, questionId);
		// TODO Auto-generated constructor stub
	}

	public UpdateRes(int code, String message) {
		super(code, message);
		// TODO Auto-generated constructor stub
	}

}
