package com.example.quiz_1141121.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "quiz")
public class Quiz {
	@Id
	@Column(name = "id")
	private int id;//除了這個前端界面不填寫其他都要，所以在DAO層插入一個問卷的時候不包含這個欄位
//除了這個前端界面不填寫其他都要，也就是插入的時候是需要這個欄位的
	
	@Column(name = "title")//前後端溝通通過API,透過controller，前端的請求是request
	private String title;

	@Column(name = "description")
	private String description;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")//@column如果沒有的話，會自動對應到數據庫裡的endDate，就是_x=X
	private LocalDate endDate;// 在數據庫裡是DateTime

	@Column(name = "is_published")
	private boolean published;
	// 對布林來說，get方法的名字會變成isX..動詞,所以在entity的名字要把is拿掉）

	public boolean isPublished() {
		return published;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

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

	public void setPublished(boolean published) {
		this.published = published;
	}

}
