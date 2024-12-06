
const messageModel = require('../models/messages');
const userSockets = new Map(); // userId -> socket.id 매핑
const axios = require('axios');

module.exports = (io, socket) => {
    
    socket.on('registerUser', (userId, callback) => {
        console.log(`registerUser event received for userId: ${userId}`);
        userSockets.set(userId, socket.id);
        console.log('Current userSockets map:', Array.from(userSockets.entries()));
        if (callback) callback(); // 클라이언트에 등록 성공 알림
    });
    
    
    
    // 사용자 연결 해제 시 소켓 ID 제거
    socket.on('disconnect', () => {
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                console.log(`User disconnected: ${userId}`);
                break;
            }
        }
    });
    
    /**
     * 1. 채팅방 참여
     */
    socket.on('joinRoom', async (chatRoomId) => {
        socket.join(chatRoomId);
        console.log(`User joined room: ${chatRoomId}`);
    
        // 이전 메시지 로드
        const messages = await messageModel.getMessages(chatRoomId);
        socket.emit('load messages', messages); // 클라이언트에 이전 메시지 전송
    
    });

    /**
     * 2. 메시지 송수신
     */
    socket.on('sendMessage', async ({ chatRoomId, senderId, receiverId, content }) => {
        // 메시지 저장
        await messageModel.saveMessage(chatRoomId, senderId, receiverId, content);

        // 특정 채팅방의 모든 사용자에게 메시지 전송
        io.to(chatRoomId).emit('receiveMessage', {
            chatRoomId,
            senderId,
            receiverId,
            content,
            sentAt: new Date()
        });
        // 알림 서버로 메시지 정보 전달
        notifyServer({ senderId, receiverId});
    });

    function notifyServer(notificationData) {
        axios.post('http://localhost:4000/notify', notificationData, {
        headers: { 'Content-Type': 'application/json' },
        })
        .then(response => console.log('Notification sent successfully:', response.data))
        .catch(error => console.error('Notification sending failed:', error));
    }
};




