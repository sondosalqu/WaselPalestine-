const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const signupUser = async (req, res) => {
  try {
    
    const { name, email, password, phone_number,  role_id } = req.body;

    const finalPhone = phone_number

    
    if (!name || !email || !password || !finalPhone) {
      return res.status(400).send({
        success: false,
        message: "name, email, password, phone_number are required",
        error: "Bad Request"
      });
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        success: false,
        message: "Invalid email format",
        error: "Bad Request"
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(finalPhone)) {
      return res.status(400).send({
        success: false,
        message: "Invalid phone number format",
        error: "Bad Request"
      });
    }

 
    const [exists] = await db.query(
      "SELECT user_id FROM users WHERE email = ? OR phone_number = ?",
      [email, finalPhone]
    );
    if (exists.length > 0) {
      return res.status(409).send({
        success: false,
        message: "Email or phone already in use",
        error: "Conflict"
      });
    }


    const password_hash = await bcrypt.hash(password, 10);


    const finalRoleId = role_id ?? 3;

  
    const [roleCheck] = await db.query(
      "SELECT role_id FROM roles WHERE role_id = ?",
      [finalRoleId]
    );

    if (roleCheck.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Invalid role_id",
        error: "Bad Request"
      });
    }

   
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, phone_number, role_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [name, email, password_hash, finalPhone, finalRoleId]
    );

    return res.status(200).send({
      success: true,
      message: "User created successfully",
      data: {
        user_id: result.insertId,
        name,
        email,
        phone_number: finalPhone,
        role_id: finalRoleId,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in create user",
      error: error.message,
    });
  }
};



const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Email and password are required",
        error: "Bad Request"
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
        error: "Unauthorized"
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
        error: "Unauthorized"
      });
    }

    const accessToken = jwt.sign(
      { user_id: user.user_id, role: user.role_id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { user_id: user.user_id, role: user.role_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error in login"
    });
  }
};

const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: "Error refreshing access token",error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken = jwt.sign(
      { user_id: decoded.user_id, role: decoded.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });

  } catch (err) {
    return res.status(401).json({success: false, message: "Error refreshing access token", error: "Invalid or expired refresh token" });
  }
};

module.exports = {
  signupUser,
  signinUser,
  refreshAccessToken
};