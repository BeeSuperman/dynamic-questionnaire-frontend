package com.example.myBatis_1140818.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.myBatis_1140818.dto.PersonInfo;

@Mapper // 標註此介面為 MyBatis 用
public interface PersonInfoDao {

	/*	方法中參數的傳遞有以下幾種常用的方式: */
	/* 1. 使用 @Param 將帶入的值映射到參數中 */
	public void addInfo(//
			@Param("inputId") String id, //
			@Param("inputName") String userName, //
			@Param("inputAge") int age, //
			@Param("inputCity") String city);

	/* 2. 使用 dto(class) <br> 
	 * 註: 回傳資料型態設定為 int，可以用來判斷是否有 insert 成功<br>
	 * 因為是新增單筆資料，所以回傳 1 表示新增成功；反之新增失敗 */
	public int addInfo2(PersonInfo personInfo);
	
	/* 3. 使用 map <br>
	 * 3.1 因為 select 的條件不是PK，所以可能會有多筆資料 <br>
	 * 3.2 放到 map 中的 key 的字串必須要和 xml 檔語法中的變數名稱一致 <br>
	 * 3.3 例如: Map<String, Object> paramMap = new HashMap<>(); <br>
	 * paramMap.put("paramCity", "Taipei"); <-- 字串 paramCity 要和 xml 語法中的取值變數名稱一致 */
	public List<PersonInfo> selectByCity(Map<String, Object> paramMap);

	/* 4. 使用參數順序位置 */ 
	public List<PersonInfo> selectByCityAndAgeGreaterThan(String city, int age);

	/* 變數值是 List/Set 或陣列 */
	public List<PersonInfo> selectByIdList(@Param("idList") List<String> idList);

	/* update */
	public void updateCityById(//
			@Param("inputId") String id, //
			@Param("inputCity") String city);

	/* delete */
	public void deleteById(@Param("inputId") String id);
}
