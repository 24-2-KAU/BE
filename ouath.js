const express = require('express');
const axios = require('axios');
const app = express();

const GOOGLE_CLIENT_ID = "180023724524-krnbi57k3r2u3r2adnj9kb9at8cbaacq.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const GOOGLE_LOGIN_REDIRECT_URI = 'http://localhost:3000/login/redirect';
const GOOGLE_SIGNUP_REDIRECT_URI = 'http://localhost:3000/signup/redirect';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_ANANLYTICS_URL = 'https://youtubeanalytics.googleapis.com/v2/reports';

const connection  = require('./database/connect/mysql');

connection.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
        return;
    }
    console.log('MySQL에 성공적으로 연결되었습니다.');
});

// 그냥 버튼
app.get('/', (req, res) => {
    res.send(`
        <h1>OAuth</h1>
        <a href="/login">Log in</a>
        <a href="/signup">Sign up</a>
    `);
});

// 구글 로그인 화면을 가져오기 위한 url
// 나중에 프론트에서 날려줘야되나?
app.get('/login', (req, res) => {
    let url = 'https://accounts.google.com/o/oauth2/v2/auth';
    url += `?client_id=${GOOGLE_CLIENT_ID}`
    url += `&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}`
    url += '&response_type=code'
    url += '&scope=email profile'    
    res.redirect(url);
});

// 구글 로그인 화면을 가져오기 위한 url    
app.get('/signup', (req, res) => {
    let url = 'https://accounts.google.com/o/oauth2/v2/auth';
    url += `?client_id=${GOOGLE_CLIENT_ID}`
    url += `&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}`
    url += '&response_type=code'
    url += '&scope=email profile https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.readonly '
    res.redirect(url);
});


app.get('/login/redirect', async (req, res) => {
    const { code } = req.query;
    console.log(`code: ${code}`);

    try {
        // Google access 토큰을 받기 위한 코드
        const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_LOGIN_REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        const accessToken = tokenResponse.data.access_token;

        // access_token, refresh_token 등의 구글 토큰 정보 가져오기
        const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        
        const { email } = userInfoResponse.data;

        // MySQL에서 해당 이메일 확인
        connection.query('SELECT * FROM mydb.influencer_user WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('DB 조회 오류:', err);
                return res.status(500).send('DB 조회 중 오류 발생');
            }

            if (results.length > 0) {
                // 로그인 성공
                console.log('로그인 성공:', email);
                return res.send('<h1>로그인 성공!</h1>');
            } else {
                // 회원정보가 없을 경우
                console.log('회원 정보가 없습니다:', email);
                return res.send('<h1>회원 정보가 없습니다. 회원가입을 진행하세요.</h1>');
            }
        });

    
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: '로그인 처리 중 오류 발생' });
    }
});


app.get('/signup/redirect', async (req, res) => {
    const { code } = req.query;
    console.log(`code: ${code}`);

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

        // Google 사용자 정보 가져오기
        const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });


        console.log('YouTube Analytics 데이터:', analyticsResponse.data);
        res.json(analyticsResponse.data);

        // 구글에서 가져온 사용자 정보를 변수 안에 넣기
        const { email, id: googleId } = userInfoResponse.data;

        // MySQL에서 이미 가입된 이메일인지 확인
        connection.query('SELECT * FROM mydb.influencer_user WHERE email = ?', [email], (err, results) => {
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
                // 새 사용자 등록
                connection.query(
                    'INSERT INTO  mydb.influencer_user (email, google_id, created_at) VALUES (?, ?, ?)',
                    [email, googleId, new Date()],
                    (err, result) => {
                        if (err) {
                            console.error('DB 저장 오류:', err);
                            return res.status(500).send('회원가입 중 오류 발생');
                        }
                        console.log('새 사용자 등록 성공:', email);
                        res.redirect('/dashboard');  // 회원가입 후 대시보드로 이동
                    }
                );
            }
        });

    }catch (error) {
        if (error.response) {
            console.error('YouTube Analytics API Error:', error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Failed to fetch YouTube Analytics data' });
        }
    }
});

app.listen(3000, () => {
    console.log('server is running at 3000');
});