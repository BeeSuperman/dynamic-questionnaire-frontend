package com.example.quiz_1141121.res;

import java.time.LocalDate;
import java.util.List;

import com.example.quiz_1141121.entity.Question;

public class GetSingleQuizRes extends BasicRes {

    private int id;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean published;
    private List<Question> questionList;

    public GetSingleQuizRes() {
        super();
    }

    public GetSingleQuizRes(int code, String message) {
        super(code, message);
    }

    public GetSingleQuizRes(int code, String message, int id, String title, String description, LocalDate startDate,
            LocalDate endDate, boolean published, List<Question> questionList) {
        super(code, message);
        this.id = id;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.published = published;
        this.questionList = questionList;
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
