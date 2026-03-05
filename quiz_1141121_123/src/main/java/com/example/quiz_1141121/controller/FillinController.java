package com.example.quiz_1141121.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.example.quiz_1141121.res.GetFeedbackUserRes;
import com.example.quiz_1141121.service.FillinService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class FillinController {
	@Autowired
	private FillinService fillinService;

	@GetMapping("quiz/feedback")
	public GetFeedbackUserRes getFeedback(@RequestParam(value = "quizId") int quizId) {
		return fillinService.getAllFillinUsers(quizId);
	}
}
