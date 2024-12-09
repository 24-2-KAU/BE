const db = require('./mysql');

const messageModel = {
    /**
     * 메시지 저장
     */
    saveMessage: (chatRoomId, senderId, receiverId, content) => {
        console.log("This is saveMessages");

        // 현재 시간 한국 시간으로 변환
    const currentDate = new Date();
    const koreanTime = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
        const query = `
            INSERT INTO mydb.messages (chatRoom_id, sender_id, receiver_id, content, sent_at, read_status)
            VALUES (?, ?, ?, ?, ?, 0)
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [chatRoomId, senderId, receiverId, content, koreanTime], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    /**
     * 특정 채팅방 메시지 가져오기
     */
    getMessages: (chatRoomId) => {
        const query = `
            SELECT * FROM mydb.messages
            WHERE chatRoom_id = ?
            ORDER BY sent_at ASC
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [chatRoomId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },
    
    /**
     * 읽음 상태 업데이트
     */
    updateReadStatus: (chatRoomId, receiverId) => {
        const query = `
            UPDATE mydb.messages
            SET read_status = 1
            WHERE chatRoom_id = ? AND receiver_id = ? AND read_status = 0
        `;
        return db.promise().query(query, [chatRoomId, receiverId]);
    }
    
};

module.exports = messageModel;
