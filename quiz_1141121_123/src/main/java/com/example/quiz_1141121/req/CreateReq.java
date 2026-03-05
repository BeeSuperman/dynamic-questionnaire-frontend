package com.example.quiz_1141121.req;

import java.time.LocalDate;
import java.util.List;

import com.example.quiz_1141121.constants.ValidationMsg;
import com.example.quiz_1141121.entity.Question;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class CreateReq {
	
	
	/* @NotBlank:限制屬性值不能是 1. 空字串 2. 全空白字串 3. null
	 * message 是指當屬性值違反限制時得到的訊息，等號後面的值必須是常數(final) */
	@NotBlank(message = ValidationMsg.TITLE_ERROR)
	private String title;

	@NotBlank(message = ValidationMsg.DESCRIPTION_ERROR)
	private String description;
	
	@NotNull(message = ValidationMsg.START_DATE_ERROR)
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate startDate;

	@NotNull(message = ValidationMsg.END_DATE_ERROR)
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate endDate;// 在數據庫裡是DateTime

	
	private boolean published;
	
	/* 嵌套驗證: 針對自定義的物件(class)中的屬性
	 * @Valid: 為了讓嵌套驗證中的屬性限制生效，就是 Question 中的屬性限制*/
	@Valid
	@NotEmpty(message = ValidationMsg.QUESTION_LIST_IS_EMPTY)
	private List<Question> questionList;//問卷和問題的關係是一對多，一所以這樣寫是錯的，要用list
	
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public boolean isPublished() {
		return published;
	}

	public void setPublished(boolean published) {
		this.published = published;
	}

	public List<Question> getQuestionList() {
		return questionList;
	}

	public void setQuestionList(List<Question> questionList) {
		this.questionList = questionList;
	}
}
