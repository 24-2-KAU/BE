const express = require('express');
const router = express.Router();
const chatRoomModel = require('../src/models/chatRooms');
const connection = require('../src/models/mysql');

// 채팅방 생성 API
router.post('/room/create', async (req, res) => {
    console.log("This is room/create");
    const { ad_id, influencer_id, initial_message } = req.body;
    console.log(`ad_id: ${ad_id},influencer_id: ${influencer_id},initial_message: ${initial_message} `);
    
    if (!ad_id || !influencer_id) {
        return res.status(400).json({ message: 'ad_id와 influencer_id는 필수입니다.' });
    }

    const chatRoomId = `${ad_id}_${influencer_id}`;

    try {
        // 새 채팅방 생성
        await chatRoomModel.createChatRoom(chatRoomId, ad_id, influencer_id);

        // 초기 메시지 저장
        if (initial_message) {
            const messageModel = require('../src/models/messages');
            await messageModel.saveMessage(chatRoomId, influencer_id, ad_id, initial_message);
        }

        res.status(201).json({
            message: '채팅방이 성공적으로 생성되었습니다.',
            chatRoomId
        });
    } catch (error) {
        console.error('채팅방 생성 오류:', error);
        res.status(500).json({ message: '채팅방 생성 중 오류가 발생했습니다.' });
    }
});

router.post('/room/check', (req, res) => {
    const { ad_id, influencer_id } = req.body;

    if (!ad_id || !influencer_id) {
        return res.status(400).json({ message: '필수 데이터가 누락되었습니다.' });
    }

    // Query the database to check for an existing chat room
    const query = `
        SELECT chatRoom_id
        FROM mydb.chat_room
        WHERE ad_id = ? AND influencer_id = ?
        LIMIT 1
    `;
    
    connection.query(query, [ad_id, influencer_id], (err, result) => {
        if (err) {
            console.error('Error checking chat room:', err.message);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        if (result.length > 0) {
            // Chat room exists
            res.json({ exists: true, chatRoomId: result[0].chatRoom_id });
        } else {
            // Chat room does not exist
            res.json({ exists: false });
        }
    });
});

// 이전 메세지 가져오기
router.get('/room/:chatRoomId', (req, res) => {
    const { chatRoomId } = req.params;

    // 채팅방 정보 조회
    connection.query('SELECT * FROM mydb.chat_room WHERE chatRoom_id = ?', [chatRoomId], (err, chatRoomResult) => {
        if (err) {
            console.error('채팅방 조회 중 오류 발생:', err);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        if (chatRoomResult.length === 0) {
            return res.status(404).json({ message: '채팅방을 찾을 수 없습니다.' });
        }

        const chatRoom = chatRoomResult[0];

        // 메시지 목록 조회
        connection.query(
            'SELECT sender_id, content, sent_at FROM mydb.messages WHERE chatRoom_id = ? ORDER BY sent_at ASC',
            [chatRoomId],
            (err, messagesResult) => {
                if (err) {
                    console.error('메시지 조회 중 오류 발생:', err);
                    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
                }

                // 응답 데이터 구성
                const responseData = {
                    roomTitle: `${chatRoom.ad_id}와 ${chatRoom.influencer_id}의 채팅방`,
                    participants: [chatRoom.ad_id, chatRoom.influencer_id],
                    currentUserId: req.user ? req.user.id : null, // 현재 로그인한 사용자 ID (옵션)
                    messages: messagesResult.map(msg => ({
                        senderId: msg.sender_id,
                        content: msg.content,
                        sentAt: msg.sent_at
                    }))
                };

                // 성공 응답
                res.status(200).json(responseData);
            }
        );
    });
});


// 이전 대화 목록 가져오기 (친구 목록)
router.post('/api/friends', (req, res) => {
    console.log('친구:', req.body);
    const { userId } = req.body;  // 현재 로그인한 사용자 ID
    console.log('친구 목록 요청 userId:', userId);
    // 사용자가 참여한 모든 채팅방을 조회하고, 상대방 ID를 가져옴
    connection.query(
        `SELECT 
            chatRoom_id,
            CASE 
                WHEN ad_id = ? THEN influencer_id 
                ELSE ad_id 
            END AS friend_id
        FROM chat_room
        WHERE ad_id = ? OR influencer_id = ?`,
        [userId, userId, userId],
        (err, results) => {
            if (err) {
                console.error('친구 목록 조회 실패:', err);
                return res.status(500).json({ message: '친구 목록 조회 실패' });
            }

            return res.status(200).json({ friends: results });
        }
    );
});

module.exports = router;

