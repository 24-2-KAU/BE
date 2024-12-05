<<<<<<< HEAD
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;
// HTTP 서버 생성
const http = require("http");
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
      origin: ['http://127.0.0.1:5501', 'http://localhost:3000'], // Add your frontend URLs
      credentials: true
  }
});

const corsOptions = {
  origin: ['http://127.0.0.1:5501', 'http://localhost:3000'], // 필요한 도메인 추가
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors());


// 세션 설정
app.use(session({

  secret: '1102',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// 요청 크기 제한 설정
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));

// bodyParser 설정
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, '../')));

const socketHandler = require('./src/socket/socketHandler');
io.on('connection', (socket) => {
    socketHandler(io, socket);
});
=======
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;
const cors = require('cors');  // CORS 모듈 로드
const session = require('express-session'); // express-session 추가
// 데이터베이스 연결
const connection  = require('./database/connect/mysql');
//const authenticateToken = require('./middleware/autenticationToken'); // 미들웨어 가져오기

const corsOptions = {
  origin: 'http://127.0.0.1:5500', // 프론트엔드 도메인
  optionsSuccessStatus: 200,
  credentials: true 
};
app.use(cors(corsOptions));

app.use(session({
  secret: '1102', // 세션을 암호화할 비밀 키
  resave: false,             // 세션이 수정되지 않은 경우에도 다시 저장할지 여부
  saveUninitialized: true,   // 초기화되지 않은 세션을 저장할지 여부
  cookie: { secure: false }  // HTTPS 환경에서는 true로 설정
}));

// 요청 크기 제한 설정
app.use(express.json({ limit: '1000mb' }));  // JSON 본문 크기 제한 설정
app.use(express.urlencoded({ extended: true, limit: '1000mb' })); // URL 인코딩된 데이터의 크기 제한 설정

>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
// 라우터 불러오기
const userRoutes = require('./routes/userAdvertiser');
const oauthRoutes = require('./routes/ouath');
const productRoutes = require('./routes/products');
<<<<<<< HEAD
// const chatRoutes = require('./routes/chat');
const chatRoutes = require('./routes/chatRoute');
const influencerList = require('./routes/ourInfluencer_list');
const chatHandler = require('./src/socket/socketHandler');
// const initializeWebSocket = require('./routes/socketHandler');
// initializeWebSocket(server); // HTTP 서버와 WebSocket 서버 통합
=======

app.use(bodyParser.json({ limit: '10mb' }));  // body-parser JSON 크기 제한 설정
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // URL 인코딩된 데이터의 크기 제한 설정
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f

// 라우터 사용
app.use(userRoutes);
app.use(oauthRoutes);
<<<<<<< HEAD
app.use(productRoutes); // '/oauth' 접두사로 분리
app.use(chatRoutes);   // '/chat' 접두사로 분리
app.use(influencerList);


// 서버 실행 (server.listen 사용하여 socket.io 통합)
server.listen(port, () => {
=======
app.use(productRoutes);

// 서버 실행
app.listen(port, () => {
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
  console.log(`Server is running at http://localhost:${port}`);
});
