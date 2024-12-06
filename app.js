require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;

console.log('API 키 확인:', process.env.YOUTUBE_API_KEY); // 키가 출력되는지 확인

// 데이터베이스 연결
const connection = require('./src/models/mysql');

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
// 라우터 불러오기
const userRoutes = require('./routes/userAdvertiser');
const oauthRoutes = require('./routes/oauth');
const productRoutes = require('./routes/products');
// const chatRoutes = require('./routes/chat');
const chatRoutes = require('./routes/chatRoute');
const influencerList = require('./routes/ourInfluencer_list');
const chatHandler = require('./src/socket/socketHandler');
// const initializeWebSocket = require('./routes/socketHandler');
// initializeWebSocket(server); // HTTP 서버와 WebSocket 서버 통합

// 라우터 사용
app.use(userRoutes);
app.use('/', oauthRoutes);
app.use(productRoutes); // '/oauth' 접두사로 분리
app.use('/', chatRoutes);   // '/chat' 접두사로 분리
app.use(influencerList);


// 서버 실행 (server.listen 사용하여 socket.io 통합)
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
