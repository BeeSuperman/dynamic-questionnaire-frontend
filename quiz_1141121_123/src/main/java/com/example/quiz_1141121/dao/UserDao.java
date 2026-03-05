package com.example.quiz_1141121.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.quiz_1141121.entity.User;

import jakarta.transaction.Transactional;

@Repository
public interface UserDao extends JpaRepository<User, String> {

	// 新增user
	@Modifying
	@Transactional
	@Query(value = "insert into user (email,name,password,phone,age) "//
			+ "values (?1,?2,?3,?4,?5)", nativeQuery = true)
	public void insert(String email, String name, String password, String phone, int age);

	// 取得特定email的次數，檢查email是否已經存在---檢查email是否已被註冊過
	@Query(value = "SELECT COUNT(email) from  user where email=?1 ", nativeQuery = true)
	public int getEmailCount(String email);

	@Query(value = "SELECT *  from  user where email=?1 ", nativeQuery = true)
	public User getByEmail(String email);

	// 更新使用者資料 (當舊用戶回來填寫問卷時，我們更新他的最新資訊)
	@Modifying
	@Transactional
	@Query(value = "update user set name=?1, phone=?2, age=?3 where email=?4", nativeQuery = true)
	public void update(String name, String phone, int age, String email);

	// [新增] 更新使用者資料（含密碼）— 用於會員中心修改密碼
	@Modifying
	@Transactional
	@Query(value = "update user set name=?1, phone=?2, password=?3 where email=?4", nativeQuery = true)
	public void updateWithPassword(String name, String phone, String password, String email);

}
