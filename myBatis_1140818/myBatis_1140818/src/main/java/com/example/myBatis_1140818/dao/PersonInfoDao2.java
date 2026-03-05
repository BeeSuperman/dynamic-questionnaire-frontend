package com.example.myBatis_1140818.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.myBatis_1140818.dto.PersonInfo;

@Mapper // 標註此介面為 MyBatis 用
public interface PersonInfoDao2 {

	public List<PersonInfo> selectByCityAndAgeGreaterThan(String city, int age);

	public List<PersonInfo> selectByCityLike(@Param("inputKey") String keyword);

	public List<PersonInfo> selectByUserNameAndCitysIn(String userName, List<String> keywordList);
}
