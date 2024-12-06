
// 데이터베이스 연결 파일
const connection = require('../models/mysql');


exports.createUser = async (username, email, password) => {
    const [result] = await pool.execute(
        `INSERT INTO mydb.user_advertiser (ad_id, email, password, company_id, company_name, phone, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, email, password]
    );
    return result.insertId;
};

exports.findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
      `SELECT * FROM user_advertiser WHERE email = ?`,
      [email]
  );
  return rows[0];
};

// Find a user by ID
exports.findUserById = async (userId) => {
  const [rows] = await pool.execute(
      `SELECT * FROM mydb.user_advertiser WHERE ad_id = ?`,
      [userId]
  );
  return rows[0];
};

exports.verifyCredentials = async (email, password) => {
  const [rows] = await pool.execute(
      `SELECT * FROM users WHERE email = ? AND password = ?`,
      [email, password]
  );
  return rows[0];
};