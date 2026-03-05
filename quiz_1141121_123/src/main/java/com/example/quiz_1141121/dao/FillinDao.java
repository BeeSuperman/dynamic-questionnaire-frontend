package com.example.quiz_1141121.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.quiz_1141121.constants.ReplyMessage;
import com.example.quiz_1141121.entity.Fillin;
import com.example.quiz_1141121.entity.FillinId;
import com.example.quiz_1141121.res.BasicRes;

import jakarta.transaction.Transactional;

@Repository
public interface FillinDao extends JpaRepository<Fillin, FillinId> {
	@Modifying
	@Transactional
	@Query(value = "insert into fillin (quiz_id,question_id,user_email,answer,fillin_date)"
			+ " values(?1,?2,?3,?4,?5)", nativeQuery = true)
	public void insert(int quizId, int questionId, String email, String answer, LocalDateTime fillinDate);
	// 其中LocalDate now不需要填，會帶入預設值curdate()

	@Query(value = "select * from fillin where quiz_Id=?1", nativeQuery = true)
	public List<Fillin> getByQuizId(int quizId);

	// [新增] 檢查是否重複填寫 (根據 QuizId 和 UserEmail)
	public boolean existsByQuizIdAndUserEmail(int quizId, String userEmail);
    
	@Query(value = "select * from fillin where quiz_Id=?1 and email=?2", nativeQuery = true)
	public List<Fillin> getByQuizIdAndEmail(int quizId,String email);
}
