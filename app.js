require("dotenv").config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const http = require("http");
const { Server } = require('socket.io');

const app = express();
const port = 3000;

// API 키 확인
console.log('API 키 확인:', process.env.YOUTUBE_API_KEY);

// 데이터베이스 연결
const connection = require('./src/models/mysql');

// CORS 설정
const corsOptions = {
  origin: ['http://localhost:4000', 'https://ad-influencer.com', 'http://127.0.0.1:5500', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));

// 세션 설정
app.use(session({
  secret: '1102',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS 사용 시 true로 변경
}))

// 요청 크기 제한 설정
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, '../')));

// HTTP 및 WebSocket 서버 생성
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:4000', 'https://ad-influencer.com','http://127.0.0.1:5500', 'http://localhost:3000'], // 필요한 도메인 추가
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO 핸들러 연결
const socketHandler = require('./src/socket/socketHandler');
io.on('connection', (socket) => {
  socketHandler(io, socket);
});

// 라우터 설정
const userRoutes = require('./routes/userAdvertiser');
const oauthRoutes = require('./routes/oauth');
const productRoutes = require('./routes/products');
const chatRoutes = require('./routes/chatRoute');
const influencerList = require('./routes/ourInfluencer_list');

// 라우터 사용
app.use(userRoutes);
app.use('/', oauthRoutes);
app.use(productRoutes);
app.use('/', chatRoutes);
app.use(influencerList);

// 서버 실행
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
