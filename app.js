const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// 데이터베이스 연결
const connection  = require('./database/connect/mysql');

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

