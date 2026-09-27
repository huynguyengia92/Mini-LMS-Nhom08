# Mini-LMS — Luyện thi TOEIC trên nền hệ thống quản lý học tập

Đồ án môn SEP — Nhóm 8, lớp 22DTH1, Đại học Công nghệ Đồng Nai.

Hệ thống đáp ứng đủ **8 use case của đề bài** (đăng ký/đăng nhập, khóa học, bài giảng, bài kiểm tra, tiến độ, danh mục),
và chuyên biệt hóa cho luyện thi TOEIC với 2 use case mở rộng: học từ vựng bằng flashcards (UC9) và nghe chép chính tả (UC10).

**Công nghệ:** Node.js (Express 5) + React 19 (Vite) + MongoDB (Mongoose), kiến trúc phân tầng:
`React Page → Express Route → Controller → Pattern / Domain → Mongoose Model → MongoDB`

---

## Chạy dự án lần đầu

### 1. Cài sẵn hai thứ

| Phần mềm | Tải ở đâu | Ghi chú |
|---|---|---|
| **Node.js 20 trở lên** (bản LTS) | https://nodejs.org | Cài xong mở terminal gõ `node -v` để kiểm tra |
| **MongoDB Community Server** | https://www.mongodb.com/try/download/community | Khi cài, giữ tùy chọn *Install MongoD as a Service* để MongoDB tự chạy cùng Windows |

