package com.example.quiz_1141121;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration;

/**
* 因為有使用 spring-boot-starter-security 此依賴，要排除“預設"的基本安全性設定(帳密登入驗證,就是預設有個登錄賬密的頁面)，<br>
* 排除帳密登入驗證就是加上 exclude = {SecurityAutoConfiguration.class}， 等號後面若有多個 class<br>
* 時，就要用大括號，一個時大括號可有可無，多個 class 是用逗號(,)區隔<br>
* =====================================================================================<br>
* 以下是 spring boot 4.0.0 版本以下的排除方式:
* @SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
*/
@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class,//
		ServletWebSecurityAutoConfiguration.class })
public class Quiz1141121Application {

	public static void main(String[] args) {
		SpringApplication.run(Quiz1141121Application.class, args);
	}

}

