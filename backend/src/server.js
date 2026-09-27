require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

// Thiếu JWT_SECRET thì server vẫn chạy nhưng mọi lần đăng nhập đều lỗi — dừng sớm và nói rõ cách sửa.
if (!process.env.JWT_SECRET) {
  console.error('Thiếu biến JWT_SECRET. Chạy "npm run setup" ở thư mục gốc để tạo backend/.env tự động,');
  console.error('hoặc sao chép backend/.env.example thành backend/.env rồi điền giá trị.');
  process.exit(1);
}

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Mini-LMS API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Không kết nối được MongoDB:', err.message);
    console.error('Kiểm tra MongoDB đã chạy chưa, hoặc sửa MONGO_URI trong backend/.env.');
    process.exit(1);
  });
