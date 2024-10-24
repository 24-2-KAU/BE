const express = require('express');
const router = express.Router();

// 데이터 베이스 연결파일
const connection  = require('../database/connect/mysql');

// 상품 등록 api
// 상품을 올리는 광고주의 id를 가져와서 넣기
router.post('/api/products',async(req, res) => {
  const{product_name,product_price, budget, product_pic, viewer_age, viewer_gender, platform, hastag  } = req.body;
  const product_id = Math.floor(Math.random() * 1000); // Generates a random number between 0 and 999,999,999
  console.log('Generated product_id:', product_id);
  console.log('Received product request:', req.body); // 요청 로그 출력

  // 데이터 베이스 저장
  connection.query('INSERT INTO  mydb.products (product_id, product_name, product_price, budget, product_pic, viewer_age, viewer_gender, platform, hashtag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [product_id, product_name, product_price, budget, product_pic, viewer_age, viewer_gender, platform, hastag],
    (err,result) => {
      if(err){
        console.error('상품등록 실패: ',err);
        return res.status(500).json({ message: 'failed' });
      }
      console.log('상품등록 성공:', product_name);
      return res.status(201).json({ message: 'successful' });

    }
  )
})

// 상품 목록 조회 api
router.get('/api/products/check', async (req, res) => {
  console.log('상품 목록 조회 요청 수신');

  connection.query('SELECT * FROM mydb.products', (err, results) => {
    if (err) {
      console.error('Failed to retrieve products:', err);
      return res.status(500).json({ message: 'Failed to retrieve products' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    // 성공적으로 상품 목록을 반환
    return res.status(200).json({
      message: 'Products retrieved successfully',
      products: results, // 상품 목록을 반환
    });
  });
});


// 상품 정보 수정 api
// product_id가 같아야함.
router.put('/api/products/:product_id/edit', async (req, res) => {
  const product_id = req.params.product_id; 
  const { product_name, product_price, budget, product_pic, viewer_age, viewer_gender, platform, hashtag } = req.body;
  
  console.log('product_id:', product_id);

  // Update query
  connection.query(
    'UPDATE mydb.products SET product_name = ?, product_price = ?, budget = ?, product_pic = ?, viewer_age = ?, viewer_gender = ?, platform = ?, hashtag = ? WHERE product_id = ?',
    [product_name, product_price, budget, product_pic, viewer_age, viewer_gender, platform, hashtag, product_id], 
    (err, result) => {
      if (err) {
        console.error('Failed to update product:', err);
        return res.status(500).json({ message: 'Failed to update product' });
      }

      // 데이터베이스에서 업데이트 쿼리로 인해 수정된 데이터 베이스 행의 개수를 나타냄
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // 업데이트 성공 시 
      return res.status(200).json({ message: 'Product updated successfully' });
    }
  );
});


// 상품 삭제 api
router.delete('/api/products/:product_id/delete', async(req,res)=>{
  const product_id = req.params.product_id; // Use product_id from params
  const { product_name, product_price, budget, product_pic, viewer_age, viewer_gender, platform, hashtag } = req.body;
  
  console.log('product_id:', product_id);

  connection.query(
    'DELETE FROM mydb.products WHERE product_id = ?',
    [product_id],
    (err, result) => {
      if (err) {
        console.error('Failed to update product:', err);
        return res.status(500).json({ message: 'Failed to update product' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // 업데이트 성공 시
      return res.status(200).json({ message: 'Product updated successfully' });
    }
  );
})

module.exports = router;