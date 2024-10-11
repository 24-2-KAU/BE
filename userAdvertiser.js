const express = require('express');
const bodyParser = require('body-parser'); 
const app = express();
const port = 3000;

// 데이터 베이스 연결파일
const connection  = require('./database/connect/mysql');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 회원가입
app.post("/api/users/signup", async (req, res) => {
  const { ad_id, password, phone, email } = req.body;

  if (!ad_id || !email || !password || !phone) {
    return res.status(400).send('모든 필드를 입력해 주세요.');
  }
  
  // DB에 데이터 저장
  connection.query('SELECT * FROM user_advertiser WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('DB 조회 오류:', err);
      return res.status(500).send('DB 조회 중 오류 발생');
    }

    if (results.length > 0) {
      // 이미 회원가입된 사용자
      console.log('이미 회원가입된 사용자:', email);
      return res.status(400).send('이미 가입된 이메일입니다.');
    } else {
      // 새 사용자 등록
      connection.query(
        'INSERT INTO user_advertiser (ad_id, password, phone, email) VALUES (?, ?, ?, ?)',
        [ad_id, password, phone, email],
        (err, result) => {
          if (err) {
            console.error('회원가입 실패:', err);
            return res.status(500).send('회원가입 중 오류 발생');
          }
          console.log('회원가입 성공:', email);
          res.status(201).send('회원가입 성공');
        }
      );
    }
  });
  
});

// 로그인
app.post('/api/users/login', async (req, res) => {
  const {ad_id,password} = req.body;

  if (!ad_id || !password) {
    return res.status(400).send('아이디와 비밀번호를 입력하세요!');
  }

  connection.query('SELECT * FROM mydb.user_advertiser WHERE ad_id = ?', [ad_id], (err, results) => {
    if (err) {
        console.error('DB 조회 오류:', err);
        return res.status(500).send('DB 조회 중 오류 발생');
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

app.listen(3000, () => {
  console.log('server is running at 3000');
});