const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// UC1 — Đăng ký
async function register(req, res) {
  const { username, email, password, firstName, lastName, role } = req.body;
  if (!username || !email || !firstName || !lastName) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
  }
  if (!['STUDENT', 'INSTRUCTOR'].includes(role)) {
    return res.status(400).json({ message: 'Vai trò đăng ký không hợp lệ.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
  }
  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) return res.status(400).json({ message: 'Username hoặc email đã tồn tại.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash, firstName, lastName, role });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

// UC1 — Đăng nhập
async function login(req, res) {
  const { username, password } = req.body;
  // Sai thông tin đăng nhập là lỗi xác thực (401), không phải dữ liệu gửi lên sai định dạng (400).
  // Message giữ chung cho cả hai trường hợp để không lộ username nào có thật.
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ user });
}
// Đăng nhập bằng Google
async function googleLogin(req, res) {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: 'Thiếu Google credential.',
            });
        }

        // Xác thực Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const googleId = payload.sub;
        const email = payload.email;
        const emailVerified = payload.email_verified;

        const firstName = payload.given_name || 'Google';
        const lastName = payload.family_name || 'User';

        if (!email || !emailVerified) {
            return res.status(400).json({
                message: 'Tài khoản Google chưa xác minh email.',
            });
        }

        // Kiểm tra tài khoản Google đã tồn tại
        let user = await User.findOne({ googleId });

        if (user) {
            const token = signToken(user);
            setAuthCookie(res, token);

            return res.json({ user });
        }

        // Kiểm tra email đã được sử dụng chưa
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message:
                    'Email này đã được sử dụng. Hãy đăng nhập bằng tài khoản hiện tại.',
            });
        }

        // Tạo username từ email
        const emailName = email.split('@')[0];

        let username = `google_${emailName}`;

        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            username = `google_${emailName}_${Date.now()}`;
        }

        // Tạo tài khoản Student mặc định
        user = await User.create({
            username,
            email,
            googleId,
            firstName,
            lastName,
            role: 'STUDENT',
        });

        // Tạo JWT
        const token = signToken(user);

        setAuthCookie(res, token);

        return res.status(201).json({ user });
    } catch (error) {
        console.error('Google login error:', error);

        return res.status(401).json({
            message: 'Đăng nhập Google không hợp lệ.',
        });
    }
}
function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Đã đăng xuất.' });
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, googleLogin, logout, me };
