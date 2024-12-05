const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const JWT_SECRET = 'secret_key'; // JWT 서명에 사용되는 비밀 키// JWT 인증 미들웨어

// 데이터베이스 연결 파일
const connection = require('../src/models/mysql');
=======
const JWT_SECRET = 'secret_key'; // Same secret used for signing the token
const authenticateToken = require('../middleware/autenticationToken'); // Import JWT middleware

// 데이터베이스 연결 파일
const connection = require('../database/connect/mysql');
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f

// 상품 등록 API
router.post('/api/products', async (req, res) => {
  const { product_name, product_price, budget, product_pic, viewer_age, viewer_gender, platform, hashtag, ad_id } = req.body;
<<<<<<< HEAD
  const product_id = Math.floor(Math.random() * 1000); // 랜덤 상품 ID 생성

  console.log('Generated product_id:', product_id);
  console.log('Received product request:', req.body); // 요청 로그

  // 이미지 처리 (Base64 헤더 제거 후 저장)
  const processedProductPic = product_pic && product_pic.includes('base64')
    ? product_pic.split(',')[1] // Base64 데이터만 추출
    : null;

  // 데이터베이스에 저장
=======
  const product_id = Math.floor(Math.random() * 1000); // 랜덤 번호 생성

  console.log('Generated product_id:', product_id);
  console.log('Received product request:', req.body); // 요청 로그 출력

  // 이미지 처리 (Base64 문자열의 헤더 제거 후 저장)
  const processedProductPic = product_pic && product_pic.includes('base64')
    ? product_pic.split(',')[1]  // Base64 데이터만 추출
    : null;

  // 데이터베이스 저장
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
  connection.query(
    'INSERT INTO mydb.products (product_id, product_name, product_price, budget, product_pic, viewer_age, viewer_gender, platform, hashtag, ad_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [product_id, product_name, product_price, budget, processedProductPic, viewer_age, viewer_gender, platform, hashtag, ad_id],
    (err, result) => {
      if (err) {
        console.error('상품 등록 실패:', err);
        return res.status(500).json({ message: '상품 등록에 실패했습니다.' });
      }
      console.log('상품 등록 성공:', product_name);
      return res.status(201).json({ message: '상품 등록 성공' });
    }
  );
});

<<<<<<< HEAD
// 광고주 ID로 필터링하여 상품 목록 조회
=======

// 상품 목록 조회 API (광고주 ID로 필터링)
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
router.get('/api/products/check', async (req, res) => {
  const ad_id = req.query.ad_id;

  if (!ad_id) {
    return res.status(400).json({ message: '광고주 ID가 필요합니다.' });
  }

  connection.query('SELECT * FROM mydb.products WHERE ad_id = ?', [ad_id], (err, results) => {
    if (err) {
<<<<<<< HEAD
      console.error('상품 조회 실패:', err);
      return res.status(500).json({ message: '상품 조회 실패' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '해당 광고주에 대한 상품이 없습니다.' });
    }

=======
      console.error('Failed to retrieve products:', err);
      return res.status(500).json({ message: 'Failed to retrieve products' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No products found for this advertiser' });
    }

    // product_pic 필드에 이미지 타입 헤더를 추가하여 전달
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
    const products = results.map(product => {
      const base64Image = product.product_pic ? `data:image/png;base64,${product.product_pic}` : null;
      return { ...product, product_pic: base64Image };
    });

<<<<<<< HEAD
    console.log('Retrieved products with base64 images:', products); // 디버깅 로그

    return res.status(200).json({
      message: '상품을 성공적으로 조회했습니다.',
=======
    console.log('Retrieved products with base64 images:', products); // 디버깅용 로그

    return res.status(200).json({
      message: 'Products retrieved successfully',
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
      products: products,
    });
  });
});

<<<<<<< HEAD
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
      const base64Image = product.product_pic ? `data:image/png;base64,${product.product_pic}` : null;
      return { ...product, product_pic: base64Image };
    });

    console.log('랜덤 순서로 조회된 상품:', randomizedProducts);

    return res.status(200).json({
      message: '랜덤 순서로 상품을 조회했습니다.',
      products: randomizedProducts,
    });
  });
});

