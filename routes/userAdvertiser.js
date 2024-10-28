const express = require('express');
<<<<<<< HEAD
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// 데이터베이스 연결 파일
const connection  = require('../database/connect/mysql');

=======
const router = express.Router();

// 데이터 베이스 연결파일
const connection  = require('../database/connect/mysql');


>>>>>>> origin/gpyo0111
// 회원가입
router.post("/api/users/signup", async (req, res) => {
  const { ad_id, email, password, company_id, company_name, phone, profile_picture } = req.body;

  console.log('Received signup request:', req.body); // 요청 로그 출력
<<<<<<< HEAD

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashedPassword);  // 해싱된 비밀번호 출력

=======
>>>>>>> origin/gpyo0111
  // DB에 데이터 저장
  connection.query('SELECT * FROM user_advertiser WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('DB 조회 오류:', err);
    }

    if (results.length > 0) {
      // 이미 회원가입된 사용자
      console.log('이미 회원가입된 사용자:', email);
      return res.status(409).json({ message: 'Email already registered' });
    } else {
      // 새 사용자 등록
      connection.query(
        'INSERT INTO mydb.user_advertiser (ad_id, email, password, company_id, company_name, phone, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?)',
<<<<<<< HEAD
        [ad_id, email, hashedPassword, company_id, company_name, phone, profile_picture],
=======
        [ad_id, email, password, company_id, company_name, phone, profile_picture],
>>>>>>> origin/gpyo0111
        (err, result) => {
          if (err) {
            console.error('회원가입 실패:', err);
            return res.status(500).json({ message: 'Signup failed' });
          }
          console.log('회원가입 성공:', email);
          return res.status(201).json({ message: 'Signup successful' });
        }
      );
    }
  });
<<<<<<< HEAD
=======
  
>>>>>>> origin/gpyo0111
});

// 로그인
router.post('/api/users/login', async (req, res) => {
<<<<<<< HEAD
  const { ad_id, password } = req.body;
  console.log('Received login request:', { ad_id, password });

  try {
    // 데이터베이스에서 사용자 조회
    const [results] = await connection.promise().query('SELECT * FROM mydb.user_advertiser WHERE ad_id = ?', [ad_id]);

    if (results.length > 0) {
      const user = results[0];

      const validPassword = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', validPassword);  // 비교 결과 출력

      if (validPassword) {
        // 세션에 사용자 정보 저장
        req.session.user = { ad_id: user.ad_id };
        console.log('로그인 성공:', ad_id);

        // 로그인 성공 시 `ad_id`를 응답에 포함
        return res.status(200).json({ message: 'Login success!', ad_id: user.ad_id });
      } else {
        console.log('비밀번호 불일치:', ad_id);
        return res.status(401).json({ message: 'Incorrect password' });
      }
    } else {
      console.log('회원 정보가 없습니다:', ad_id); 
=======
  const {email,password} = req.body;
  console.log('Received login request:', { email, password });
  try {
    // 데이터베이스에서 사용자 조회 (Promise 방식)
    const [results] = await connection.promise().query('SELECT * FROM mydb.user_advertiser WHERE email = ?', [email]);

    if (results.length > 0) {
      const user = results[0]; // 조회된 사용자 정보

      // 입력된 비밀번호와 DB의 비밀번호 비교
      if (user.password === password) {
        // 로그인 성공
        console.log('로그인 성공:', email);
        return res.status(200).json({ message: 'Login success!' });
      } else {
        // 비밀번호가 일치하지 않는 경우
        console.log('비밀번호 불일치:', email);
        return res.status(401).json({ message: 'Incorrect password' });
      }
    } else {
      // 해당 이메일이 DB에 없는 경우
      console.log('회원 정보가 없습니다:', email);
>>>>>>> origin/gpyo0111
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error('로그인 처리 오류:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
<<<<<<< HEAD
});

module.exports = router;
=======

  // connection.query('SELECT * FROM mydb.user_advertiser WHERE email = ?', [email], (err, results) => {
  //   if (err) {
  //       console.error('DB 조회 오류:', err);
  //   }

  //   if (results.length > 0)  {
  //     const user = results[0]; // 조회된 사용자 정보

  //     // 입력된 비밀번호와 DB의 비밀번호 비교
  //     if (user.password === password) {
  //       // 로그인 성공
  //       console.log('로그인 성공:', email);
  //       return res.status(200).json({ message: 'Login success!' });
  //     } else {
  //       // 비밀번호가 일치하지 않는 경우
  //       console.log('비밀번호 불일치:', email);
  //       return res.status(401).json({ message: 'Incorrect password' });
  //     }
  //   } else {
  //     // 해당 이메일이 DB에 없는 경우
  //     console.log('회원 정보가 없습니다:', email);
  //     return res.status(404).json({ message: 'User not found' });
  //   }

  // });
});

module.exports = router;
>>>>>>> origin/gpyo0111
