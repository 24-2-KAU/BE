const express = require('express');
const axios = require('axios');
const router = express.Router();
const connection = require('../src/models/mysql');
const fs = require('fs');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_LOGIN_REDIRECT_URI = process.env.GOOGLE_LOGIN_REDIRECT_URI;
const GOOGLE_SIGNUP_REDIRECT_URI = process.env.GOOGLE_SIGNUP_REDIRECT_URI;
const GOOGLE_USERINFO_URL = process.env.GOOGLE_USERINFO_URL;
const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL;
const YOUTUBE_CHANNEL_INFO_URL = 'https://www.googleapis.com/youtube/v3/channels';

// YouTube Topic Mapping (한국어)
const topicMapping = {
    "/m/04rlf": "음악 (상위 주제)",
    "/m/02mscn": "기독교 음악",
    "/m/0ggq0m": "클래식 음악",
    "/m/01lyv": "국가",
    "/m/02lkt": "일렉트로닉 음악",
    "/m/0glt670": "힙합 음악",
    "/m/05rwpb": "독립 음악",
    "/m/03_d0": "재즈",
    "/m/028sqc": "아시아 음악",
    "/m/0g293": "라틴 아메리카 음악",
    "/m/064t9": "팝 음악",
    "/m/06cqb": "레게",
    "/m/06j6l": "리듬 앤 블루스",
    "/m/06by7": "록 음악",
    "/m/0gywn": "소울 음악",
    "/m/0bzvm2": "게임 (상위 주제)",
    "/m/025zzc": "액션 게임",
    "/m/02ntfj": "액션 어드벤처 게임",
    "/m/0b1vjn": "캐주얼 게임",
    "/m/02hygl": "뮤직 비디오 게임",
    "/m/04q1x3q": "퍼즐 비디오 게임",
    "/m/01sjng": "레이싱 비디오 게임",
    "/m/0403l3g": "롤플레잉 비디오 게임",
    "/m/021bp2": "시뮬레이션 비디오 게임",
    "/m/022dc6": "스포츠 게임",
    "/m/03hf_rm": "전략 비디오 게임",
    "/m/06ntj": "스포츠 (상위 주제)",
    "/m/0jm_": "미식축구",
    "/m/018jz": "야구",
    "/m/018w8": "농구",
    "/m/01cgz": "복싱",
    "/m/09xp_": "크리켓",
    "/m/02vx4": "미식축구",
    "/m/037hz": "골프",
    "/m/03tmr": "아이스 하키",
    "/m/01h7lh": "종합 격투기",
    "/m/0410tth": "모터스포츠",
    "/m/07bs0": "테니스",
    "/m/07_53": "배구",
    "/m/02jjt": "엔터테인먼트 (상위 주제)",
    "/m/09kqc": "유머",
    "/m/02vxn": "영화",
    "/m/05qjc": "공연 예술",
    "/m/066wd": "프로레슬링",
    "/m/0f2f9": "TV 프로그램",
    "/m/019_rr": "라이프스타일 (상위 주제)",
    "/m/032tl": "패션",
    "/m/027x7n": "피트니스",
    "/m/02wbm": "음식",
    "/m/03glg": "취미",
    "/m/068hy": "반려동물",
    "/m/041xxh": "신체적 매력[미용]",
    "/m/07c1v": "기술",
    "/m/07bxq": "관광",
    "/m/07yv9": "차량",
    "/m/098wr": "사회 (상위 주제)",
    "/m/09s1f": "비즈니스",
    "/m/0kt51": "건강",
    "/m/01h6rj": "군대",
    "/m/05qt0": "정치",
    "/m/06bvp": "종교",
    "/m/01k8wb": "지식"
};

const extractLastPathSegment = topicCategories => topicCategories
    .map(url => url.split('/').pop())
    .join(', ');

// API 에러 처리 함수
const handleError = (res, message, error) => {
    console.error(message, error);
    res.status(500).send(`<h1>${message}</h1>`);
};

