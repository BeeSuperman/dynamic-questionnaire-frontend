package com.example.quiz_1141121.res;

import java.util.List;

import com.example.quiz_1141121.entity.Quiz;
//lombok插件作用：@Getter，@Setter加在class上面就可以自動幫你加上get,set方法，只是隱藏了只需要這兩個註解
public class GetQuizRes extends BasicRes {
//	private int code;
/*private String message;----這都是CreateRes的屬性
 * 所以在一個類裡面還想有另一個類的屬性，所以用繼承！
 */
	
	
	
	private List<Quiz> quizList;
	
	
	
	//右鍵構建方法from superclass，是自動會生成這兩個構建方法的,因為父類有int code, String message兩個屬性
	//1.
	public GetQuizRes() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	
//2.
	public GetQuizRes(int code, String message) {
		super(code, message);
		// TODO Auto-generated constructor stub
	}
	
	public GetQuizRes(int code, String message, List<Quiz> quizList) {
		super(code, message);
		this.quizList = quizList;
	}
	
	
	
	public List<Quiz> getQuizList() {
		return quizList;
	}
	public void setQuizList(List<Quiz> quizList) {
		this.quizList = quizList;
	}
	
	

}