// 상품 수정 API
=======
// 상품 정보 수정 API
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
router.put('/api/products/:product_id/edit', async (req, res) => {
  const product_id = req.params.product_id;
  const { product_name, product_price, budget, viewer_age, viewer_gender, platform, hashtag, product_pic } = req.body;

  console.log('product_id:', product_id);
<<<<<<< HEAD
  console.log('Received update request:', req.body); // 요청 로그

  const processedProductPic = product_pic && product_pic.includes('base64')
    ? product_pic.split(',')[1] // Base64 데이터만 추출
    : null;

=======
  console.log('Received update request:', req.body); // 디버깅을 위한 요청 로그

  // 이미지 처리 (Base64 문자열의 헤더 제거 후 저장)
  const processedProductPic = product_pic && product_pic.includes('base64')
    ? product_pic.split(',')[1]  // Base64 데이터만 추출
    : null;

  // 데이터베이스 업데이트
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
  connection.query(
    'UPDATE mydb.products SET product_name = ?, product_price = ?, budget = ?, product_pic = ?, viewer_age = ?, viewer_gender = ?, platform = ?, hashtag = ? WHERE product_id = ?',
    [product_name, product_price, budget, processedProductPic, viewer_age, viewer_gender, platform, hashtag, product_id],
    (err, result) => {
      if (err) {
<<<<<<< HEAD
        console.error('상품 업데이트 실패:', err);
        return res.status(500).json({ message: '상품 업데이트 실패' });
=======
        console.error('Failed to update product:', err);
        return res.status(500).json({ message: '상품 업데이트에 실패했습니다.' });
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

<<<<<<< HEAD
=======
      // 업데이트 성공 시
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
      console.log('상품 업데이트 성공:', product_name);
      return res.status(200).json({ message: '상품이 성공적으로 업데이트되었습니다.' });
    }
  );
});

<<<<<<< HEAD
=======


>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
// 상품 단일 조회 API
router.get('/api/products/:product_id', (req, res) => {
  const product_id = req.params.product_id;
  
  connection.query('SELECT * FROM mydb.products WHERE product_id = ?', [product_id], (err, results) => {
      if (err) {
<<<<<<< HEAD
          console.error('상품 조회 실패:', err);
          return res.status(500).json({ message: '상품 조회 실패' });
      }
      
      if (results.length === 0) {
          return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
=======
          console.error('Failed to retrieve product:', err);
          return res.status(500).json({ message: 'Failed to retrieve product' });
      }
      
      if (results.length === 0) {
          return res.status(404).json({ message: 'Product not found' });
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
      }

      const product = results[0];
      const base64Image = product.product_pic ? `data:image/png;base64,${product.product_pic}` : null;

<<<<<<< HEAD
      return res.status(200).json({
          ...product,
          product_pic: base64Image,
=======
      // product_pic 필드에 이미지 타입 헤더를 추가하여 전달
      return res.status(200).json({
          ...product,
          product_pic: base64Image, // Base64로 인코딩된 이미지
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
      });
  });
});

<<<<<<< HEAD
=======


>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
// 상품 삭제 API
router.delete('/api/products/:product_id/delete', async (req, res) => {
  const product_id = req.params.product_id;

  console.log('product_id:', product_id);

  connection.query(
    'DELETE FROM mydb.products WHERE product_id = ?',
    [product_id],
    (err, result) => {
      if (err) {
<<<<<<< HEAD
        console.error('상품 삭제 실패:', err);
        return res.status(500).json({ message: '상품 삭제 실패' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

      return res.status(200).json({ message: '상품이 성공적으로 삭제되었습니다.' });
=======
        console.error('Failed to delete product:', err);
        return res.status(500).json({ message: 'Failed to delete product' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // 삭제 성공 시
      return res.status(200).json({ message: 'Product deleted successfully' });
>>>>>>> 999d04c010d7a9bd29fed17bfef35d42ebb1c21f
    }
  );
});

module.exports = router;