Không muốn cài MongoDB? Dùng bản miễn phí trên mây **MongoDB Atlas** — xem mục [Dùng MongoDB Atlas](#dùng-mongodb-atlas-thay-cho-mongodb-cài-trên-máy).

### 2. Chạy — cách dễ nhất trên Windows

Giải nén (hoặc clone) dự án, rồi **bấm đúp file `CHAY-DU-AN.bat`**.

File này tự kiểm tra máy đã có Node.js và MongoDB chưa (thiếu thì báo cách cài). Lần đầu nó tự cài thư viện và nạp dữ liệu mẫu, mất vài phút; các lần sau khởi động ngay. Xong thì tự mở trình duyệt vào **http://localhost:5173**. Muốn tắt thì bấm `Ctrl + C` trong cửa sổ đen.

### Hoặc chạy bằng lệnh (mọi hệ điều hành)

```bash
git clone <link-repo-của-nhóm>
cd MiniLMS
npm run setup
npm run dev
```

`npm run setup` cài thư viện cho backend và frontend, tạo `backend/.env` với khóa bảo mật ngẫu nhiên, và nạp dữ liệu mẫu — chỉ cần chạy một lần. `npm run dev` chạy backend (cổng 4000) và frontend (cổng 5173) chung một cửa sổ.

### Tài khoản demo

| Vai trò | Username | Mật khẩu |
|---|---|---|
| Học viên | `student1` | `student12345` |
| Giảng viên | `instructor1` | `instructor12345` |
| Quản trị viên | `admin` | `admin12345` |

### Các lệnh khác

| Lệnh (chạy ở thư mục gốc) | Tác dụng |
|---|---|
| `npm run seed` | Nạp lại dữ liệu mẫu (chạy nhiều lần không bị trùng) |
| `npm test` | Chạy unit test của backend |
| `node backend/src/scripts/seedDemoAttempts.js` | Tạo 5 lượt thi TOEIC mẫu cho `student1` để biểu đồ tiến độ có dữ liệu khi demo (`--clear` để xóa) |

---

## Chạy bằng Docker (không cần cài Node.js và MongoDB)

Chỉ cần cài **Docker Desktop** (https://www.docker.com/products/docker-desktop). Trên Windows, nếu chưa có WSL2
thì mở PowerShell bằng quyền Administrator, chạy `wsl --install` và khởi động lại máy trước.

```bash
docker compose up --build
```

Lần đầu mất vài phút để tải image và build; các lần sau khởi động trong vài giây. Mở **http://localhost:5173**,
dữ liệu mẫu và tài khoản demo đã được nạp sẵn.

| Lệnh | Tác dụng |
|---|---|
| `Ctrl + C` | Dừng hệ thống, dữ liệu vẫn giữ lại |
| `docker compose down` | Dừng và gỡ các container |
| `docker compose down -v` | Gỡ luôn dữ liệu, lần chạy sau nạp lại từ đầu |

---

## Gặp lỗi thì xem ở đây

| Hiện tượng | Nguyên nhân và cách sửa |
|---|---|
| `Không kết nối được MongoDB` | MongoDB chưa chạy. Mở **Services** của Windows, tìm *MongoDB Server* và bấm *Start*. Hoặc chuyển sang dùng Atlas. |
| `Thiếu biến JWT_SECRET` | Chưa có `backend/.env`. Chạy lại `npm run setup`. |
| Cổng 4000 hoặc 5173 đã bị chiếm | Tắt chương trình đang dùng cổng đó, hoặc đổi `PORT` trong `backend/.env`. |
| `'npm' is not recognized` | Node.js chưa cài hoặc chưa mở lại terminal sau khi cài. |
| Trang web mở được nhưng không đăng nhập được | Backend chưa chạy — xem cửa sổ terminal có dòng `Mini-LMS API listening` chưa. |

### Dùng MongoDB Atlas thay cho MongoDB cài trên máy

1. Tạo tài khoản ở https://www.mongodb.com/atlas, tạo cluster gói **M0 (Free)**.
2. Mục *Database Access* tạo một user; mục *Network Access* thêm địa chỉ IP của máy (hoặc `0.0.0.0/0` khi đang làm đồ án).
3. Bấm *Connect → Drivers* để lấy chuỗi kết nối dạng `mongodb+srv://...`.
4. Mở `backend/.env`, thay dòng `MONGO_URI=` bằng chuỗi đó (thêm `/mini_lms` trước dấu `?`), rồi chạy `npm run seed`.
chạy dự án:npm run dev

Chuỗi kết nối có chứa mật khẩu — gửi riêng cho nhóm, **không commit** file `.env` lên GitHub (file này đã nằm trong `.gitignore`).

---

## Làm việc nhóm với Git

- Mỗi thành viên commit bằng **tài khoản và email của chính mình**:
  ```bash
  git config user.name "Họ Tên"
  git config user.email "email-dang-ky-github@..."
  ```
- Làm tính năng mới trên nhánh riêng (`git switch -c ten-tinh-nang`), xong thì tạo Pull Request để nhóm xem trước khi gộp vào `main`.
- Backlog và sprint của nhóm quản lý trên Jira, project **Mini-LMS (MLMS)**.

---

## Chức năng

| UC | Chức năng | Vai trò |
|---|---|---|
| UC1 | Đăng ký / Đăng nhập | Tất cả |
| UC2 | Tìm kiếm & đăng ký khóa học | Học viên |
| UC3 | Xem bài giảng (video / tài liệu), đánh dấu hoàn thành | Học viên |
| UC4 | Làm bài kiểm tra & xem điểm — gồm đề TOEIC 7 part, quy đổi thang 990 | Học viên |
| UC5 | Tạo & quản lý khóa học, bài giảng | Giảng viên |
| UC6 | Tạo đề kiểm tra, soạn câu hỏi theo từng loại | Giảng viên |
| UC7 | Theo dõi tiến độ học tập, biểu đồ tiến bộ điểm TOEIC | Học viên |
| UC8 | Quản lý danh mục khóa học | Quản trị viên |
| UC9 *(mở rộng)* | Học từ vựng bằng flashcards, ôn theo lịch lặp lại ngắt quãng | Học viên |
| UC10 *(mở rộng)* | Luyện nghe chép chính tả, chấm từng từ | Học viên |

## Design pattern áp dụng

| Pattern | File | Vai trò trong hệ thống |
|---|---|---|
| Factory Method | `backend/src/patterns/factory/questionFactory.js` | Tạo 7 loại câu hỏi (trắc nghiệm, đúng/sai và 5 dạng TOEIC) cùng bộ phương án tương ứng |
| Strategy | `backend/src/patterns/strategy/` | Hai tầng: chấm từng câu theo loại câu hỏi, và tổng kết bài theo loại đề (phần trăm / quy đổi 990 / luyện part) |
| Template Method | `backend/src/patterns/templateMethod/quizAttemptService.js` | Khung nộp bài cố định với 3 biến thể: bài kiểm tra thường, full test, luyện theo part |
| Observer | `backend/src/patterns/observer/courseSubject.js` | Tự động thông báo cho học viên khi có bài giảng mới |

## Cấu trúc thư mục

```
backend/src/
  models/        19 Mongoose schema
  controllers/   Xử lý request theo từng nhóm chức năng
  routes/        REST API
  patterns/      4 design pattern
  domain/        Quy tắc nghiệp vụ thuần: quy đổi điểm TOEIC, lặp lại ngắt quãng, chấm chép chính tả
  seeds/         Dữ liệu mẫu (khóa học, đề TOEIC, từ vựng, bài chép chính tả, bài giảng video)
backend/public/  Audio phần nghe và ảnh Part 1 (ảnh giấy phép mở, có ghi nguồn)
frontend/src/
  pages/         Các trang theo từng use case
  components/    Bộ UI dùng chung, layout, biểu đồ
docs/            Bộ tài liệu SEP (Project Management / Requirement / Architecture / Testing)
```

## Tài liệu SEP

Nằm trong `docs/`, chia 4 phần theo khung mẫu của môn học:

1. **PROJECT MANAGEMENT** — Project Plan, Kế hoạch chi tiết, Milestone, Product Backlog (35 user story), Team Charter, Risk List/Plan, Configuration Management Plan, Sprint Plan, Retrospective, Meeting Report
2. **CONTEXT AND SYSTEM REQUIREMENT** — Function List (49 chức năng, 8 module), Traceability Matrix, Concept of Operations, Business Rule (21 quy tắc)
3. **SOFTWARE ARCHITECTURE AND DESIGN** — Architecture Driver, Architecture Design, Database Design (19 collection)
4. **TESTING** — Test Plan, Test Case, Test Execute, Defect Report, Test Report, User Acceptance

Video bài giảng là tư liệu nhúng từ YouTube, thuộc về tác giả gốc; nguồn được ghi dưới từng bài.
