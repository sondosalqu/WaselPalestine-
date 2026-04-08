const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const findUserByEmailOrPhone = async (email, phone) => {
  const [rows] = await db.query(
    "SELECT user_id FROM users WHERE email = ? OR phone_number = ?",
    [email, phone]
  );
  return rows;
};

const findRoleById = async (roleId) => {
  const [rows] = await db.query("SELECT role_id FROM roles WHERE role_id = ?", [roleId]);
  return rows;
};

const insertUser = async ({ name, email, password, phone, roleId }) => {
  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    "INSERT INTO users (name, email, password, phone_number, role_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
    [name, email, password_hash, phone, roleId]
  );
  return result;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows;
};

const comparePassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

// ✅ حفظ الـ refresh token في الـ DB
const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await db.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW())",
    [userId, token, expiresAt]
  );
};

// ✅ التحقق إن الـ refresh token موجود في الـ DB
const findRefreshToken = async (token) => {
  const [rows] = await db.query(
    "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()",
    [token]
  );
  return rows[0] || null;
};

// ✅ حذف الـ refresh token عند الـ logout
const deleteRefreshToken = async (token) => {
  await db.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
};

// ✅ حذف كل tokens اليوزر عند الـ logout من كل الأجهزة
const deleteAllRefreshTokensByUser = async (userId) => {
  await db.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
};

module.exports = {
  findUserByEmailOrPhone,
  findRoleById,
  insertUser,
  findUserByEmail,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllRefreshTokensByUser,
};