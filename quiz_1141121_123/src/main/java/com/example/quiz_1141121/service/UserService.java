package com.example.quiz_1141121.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.example.quiz_1141121.constants.ReplyMessage;
import com.example.quiz_1141121.dao.UserDao;
import com.example.quiz_1141121.entity.User;
import com.example.quiz_1141121.req.LoginReq;
import com.example.quiz_1141121.req.RegisterReq;
import com.example.quiz_1141121.res.BasicRes;
import com.example.quiz_1141121.res.LoginRes;
import com.example.quiz_1141121.res.UpdateRes;

import jakarta.transaction.Transactional;

@Service
public class UserService {
	// 將密碼加密,用這個：BCryptPasswordEncoder
	private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
	@Autowired
	private UserDao userDao;

	// 新增使用者
	public BasicRes register(RegisterReq req) {
		// 參數檢查
		BasicRes res = checkParams(req);
		if (res != null) {
			return res;
		}
		/*
		 * 檢查email是否已經存在在DB
		 */
		int count = userDao.getEmailCount(req.getEmail());
		if (count == 1) {
			return new BasicRes(ReplyMessage.USER_EMAIL_EXISTED.getCode(), //
					ReplyMessage.USER_EMAIL_EXISTED.getMessage());
		}
		try {
			// 注意不可以直接把密碼放入數據庫，要加密，碰到密碼就要條件反射！遍歷每一個關鍵字
			userDao.insert(req.getEmail(), req.getName(), encoder.encode(req.getPassword()), req.getPhone(),
					req.getAge());

		} catch (Exception e) {
			throw e;
		}

		return new BasicRes(ReplyMessage.SUCCESS.getCode(), //
				ReplyMessage.SUCCESS.getMessage());

	}

	// 登入
	public LoginRes login(LoginReq req) {
		// 1. 參數檢查
		if (!StringUtils.hasText(req.getEmail())) {
			return new LoginRes(ReplyMessage.USER_EMAIL_ERROR.getCode(), //
					ReplyMessage.USER_EMAIL_ERROR.getMessage());
		}
		if (!StringUtils.hasText(req.getPassword())) {
			return new LoginRes(ReplyMessage.USER_PASSWORD_ERROR.getCode(), //
					ReplyMessage.USER_PASSWORD_ERROR.getMessage());
		}

		// 2. 檢查帳號是否存在
		User user = userDao.getByEmail(req.getEmail());
		if (user == null) {
			return new LoginRes(ReplyMessage.USER_NOT_FOUND.getCode(), //
					ReplyMessage.USER_NOT_FOUND.getMessage());
		}

		// 3. 檢查密碼是否正確 (比對加密後的密碼)
		if (!encoder.matches(req.getPassword(), user.getPassword())) {
			return new LoginRes(ReplyMessage.USER_PASSWORD_ERROR.getCode(), //
					ReplyMessage.USER_PASSWORD_ERROR.getMessage());
		}

		// 4. 清除密碼 (避免回傳到前端)，回傳成功
		user.setPassword(null);
		return new LoginRes(ReplyMessage.SUCCESS.getCode(), //
				ReplyMessage.SUCCESS.getMessage(), user);
	}

	private BasicRes checkParams(RegisterReq req) {
		if (!StringUtils.hasText(req.getEmail())) {
			return new BasicRes(ReplyMessage.USER_EMAIL_ERROR.getCode(), //
					ReplyMessage.USER_EMAIL_ERROR.getMessage());
		}
		if (!StringUtils.hasText(req.getPassword())) {
			return new BasicRes(ReplyMessage.USER_PASSWORD_ERROR.getCode(), //
					ReplyMessage.USER_PASSWORD_ERROR.getMessage());
		}
		if (!StringUtils.hasText(req.getName())) {
			return new BasicRes(ReplyMessage.USER_NAME_ERROR.getCode(), //
					ReplyMessage.USER_NAME_ERROR.getMessage());
		}

		return null;

	}

	// [新增] 檢查是否為註冊會員 (有密碼的才算)
	public boolean checkRegistered(String email) {
		User user = userDao.getByEmail(email);
		// 如果 user 存在且 password 不為 null/空，就是註冊會員
		return user != null && StringUtils.hasText(user.getPassword());
	}

	// [新增] 更新會員資料（含密碼加密）
	@Transactional
	public BasicRes updateProfile(RegisterReq req) {
		// 1. 參數檢查
		if (!StringUtils.hasText(req.getEmail())) {
			return new BasicRes(ReplyMessage.USER_EMAIL_ERROR.getCode(),
					ReplyMessage.USER_EMAIL_ERROR.getMessage());
		}
		if (!StringUtils.hasText(req.getName())) {
			return new BasicRes(ReplyMessage.USER_NAME_ERROR.getCode(),
					ReplyMessage.USER_NAME_ERROR.getMessage());
		}

		// 2. 檢查使用者是否存在
		User user = userDao.getByEmail(req.getEmail());
		if (user == null) {
			return new BasicRes(ReplyMessage.USER_NOT_FOUND.getCode(),
					ReplyMessage.USER_NOT_FOUND.getMessage());
		}

		// 3. 更新資料（密碼需要加密）
		try {
			if (StringUtils.hasText(req.getPassword())) {
				// 有填新密碼 → 加密後一起更新
				userDao.updateWithPassword(req.getName(), req.getPhone(),
						encoder.encode(req.getPassword()), req.getEmail());
			} else {
				// 沒填新密碼 → 只更新姓名和手機
				userDao.update(req.getName(), req.getPhone(), req.getAge(), req.getEmail());
			}
		} catch (Exception e) {
			throw e;
		}

		return new BasicRes(ReplyMessage.SUCCESS.getCode(),
				ReplyMessage.SUCCESS.getMessage());
	}
}
