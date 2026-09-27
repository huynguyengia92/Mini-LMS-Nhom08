FROM node:24-alpine

WORKDIR /app

# Cài thư viện trước để Docker cache lại khi chỉ sửa mã nguồn
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public

EXPOSE 4000

# Nạp dữ liệu mẫu (chạy lại không bị trùng) rồi mới mở API
CMD ["sh", "-c", "node src/seed.js && node src/server.js"]
