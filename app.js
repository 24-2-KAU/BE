const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const cors = require('cors');  // CORS 모듈 로드
const session = require('express-session'); // express-session 추가
// 데이터베이스 연결
const connection  = require('./database/connect/mysql');
const corsOptions = {
  origin: 'http://127.0.0.1:5500', // 프론트엔드 도메인
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use(session({
  secret: '1102', // 세션을 암호화할 비밀 키
  resave: false,             // 세션이 수정되지 않은 경우에도 다시 저장할지 여부
  saveUninitialized: true,   // 초기화되지 않은 세션을 저장할지 여부
  cookie: { secure: false }  // HTTPS 환경에서는 true로 설정
}));
app.use(express.json());

// 라우터 불러오기
const userRoutes = require('./routes/userAdvertiser');
const oauthRoutes = require('./routes/ouath');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 라우터 사용
app.use(userRoutes);
app.use(oauthRoutes);

// 서버 실행
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

