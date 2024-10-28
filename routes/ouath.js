require("dotenv").config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_LOGIN_REDIRECT_URI = process.env.GOOGLE_LOGIN_REDIRECT_URI;
const GOOGLE_SIGNUP_REDIRECT_URI = process.env.GOOGLE_SIGNUP_REDIRECT_URI;
const GOOGLE_USERINFO_URL = process.env.GOOGLE_USERINFO_URL;
const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL;
const GOOGLE_ANALYTICS_URL = 'https://youtubeanalytics.googleapis.com/v2/reports';  // 추가된 URL
const connection = require('../database/connect/mysql');

// Home page
router.get('/', (req, res) => {
    res.send(`
        <h1>OAuth</h1>
        <a href="/login">Log in</a>
        <a href="/signup">Sign up</a>
    `);
});

// Google Login URL
router.get('/login', (req, res) => {
    let url = 'https://accounts.google.com/o/oauth2/v2/auth';
    url += `?client_id=${GOOGLE_CLIENT_ID}`;
    url += `&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}`;
    url += '&response_type=code';
    url += '&scope=email profile';
    res.redirect(url);
    console.log(url);
});

// Google Signup URL
router.get('/signup', (req, res) => {
    let url = 'https://accounts.google.com/o/oauth2/v2/auth';
    url += `?client_id=${GOOGLE_CLIENT_ID}`;
    url += `&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}`;
    url += '&response_type=code';
    url += '&scope=email profile https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.readonly';
    res.redirect(url);
});

// Fetch YouTube Analytics data (helper function)
async function getYouTubeAnalytics(accessToken) {
    const params = new URLSearchParams({
        ids: 'channel==MINE',  // 자신의 채널 데이터
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        metrics: 'views,comments,likes,dislikes',
        dimensions: 'day',
        sort: 'day',
    });

    try {
        const response = await axios.get(`${GOOGLE_ANALYTICS_URL}?${params}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = response.data;
        console.log('YouTube Analytics Data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching YouTube Analytics data:', error);
        return null;
    }
}

// Google login redirect
router.get('/login/redirect', async (req, res) => {
    const code = req.query.code;
    console.log(`Authorization Code: ${code}`);

    try {
        // OAuth Token 요청
        const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_LOGIN_REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        const accessToken = tokenResponse.data.access_token;
        console.log(`Access Token: ${accessToken}`);

        // 구글 사용자 정보 가져오기
        const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const { email } = userInfoResponse.data;

        // MySQL에서 해당 이메일 확인
        connection.query('SELECT * FROM mydb.user_influencer WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('DB 조회 오류:', err);
                return res.status(500).send('DB 조회 중 오류 발생');
            }

            if (results.length > 0) {
                // 로그인 성공
                console.log('로그인 성공:', email);
                return res.send('<h1>로그인 성공!</h1>');
            } else {
                console.log('회원 정보가 없습니다:', email);
                return res.send('<h1>회원 정보가 없습니다. 회원가입을 진행하세요.</h1>');
            }
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: '로그인 처리 중 오류 발생' });
    }
});

// 회원가입 redirect
router.get('/signup/redirect', async (req, res) => {
    const code = req.query.code;
    console.log(`Authorization Code: ${code}`);

    try {
        // Google OAuth 토큰 요청
        const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_SIGNUP_REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        const accessToken = tokenResponse.data.access_token;

        // 사용자 정보 가져오기
        const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const { email, id: influencer_id, name } = userInfoResponse.data;

        // MySQL에서 해당 이메일 조회
        connection.query('SELECT * FROM mydb.user_influencer WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('DB 조회 오류:', err);
                return res.status(500).send('DB 조회 중 오류 발생');
            }

            if (results.length > 0) {
                // 이미 회원가입된 사용자
                console.log('이미 회원가입된 사용자:', email);
                return res.send(`
                    <h1>이미 회원가입이 되었습니다.</h1>
                    <a href="/">처음 화면으로 이동</a>
                `);
            } else {
                // 회원 가입 및 YouTube Analytics 데이터 가져오기
                const analyticsData = await getYouTubeAnalytics(accessToken);
                if (analyticsData) {
                    console.log('YouTube Analytics Data:', analyticsData);
                }

                // 새로운 사용자 등록
                connection.query('INSERT INTO mydb.user_influencer (influencer_id, email, name) VALUES (?, ?, ?)',
                    [influencer_id, email, name],
                    (err, result) => {
                        if (err) {
                            console.error('DB 저장 오류:', err);
                            return res.status(500).send('회원가입 중 오류 발생');
                        }
                        console.log('새 사용자 등록 성공:', email);
                        return res.send(`
                            <h1>회원가입 성공!</h1>
                            <a href="/">처음 화면으로 이동</a>
                        `);
                    }
                );
            }
        });
    } catch (error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({ error: '회원가입 처리 중 오류 발생' });
    }
});

module.exports = router;
