const db = require('./mysql'); // 데이터베이스 연결 파일

const chatRoomModel = {
    /**
     * 채팅방 생성
     * @param {string} chatRoomId - 채팅방 ID
     * @param {string} adId - 광고주 ID
     * @param {string} influencerId - 인플루언서 ID
     * @returns {Promise} - 생성 결과
     */
    createChatRoom: (chatRoomId, adId, influencerId) => {
        const query = `
            INSERT INTO mydb.chat_room (chatRoom_id, ad_id, influencer_id, created_at)
            VALUES (?, ?, ?, CURDATE())
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [chatRoomId, adId, influencerId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    /**
     * 특정 유저의 채팅방 목록 조회
     * @param {string} userId - 사용자 ID (광고주 또는 인플루언서)
     * @returns {Promise} - 채팅방 목록
     */
    getUserChatRooms: (userId) => {
        const query = `
            SELECT * FROM mydb.chat_room
            WHERE ad_id = ? OR influencer_id = ?
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [userId, userId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    /**
     * 채팅방이 존재하는지 확인
     * @param {string} adId - 광고주 ID
     * @param {string} influencerId - 인플루언서 ID
     * @returns {Promise} - 채팅방 정보
     */
    getExistingChatRoom: (adId, influencerId) => {
        const query = `
            SELECT * FROM mydb.chat_room
            WHERE ad_id = ? AND influencer_id = ?
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [adId, influencerId], (err, results) => {
                if (err) reject(err);
                resolve(results[0]); // 이미 존재하는 채팅방 반환
            });
        });
    },

    /**
     * 채팅방 삭제 (옵션)
     * @param {string} chatRoomId - 채팅방 ID
     * @returns {Promise} - 삭제 결과
     */
    deleteChatRoom: (chatRoomId) => {
        const query = `
            DELETE FROM mydb.chat_room
            WHERE chatRoom_id = ?
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [chatRoomId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    }
};

module.exports = chatRoomModel;
