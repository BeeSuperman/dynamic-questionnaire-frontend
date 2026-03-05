package com.example.quiz_1141121.dao;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.quiz_1141121.entity.Quiz;

import jakarta.transaction.Transactional;


@Repository
public interface QuizDao extends JpaRepository<Quiz, Integer> {
	// 1. 執行新增問卷的動作
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO quiz (title, description, start_date, end_date, is_published) "//
    
                 + "VALUES (?1, ?2, ?3, ?4, ?5)", nativeQuery = true)
    public int insertQuiz(String title, String description, LocalDate startDate, LocalDate endDate, boolean published);

    // 2. 取得剛才新增成功的 ID
    // 這是最常見的寫法，向資料庫請求當前連線最後產生的 ID//因為問卷的id是ai,所以填完問卷產生id，是當前的id最大值
    @Query(value = "SELECT MAX(id) from quiz ", nativeQuery = true)
    public int getMaxId();
    
    
    
    @Query(value = "SELECT * from quiz ", nativeQuery = true)
    public List<Quiz> getAll();
    
    @Query(value = "SELECT * from quiz where id=?1", nativeQuery = true)
    public Quiz getById(int id);
    
    
  //更新
  	@Modifying
  	@Transactional
  	@Query(value = "UPDATE quiz set "//
  	+" title=?2,description=?3,start_date=?4,end_date=?5,is_published=?6 where id=?1",nativeQuery = true)
  	
  	public int update(int id,  String title, String description,  LocalDate startDate,
  			LocalDate endDate,boolean published	);	
  	
  	//刪除
  	/*
  	 * idList =[1,2,3]
  	 * SQL語法：delete from quiz where id in (1,2,3) 
  	 */
  	@Modifying
  	@Transactional
  	@Query(value = "delete from quiz where id in (?1) ",nativeQuery = true)
//  	between連續區間，代表多個操作，in：多個操作
  	public void delete(	List<Integer> idList);
  			
  	@Modifying
  	@Transactional
  	@Query(value = "delete from quiz where id =?1",nativeQuery = true)
//  	between連續區間，代表多個操作，in：多個操作
  	public void delete(	int id);
  			
}
