const db = require('./mysql');

const messageModel = {
    /**
     * 메시지 저장
     */
    saveMessage: (chatRoomId, senderId, receiverId, content) => {
        console.log("This is saveMessages");
        const query = `
            INSERT INTO mydb.messages (chatRoom_id, sender_id, receiver_id, content, sent_at, read_status)
            VALUES (?, ?, ?, ?, NOW(), 0)
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [chatRoomId, senderId, receiverId, content], (err, results) => {
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
        console.log(`Updating read status for chatRoomId: ${chatRoomId}, Receiver: ${receiverId}`);
        console.log(``)
        const query = `
            UPDATE mydb.messages
            SET read_status = 1
            WHERE chatRoom_id = ? AND receiver_id = ? AND read_status = 0
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [chatRoomId, receiverId], (err, results) => {
                if (err) {
                    console.error('Error updating read status:', err);
                    reject(err);
                }
                console.log(`Read status updated for ${results.affectedRows} messages`);
                resolve(results);
            });
        });
    },
    

    // 읽음상태로 변한 메세지를 가져옴
    getReadMessages: (chatRoomId, receiverId) => {
        const query = `
            SELECT msg_id 
            FROM mydb.messages 
            WHERE chatRoom_id = ? AND receiver_id = ? AND read_status = 1
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [chatRoomId, receiverId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    }
    


};

module.exports = messageModel;
