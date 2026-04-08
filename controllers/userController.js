const {
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
} = require("../services/userService");

const { isValidEmail, isValidPhone } = require("../utils/validators");

const signupUser = async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body;
   
    const finalRoleId = 3;

    if (!name || !email || !password || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, phone_number are required",
        error: "Bad Request",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: "Bad Request",
      });
    }

    if (!isValidPhone(phone_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
        error: "Bad Request",
      });
    }

    const exists = await findUserByEmailOrPhone(email, phone_number);
    if (exists.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already in use",
        error: "Conflict",
      });
    }

    const result = await insertUser({
      name,
      email,
      password,
      phone: phone_number,
      roleId: finalRoleId,
    });

  
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user_id: result.insertId,
        name,
        email,
        phone_number,
        role_id: finalRoleId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: "Internal Server Error",
    });
  }
};

const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        error: "Bad Request",
      });
    }

    const rows = await findUserByEmail(email);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "Unauthorized",
      });
    }

    const user = rows[0];

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "Unauthorized",
      });
    }

    const accessToken = signAccessToken({ user_id: user.user_id, role: user.role_id });
    const refreshToken = signRefreshToken({ user_id: user.user_id, role: user.role_id });

    // ✅ حفظ الـ refresh token في الـ DB
    await saveRefreshToken(user.user_id, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error in login",
      error: "Internal Server Error",
    });
  }
};

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token required",
      error: "Bad Request",
    });
  }

  try {
    // ✅ أولاً تحقق إنه valid توكن
    const decoded = verifyRefreshToken(refreshToken);

    // ✅ ثانياً تحقق إنه موجود في الـ DB (مش ملغي أو منسرق)
    const tokenInDb = await findRefreshToken(refreshToken);
    if (!tokenInDb) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or revoked",
        error: "Unauthorized",
      });
    }

    const newAccessToken = signAccessToken({ user_id: decoded.user_id, role: decoded.role });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
      error: "Unauthorized",
    });
  }
};


const logoutUser = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token required",
      error: "Bad Request",
    });
  }

  if (! typeof refreshToken !== "string") {
  return res.status(400).json({
    success: false,
    message: "Valid refresh token required",
    error: "Bad Request",
  });
}
  try {
    await deleteRefreshToken(refreshToken);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error during logout",
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  signupUser,
  signinUser,
  refreshAccessToken,
  logoutUser,
};