/**
 * Tạo backend/.env từ backend/.env.example nếu chưa có, kèm một JWT_SECRET ngẫu nhiên.
 * Không ghi đè .env đã tồn tại, nên chạy lại "npm run setup" nhiều lần vẫn an toàn.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const backend = path.join(__dirname, '..', 'backend');
const example = path.join(backend, '.env.example');
const target = path.join(backend, '.env');

if (fs.existsSync(target)) {
  console.log('backend/.env đã có sẵn — giữ nguyên.');
  process.exit(0);
}

const secret = crypto.randomBytes(32).toString('hex');
const content = fs
  .readFileSync(example, 'utf-8')
  .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`);

fs.writeFileSync(target, content);
console.log('Đã tạo backend/.env với JWT_SECRET ngẫu nhiên.');
