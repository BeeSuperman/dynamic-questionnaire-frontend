package com.example.quiz_1141121.dao;

import java.beans.Transient;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.quiz_1141121.entity.Question;
import com.example.quiz_1141121.entity.QuestionId;

import jakarta.transaction.Transactional;

@Repository
public interface QuestionDao extends JpaRepository<Question, QuestionId> {
	@Modifying
	@Transactional
	@Query(value = "INSERT INTO question (quiz_id, question_id, question, type, is_required, options) "
			+ "VALUES (?1, ?2, ?3, ?4, ?5, ?6)", nativeQuery = true)
	public int insertQuestion(int quizId, int questionId, String question, String type, boolean isRequired,
			String options);

	@Query(value = "select * from question where quiz_id=?1 ", nativeQuery = true)
	public List<Question> getByQuizId(int quizId);

	// 還有一種方法是：效果和
	/*
	 * public List<Question> findByQuizId(int quizId);
	 * 
	 * @Query(value = "select * from question where quiz_id=?1 "
	 * + "VALUES (?1)", nativeQuery = true)
	 * public List<Question> getByQuizId(int quizId);一樣的，不用寫sql，但是為了熟練度還是推薦上面那個
	 */

	// 刪除一個問題
	@Modifying
	@Transactional
	@Query(value = "delete from question where quiz_id=?1", nativeQuery = true)
	public void delete(int quizid);

	// 刪除多個問題
	@Modifying
	@Transactional
	@Query(value = "delete from question where quiz_id in (?1) ", nativeQuery = true)
	// between連續區間，代表多個操作，in：多個操作
	public void delete(List<Integer> idList);

	@Modifying
	@Transactional
	@Query(value = "update question set question=?2, type=?3, is_required=?4, options=?5 "
			+ "where quiz_id=?1 and question_id=?6", nativeQuery = true)
	public void update(int quizId, String question, String type, boolean isRequired, String options, int questionId);

	@Modifying
	@Transactional
	@Query(value = "delete from question where quiz_id=?1 and question_id in (?2)", nativeQuery = true)
	public void deleteByIds(int quizId, List<Integer> questionIds);

}