// 비디오 저장 로직 통합
const saveVideosToDB = (videos, tableName, connection) => {
    const sql = `
        INSERT INTO mydb.${tableName} 
        (videoId, videoUrl, channelId, title, description, thumbnail, tags, viewCount, likeCount, commentCount, relevantTopic, likePerView, commentPerView) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    videos.forEach(video => {
        connection.query(sql, [
            video.videoId,
            video.videoUrl,
            video.channelId,
            video.title,
            video.description,
            video.thumbnail,
            video.tags,
            video.viewCount,
            video.likeCount,
            video.commentCount,
            video.relevantTopic,
            video.likePerView,
            video.commentPerView,
        ], (err) => {
            if (err) {
                console.error(`${tableName} 영상 저장 오류:`, err);
            } else {
                console.log(`${tableName} 영상 저장 성공:`, video.title);
            }
        });
    });
};

const { google } = require('googleapis');

// OAuth2 클라이언트 생성
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

// 필요한 스코프 정의
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly', // 유튜브 데이터 읽기
    'https://www.googleapis.com/auth/userinfo.profile', // 사용자 프로필 정보
    'https://www.googleapis.com/auth/userinfo.email'    // 사용자 이메일 정보
];

router.get('/login', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        redirect_uri: process.env.GOOGLE_LOGIN_REDIRECT_URI // login redirect
    });
    console.log('Login Auth URL:', authUrl); // 디버깅 로그
    res.redirect(authUrl);
});

router.get('/signup', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        redirect_uri: process.env.GOOGLE_SIGNUP_REDIRECT_URI // signup redirect
    });
    console.log('Signup Auth URL:', authUrl); // 디버깅 로그
    res.redirect(authUrl);
});


// 로그인 리디렉션 처리
router.get('/login/redirect', async (req, res) => {
    const code = req.query.code;

    try {
        const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_LOGIN_REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        const accessToken = tokenResponse.data.access_token;

        // 구글 사용자 정보 가져오기
        const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const { email, name } = userInfoResponse.data;

        // MySQL에서 해당 이메일 확인
        connection.query('SELECT * FROM mydb.user_influencer WHERE influencer_id = ?', [email], (err, results) => {
            if (err) {
                console.error('DB 조회 오류:', err);
                return res.status(500).send('DB 조회 중 오류 발생');
            }

            if (results.length > 0) {
                console.log('로그인 성공:', email);
                res.send(`
                    <script>
                        alert('Login completed');
                        localStorage.setItem('email', '${email}');
                        window.location.href = '/influencer_home.html'; 
                    </script>
                `);
            } else {
                console.log('회원 정보가 없습니다:', email);
                res.send('<h1>회원 정보가 없습니다. 회원가입을 진행해주세요.</h1>');
            }
        });
    } catch (error) {
        handleError(res, '로그인 실패', error);
    }
});

// 회원가입 리디렉션 처리
router.get('/signup/redirect', async (req, res) => {
    const code = req.query.code;

    try {
        // 1. Google OAuth 토큰 가져오기
        const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_SIGNUP_REDIRECT_URI,
            grant_type: 'authorization_code',
        });
        const accessToken = tokenResponse.data.access_token;

        // 2. 사용자 정보 가져오기
        const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const { email, name } = userInfoResponse.data;

        // 3. DB에서 사용자 확인
        const [results] = await connection.promise().query(
            'SELECT * FROM mydb.user_influencer WHERE email = ?',
            [email]
        );

        if (results.length > 0) {
            console.log('이미 회원가입된 사용자:', email);
            return res.send(`
                <h1>이미 회원가입이 되었습니다.</h1>
                <a href="/">처음 화면으로 이동</a>
            `);
        }

        // 4. 새 사용자 등록
        await connection.promise().query(
            'INSERT INTO mydb.user_influencer (influencer_id, email, name) VALUES (?, ?, ?)',
            [email, email, name]
        );
        console.log('새 사용자 등록 성공:', email);

        // 5. 채널 정보 가져오기
        const youtubeChannelResponse = await axios.get(YOUTUBE_CHANNEL_INFO_URL, {
            params: {
                part: 'snippet,statistics',
                mine: 'true',
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const channelInfo = youtubeChannelResponse.data.items[0];

        // 6. 채널 정보 저장
        const channelData = {
            channelId: channelInfo.id,
            channelTitle: channelInfo.snippet.title,
            channelDescription: channelInfo.snippet.description,
            channelTotalView: channelInfo.statistics.viewCount,
            channelVideoCount: channelInfo.statistics.videoCount,
            channelSubscribers: channelInfo.statistics.subscriberCount,
            keywords: channelInfo.snippet.tags ? channelInfo.snippet.tags.join(', ') : '',
            channelThumbnail: channelInfo.snippet.thumbnails.default.url,
            channelTopics: channelInfo.topicDetails?.topicIds
                ? channelInfo.topicDetails.topicIds
                      .map(topicId => topicMapping[topicId] || '기타')
                      .join(', ')
                : '주제 없음',
        };

        await connection.promise().query(
            `
            INSERT INTO mydb.channels_python 
            (channelId, channelTitle, channelDescription, channelTotalView, channelVideoCount, channelSubscribers, keywords, channelThumbnail, channelTopics)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                channelTitle = VALUES(channelTitle),
                channelDescription = VALUES(channelDescription),
                channelTotalView = VALUES(channelTotalView),
                channelVideoCount = VALUES(channelVideoCount),
                channelSubscribers = VALUES(channelSubscribers),
                keywords = VALUES(keywords),
                channelThumbnail = VALUES(channelThumbnail),
                channelTopics = VALUES(channelTopics)
            `,
            [
                channelData.channelId,
                channelData.channelTitle,
                channelData.channelDescription,
                channelData.channelTotalView,
                channelData.channelVideoCount,
                channelData.channelSubscribers,
                channelData.keywords,
                channelData.channelThumbnail,
                channelData.channelTopics,
            ]
        );

        // 7. 비디오 정보 가져오기 및 저장
        const fetchVideos = async (order, isAd = false) => {
            const searchResponse = await axios.get(
                'https://www.googleapis.com/youtube/v3/search',
                {
                    params: {
                        part: 'snippet',
                        channelId: channelInfo.id,
                        order,
                        maxResults: 5,
                    },
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            const videoIds = searchResponse.data.items
                .filter(item => item.id?.videoId)
                .map(item => item.id.videoId)
                .join(',');

            const videoDetailsResponse = await axios.get(
                'https://www.googleapis.com/youtube/v3/videos',
                {
                    params: {
                        part: 'snippet,statistics,topicDetails,contentDetails',
                        id: videoIds,
                    },
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            return videoDetailsResponse.data.items.map(video => ({
                videoId: video.id,
                videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
                channelId: video.snippet.channelId,
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnail: video.snippet.thumbnails.default.url,
                tags: video.snippet.tags?.join(', ') || '',
                viewCount: parseInt(video.statistics.viewCount, 10) || 0,
                likeCount: parseInt(video.statistics.likeCount, 10) || 0,
                commentCount: parseInt(video.statistics.commentCount, 10) || 0,
                relevantTopic: video.topicDetails?.topicCategories
                    ? extractLastPathSegment(video.topicDetails.topicCategories)
                    : '주제 없음',
                likePerView: video.statistics.viewCount > 0
                    ? (video.statistics.likeCount / video.statistics.viewCount).toFixed(4)
                    : 0,
                commentPerView: video.statistics.viewCount > 0
                    ? (video.statistics.commentCount / video.statistics.viewCount).toFixed(4)
                    : 0,
            }));
        };

        const [recentVideos, popularVideos, adVideos] = await Promise.all([
            fetchVideos('date'),
            fetchVideos('viewCount'),
            fetchVideos('viewCount', true),
        ]);

        saveVideosToDB(recentVideos, 'rcvideos_python', connection);
        saveVideosToDB(popularVideos, 'popvideos_python', connection);
        saveVideosToDB(adVideos, 'addvideos_python', connection);

        res.send(`
            <script>
                alert('Signup completed and channel information saved!');
                window.location.href = '/login';
            </script>
        `);
    } catch (error) {
        console.error('회원가입 처리 중 오류:', error.message);
        if (!res.headersSent) {
            res.status(500).send('회원가입 처리 중 오류가 발생했습니다.');
        }
    }
});

module.exports = router;
