package com.example.quiz_1141121.res;

import java.util.List;

public class GetFeedbackUserRes extends BasicRes{
	private List<FeedbackUserVo> userVoList;

	
	
	
	
	
	public GetFeedbackUserRes() {
		super();
		// TODO Auto-generated constructor stub
	}

	public GetFeedbackUserRes(int code, String message) {
		super(code, message);
		// TODO Auto-generated constructor stub
	}

	public GetFeedbackUserRes(int code, String message, List<FeedbackUserVo> userVo) {
		super(code, message);
		this.userVoList = userVo;
	}

	public GetFeedbackUserRes(List<FeedbackUserVo> userVo) {
		super();
		this.userVoList = userVo;
	}

	
	
	
	
	public List<FeedbackUserVo> getUserVoList() {
		return userVoList;
	}

	public void setUserVoList(List<FeedbackUserVo> userVoList) {
		this.userVoList = userVoList;
	}
	
}
