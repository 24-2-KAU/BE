const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret_key'; // JWT 서명에 사용되는 비밀 키// JWT 인증 미들웨어
const axios = require('axios')

// 데이터베이스 연결 파일
const connection = require('../src/models/mysql');

// 상품 등록 API
const { v4: uuidv4 } = require('uuid');

// 상품 등록 API
router.post('/api/products', async (req, res) => {
  const { product_name, product_price, product_description, budget, product_pic, viewer_age, viewer_gender, platform, hashtag, ad_id } = req.body;
  const product_id = uuidv4(); // 고유한 UUID 생성

  console.log('Generated product_id:', product_id);
  console.log('Received product request:', req.body);

  const processedProductPic = product_pic? product_pic : null;

  connection.query(
    'INSERT INTO mydb.products (product_id, product_name, product_price, product_description, budget, product_pic, viewer_age, viewer_gender, platform, hashtag, ad_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [product_id, product_name, product_price, product_description, budget, processedProductPic, viewer_age, viewer_gender, platform, hashtag, ad_id],
    (err, result) => {
      if (err) {
        console.error('상품 등록 실패:', err);
        return res.status(500).json({ message: '상품 등록에 실패했습니다.' });
      }
      console.log('상품 등록 성공:', product_name);
    }
  );

  const aiJson = {
    productName: product_name,
    productDescription: product_description,
    hashtags: hashtag
  };

  try {
    const axiosRes = await axios.post(`https://adinfluencerai.click/product_embedding/${product_id}`, aiJson);

    if (axiosRes.status === 201) {
      console.log('AI 서버 응답: 201 Created');
      return res.status(200).json({
        message: "상품 업로드가 완료되었습니다, (DB저장, Embedding_DB저장까지 완료)"
      });
    } else {
      console.log('AI 서버 응답 상태 코드:', axiosRes.status);
      return res.status(401).json({
        message: "상품 임베딩 중 오류가 발생했습니다."
      });
    }
  } catch (error) {
    console.error('AI 서버 요청 오류:', error);
    return res.status(500).json({
      message: '상품 등록 또는 AI 서버 처리 중 오류가 발생했습니다.'
    });
  }
});

// 광고주 ID로 필터링하여 상품 목록 조회
router.get('/api/products/check', async (req, res) => {
  const ad_id = req.query.ad_id;

  if (!ad_id) {
    return res.status(400).json({ message: '광고주 ID가 필요합니다.' });
  }

  connection.query('SELECT * FROM mydb.products WHERE ad_id = ?', [ad_id], (err, results) => {
    if (err) {
      console.error('상품 조회 실패:', err);
      return res.status(500).json({ message: '상품 조회 실패' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '해당 광고주에 대한 상품이 없습니다.' });
    }

    const products = results.map(product => {
      return { ...product };
    });

    console.log('Retrieved products with base64 images:', products); // 디버깅 로그

    return res.status(200).json({
      message: '상품을 성공적으로 조회했습니다.',
      products: products,
    });
  });
});

// 랜덤 상품 목록 조회 API
router.get('/api/products/random', async (req, res) => {
  connection.query('SELECT * FROM mydb.products', (err, results) => {
    if (err) {
      console.error('상품 조회 실패:', err);
      return res.status(500).json({ message: '상품 조회 실패' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '등록된 상품이 없습니다.' });
    }

    // 랜덤 순서로 상품 정렬
    const randomizedProducts = results.sort(() => Math.random() - 0.5).map(product => {
      return { ...product};
    });

    console.log('랜덤 순서로 조회된 상품:', randomizedProducts);

    return res.status(200).json({
      message: '랜덤 순서로 상품을 조회했습니다.',
      products: randomizedProducts,
    });
  });
});

// 상품 수정 API
router.put('/api/products/:product_id/edit', async (req, res) => {
  const product_id = req.params.product_id;
  const { product_name, product_price, product_description, budget, viewer_age, viewer_gender, platform, hashtag, product_pic } = req.body;

  console.log('product_id:', product_id);
  console.log('Received update request:', req.body); // 요청 로그

  /*
  const processedProductPic = product_pic && product_pic.includes('base64')
    ? product_pic.split(',')[1] // Base64 데이터만 추출
    : null;
  */

  connection.query(
    'UPDATE mydb.products SET product_name = ?, product_price = ?, product_description = ?, budget = ?, product_pic = ?, viewer_age = ?, viewer_gender = ?, platform = ?, hashtag = ? WHERE product_id = ?',
    [product_name, product_price, product_description, budget, product_pic, viewer_age, viewer_gender, platform, hashtag, product_id],
    (err, result) => {
      if (err) {
        console.error('상품 업데이트 실패:', err);
        return res.status(500).json({ message: '상품 업데이트 실패' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

      console.log('상품 업데이트 성공:', product_name);
      return res.status(200).json({ message: '상품이 성공적으로 업데이트되었습니다.' });
    }
  );
});

// 상품 단일 조회 API
router.get('/api/products/:product_id', (req, res) => {
  const product_id = req.params.product_id;
  
  connection.query('SELECT * FROM mydb.products WHERE product_id = ?', [product_id], (err, results) => {
      if (err) {
          console.error('상품 조회 실패:', err);
          return res.status(500).json({ message: '상품 조회 실패' });
      }
      
      if (results.length === 0) {
          return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

      const product = results[0];
      
      return res.status(200).json({
          ...product
      });
  });
});

// 상품 삭제 API
router.delete('/api/products/:product_id/delete', async (req, res) => {
  const product_id = req.params.product_id;

  console.log('product_id:', product_id);

  connection.query(
    'DELETE FROM mydb.products WHERE product_id = ?',
    [product_id],
    (err, result) => {
      if (err) {
        console.error('상품 삭제 실패:', err);
        return res.status(500).json({ message: '상품 삭제 실패' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

      return res.status(200).json({ message: '상품이 성공적으로 삭제되었습니다.' });
    }
  );
});

module.exports = router;
