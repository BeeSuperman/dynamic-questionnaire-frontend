package com.example.quiz_1141121.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.quiz_1141121.req.LoginReq;
import com.example.quiz_1141121.req.RegisterReq;
import com.example.quiz_1141121.res.BasicRes;
import com.example.quiz_1141121.res.LoginRes;
import com.example.quiz_1141121.service.UserService;

import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("user/register")
    public BasicRes register(@RequestBody RegisterReq req) {
        return userService.register(req);
    }

    @PostMapping("user/login")
    public LoginRes login(@RequestBody LoginReq req) {
        return userService.login(req);
    }

    // [新增] 檢查 Email 是否為註冊會員
    @PostMapping("user/check_registered")
    public BasicRes checkRegistered(@RequestBody LoginReq req) {
        boolean isRegistered = userService.checkRegistered(req.getEmail());
        return new BasicRes(isRegistered ? 200 : 404, isRegistered ? "Registered" : "Guest");
    }

    // [新增] 更新會員資料（含密碼）
    @PostMapping("user/update")
    public BasicRes updateProfile(@RequestBody RegisterReq req) {
        return userService.updateProfile(req);
    }
}
