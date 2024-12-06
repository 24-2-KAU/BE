const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
// JSON 데이터 파싱 설정
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://ad-influencer.com', 'http://127.0.0.1:5500'], // 허용 도메인 명시
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const userSockets = new Map(); // userID -> socket.id 매핑
const unreadMessages = new Set(); // 읽지 않은 메시지를 보유한 사용자 ID

io.on('connection', (socket) => {
  console.log('Notification server socket connected:', socket.id);

  // 사용자 소켓 ID 등록
  socket.on('registerUser', (userId, callback) => {
    console.log(`registerUser event received for userId: ${userId}`);
    userSockets.set(userId, socket.id);
    console.log('Current userSockets map:', Array.from(userSockets.entries()));
    if (callback) callback();

    // 사용자가 읽지 않은 메시지가 있는 경우 알림
    if (unreadMessages.has(userId)) {
      io.to(socket.id).emit('showMessengerAlert');
    }
  });

  // 메시지 읽음 처리
  socket.on('clearMessengerAlert', ({ userId }) => {
    console.log(`clearMessengerAlert event received for userId: ${userId}`);
    unreadMessages.delete(userId);
  });

  // 연결 해제 시 소켓 정리
  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});


// 알림 전송 라우트
app.post('/notify', (req, res) => {
  const { senderId, receiverId } = req.body;
  console.log('Notification request received:', { senderId, receiverId });

  // receiverId로 등록된 소켓 ID 확인
  const receiverSocketId = userSockets.get(receiverId);

  if (receiverId) {
    console.log(`Sending notification to receiverId: ${receiverId} with socket ID: ${receiverSocketId}`);
    io.to(receiverSocketId).emit('showMessengerAlert', { senderId });
    return res.status(200).send({ message: 'Notification sent successfully.' });
  } else {
    console.log(`Receiver not connected: ${receiverId}`);
    return res.status(404).send({ message: 'Receiver not connected.' });
  }

});

// 서버 실행
server.listen(4000, () => {
  console.log('Notification server running on port 4000');
});

//