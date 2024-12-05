const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
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
    if (callback) callback(); // 등록 성공 알림

    // 사용자가 읽지 않은 메시지가 있는 경우, 빨간 점 표시 요청
    if (unreadMessages.has(userId)) {
      io.to(socket.id).emit('showMessengerAlert');
    }
  });


  // 메시지 읽음 처리
  socket.on('clearMessengerAlert', ({ userId }) => {
      console.log(`clearMessengerAlert event received for userId: ${userId}`);
      unreadMessages.delete(userId);
  });

  // 연결 해제 시 정리
  socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
          if (socketId === socket.id) {
              userSockets.delete(userId);
              break;
          }
      }
  });
});

app.use(express.json());

app.post('/notify', (req, res) => {
  console.log('Notification request received:', req.body);
  const { senderId, receiverId } = req.body;
  const receiverSocketId = userSockets.get(receiverId);

  if (receiverSocketId) {
      console.log('Sending notification to:', receiverSocketId);
      io.to(receiverSocketId).emit('showMessengerAlert', { senderId });
      res.status(200).send({ message: 'Notification sent.' });
  } else {
      console.log('Receiver not connected:', receiverId);
      res.status(404).send({ message: 'Receiver not connected.' });
  }
});


server.listen(4000, () => {
    console.log('Notification server running on port 4000');
});
