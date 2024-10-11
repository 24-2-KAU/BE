const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser'); 
const router = express.Router();

// 데이터 베이스 연결파일
const connection  = require('../database/connect/mysql');


// 회원가입
router.post("/api/users/signup", async (req, res) => {
  const { ad_id, password, phone, email } = req.body;

  
  // DB에 데이터 저장
  connection.query('SELECT * FROM user_advertiser WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('DB 조회 오류:', err);
    }

    if (results.length > 0) {
      // 이미 회원가입된 사용자
      console.log('이미 회원가입된 사용자:', email);
    } else {
      // 새 사용자 등록
      connection.query(
        'INSERT INTO user_advertiser (ad_id, password, phone, email) VALUES (?, ?, ?, ?)',
        [ad_id, password, phone, email],
        (err, result) => {
          if (err) {
            console.error('회원가입 실패:', err);
          }
          console.log('회원가입 성공:', email);
        }
      );
    }
  });
  
});

// 로그인
router.post('/api/users/login', async (req, res) => {
  const {ad_id,password} = req.body;

  connection.query('SELECT * FROM mydb.user_advertiser WHERE ad_id = ?', [ad_id], (err, results) => {
    if (err) {
        console.error('DB 조회 오류:', err);
    }

    if (results.length > 0) {
        // 로그인 성공
        console.log('로그인 성공:', ad_id);
    } else {
        // 회원정보가 없을 경우
        console.log('회원 정보가 없습니다:', ad_id);
    }
  });
      
});

module.exports = router;