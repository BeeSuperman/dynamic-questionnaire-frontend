package com.example.quiz_1141121.res;

import com.example.quiz_1141121.entity.User;

public class LoginRes extends BasicRes {

    private User user;

    public LoginRes(int code, String message, User user) {
        super(code, message);
        this.user = user;
    }

    public LoginRes(int code, String message) {
        super(code, message);
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

}
