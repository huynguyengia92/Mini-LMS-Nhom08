# Mini-LMS — Bảng dữ kiện dùng chung cho toàn bộ tài liệu SEP

**QUAN TRỌNG:** Mọi tài liệu SEP phải dùng ĐÚNG các con số/ID trong file này để đảm bảo khớp nhau (Function List khớp Traceability Matrix khớp Test Case khớp Database Design), đúng nguyên tắc nêu trong `00_GIOI_THIEU.md` của bộ mẫu.

## 1. Thông tin chung

- **Đề tài:** Mini-LMS — Hệ thống quản lý học tập thu nhỏ, chuyên biệt hóa cho **luyện thi TOEIC** (đăng ký khóa học, học bài giảng, luyện đề TOEIC theo part hoặc full test, học từ vựng bằng flashcards)
- **Nhóm:** Nhóm 8
- **Lớp:** 22DTH1
- **Trường:** Đại học Công nghệ Đồng Nai (DNTU)
- **Giảng viên hướng dẫn (GVHD/Mentor):** Nguyễn Minh Tân (Thực hành) / Bùi Minh Phụng (Lý thuyết)
- **Khách hàng giả định:** Ông Trần Văn Bình – Giám đốc Trung tâm Anh ngữ EduPro
- **Công nghệ:** Node.js (Express 5) + React 19 (Vite) + MongoDB (Mongoose) — đúng theo bộ mẫu SEP
- **Kiến trúc:** Layered — React View → Express Controller → Service/Pattern layer → Mongoose Model → MongoDB
- **Design pattern áp dụng:** Factory Method, Strategy, Template Method, Observer (chi tiết xem `docs/_phan-tich-so-bo/`)
- **Repo code:** `backend/` (Express API, port 4000), `frontend/` (React SPA, port 5173)

## 2. Thành viên nhóm (3 người)

| Họ tên | Vai trò Scrum | Phụ trách kỹ thuật | GitHub username | Email | MSSV |
|---|---|---|---|---|---|
| Lê Phước Hậu | Scrum Master kiêm Developer | Backend: Auth, Course, Enrollment, hạ tầng dự án | (tự điền) | 1822020129@dntu.edu.vn | 1822020129 |
| Nguyễn Gia Huy | Product Owner kiêm Developer | Frontend React toàn bộ + Quiz module (UC4, UC6) | (tự điền) | 1822040092@dntu.edu.vn | 1822040092 |
| Lương Nhật Hảo | Developer kiêm Tester | Progress tracking, Category/Admin (UC7, UC8) + Test Case/Test Report | (tự điền) | 1822030132@dntu.edu.vn | 1822030132 |

## 3. Mốc thời gian (giả định, học kỳ ~13 tuần)

| Sprint | Thời gian | Trạng thái |
|---|---|---|
| Sprint 0 (Setup) | 14/09/2026 – 20/09/2026 (1 tuần) | Hoàn thành |
| Sprint 1 | 21/09/2026 – 04/10/2026 (2 tuần) | Hoàn thành — toàn bộ 8 UC + 4 pattern đã code xong |
| Sprint 2 | 05/10/2026 – 18/10/2026 (2 tuần) | Kế hoạch |
| Sprint 3 | 19/10/2026 – 01/11/2026 (2 tuần) | Kế hoạch — Module Luyện thi TOEIC (US.21–US.27) |
| Sprint 4 | 02/11/2026 – 15/11/2026 (2 tuần) | Kế hoạch — Module Từ vựng & Flashcards (US.28–US.31) |
| Sprint 5 | 16/11/2026 – 29/11/2026 (2 tuần) | Kế hoạch — Module Nghe chép chính tả (US.32–US.35) + integration test |
| Sprint 6 (Hardening + UAT) | 30/11/2026 – 13/12/2026 (2 tuần) | Kế hoạch |

Ba module mở rộng (bổ sung vào yêu cầu 15–16/09/2026) nằm trong Product Backlog với ID **US.21–US.35** (US.01–US.20 là 8 UC gốc, Sprint 1) và được xếp vào Sprint 3, 4, 5 — mỗi sprint hoàn thiện, kiểm thử và nghiệm thu một module; lịch này khớp giữa Project Plan, Product Backlog, Milestone và Test Plan. Mô hình dữ liệu gốc cho 8 UC có **12 collection** (nay 19).

Vì toàn bộ 8 use case đã được code xong ngay trong Sprint 1 (thực tế phát triển nhanh hơn dự kiến nhờ AI-assisted development), tài liệu Testing (Test Case/Test Execute/Defect Report/Test Report/User Acceptance) mẫu cho **1 chức năng đại diện: "Đăng ký tài khoản" (F.1.1)**, đúng theo quy mô mà bộ mẫu SEP thể hiện ở Sprint 1.

## 4. Danh sách Use Case (UC) — giữ nguyên theo đề bài gốc

| UC ID | Tên | Actor |
|---|---|---|
| UC1 | Đăng ký/Đăng nhập | Học viên, Giảng viên, Quản trị viên |
| UC2 | Tìm kiếm & đăng ký khóa học | Học viên |
| UC3 | Xem bài giảng | Học viên |
| UC4 | Làm bài kiểm tra trắc nghiệm & xem điểm | Học viên |
| UC5 | Tạo & quản lý khóa học | Giảng viên |
| UC6 | Tạo đề kiểm tra | Giảng viên |
| UC7 | Theo dõi tiến độ học tập | Học viên |
| UC8 | Quản lý danh mục khóa học | Quản trị viên |
| UC9 | Học từ vựng với flashcards | Học viên |
| UC10 | Luyện nghe chép chính tả | Học viên |

> UC9 và UC10 là use case nhóm **mở rộng thêm** so với 8 use case gợi ý của đề bài, phục vụ đặc thù luyện thi TOEIC: UC9 ghi nhớ từ vựng theo phương pháp lặp lại ngắt quãng, UC10 luyện bắt âm bằng cách nghe từng câu và gõ lại (dictation).

## 5. Functional Requirement (FR) — dùng cho Traceability Matrix (khớp 1:1 với UC)

FR.01=UC1, FR.02=UC2, FR.03=UC3, FR.04=UC4, FR.05=UC5, FR.06=UC6, FR.07=UC7, FR.08=UC8, FR.09=UC9, FR.11=UC10.

Ngoài ra bổ sung **FR.10 — Luyện đề TOEIC theo cấu trúc 7 part** (mở rộng của FR.04): học viên chọn luyện từng part hoặc làm trọn đề, hệ thống quy đổi điểm thang 990 và phân tích kết quả theo part / dạng bài. Đề mẫu hiện có đủ 7 part (33 câu); Part 1 có ảnh, Part 1–4 có audio.

**FR.11 — Luyện nghe chép chính tả** (= UC10): học viên nghe từng câu, gõ lại nội dung nghe được; hệ thống chấm từng từ, chỉ ra từ đúng/sai/thiếu/thừa và lưu độ chính xác tốt nhất của mỗi câu.

## 6. Function List — dùng cho tài liệu 2.1 (49 function, 8 module)

**Module 1 — Tài khoản** (liên quan FR.01/UC1)
- F.1.1 | Đăng ký tài khoản | Cao | Học viên/Giảng viên tạo tài khoản mới, chọn vai trò | Khách (chưa đăng nhập)
- F.1.2 | Đăng nhập | Cao | Xác thực bằng username/mật khẩu, cấp JWT | Học viên, Giảng viên, Quản trị
- F.1.3 | Đăng xuất | TB | Xóa phiên đăng nhập (cookie JWT) | Học viên, Giảng viên, Quản trị

**Module 2 — Khóa học** (liên quan FR.02/FR.03/FR.05 = UC2/UC3/UC5)
- F.2.1 | Tìm kiếm khóa học | Cao | Lọc theo từ khóa và/hoặc danh mục | Học viên
- F.2.2 | Xem chi tiết khóa học | Cao | Xem mô tả, danh sách bài giảng, bài kiểm tra | Học viên
- F.2.3 | Đăng ký khóa học | Cao | Tạo Enrollment cho học viên | Học viên
- F.2.4 | Tạo khóa học | Cao | Giảng viên tạo khóa học mới | Giảng viên
- F.2.5 | Sửa khóa học | TB | Cập nhật tiêu đề/mô tả/danh mục/trạng thái xuất bản | Giảng viên
- F.2.6 | Xóa khóa học | TB | Xóa khóa học + toàn bộ dữ liệu liên quan | Giảng viên
- F.2.7 | Thêm bài giảng | Cao | Thêm bài giảng (video/tài liệu) vào khóa học | Giảng viên
- F.2.8 | Sửa bài giảng | TB | Cập nhật nội dung bài giảng | Giảng viên
- F.2.9 | Xóa bài giảng | TB | Xóa bài giảng khỏi khóa học | Giảng viên
- F.2.10 | Xem bài giảng | Cao | Xem nội dung video/tài liệu | Học viên
- F.2.11 | Đánh dấu hoàn thành bài giảng | Cao | Ghi nhận tiến độ học từng bài giảng | Học viên

**Module 3 — Bài kiểm tra** (liên quan FR.04/FR.06 = UC4/UC6)
- F.3.1 | Tạo bài kiểm tra | Cao | Tạo Quiz gắn với khóa học, đặt hạn nộp/thời gian làm bài | Giảng viên
- F.3.2 | Thêm câu hỏi trắc nghiệm (MCQ) | Cao | Dùng Factory Method tạo Question + Choice | Giảng viên
- F.3.3 | Thêm câu hỏi Đúng/Sai (TF) | Cao | Dùng Factory Method tạo Question + Choice | Giảng viên
- F.3.4 | Xóa câu hỏi | Thấp | Xóa câu hỏi khỏi đề | Giảng viên
- F.3.5 | Xóa bài kiểm tra | Thấp | Xóa Quiz + toàn bộ câu hỏi | Giảng viên
- F.3.6 | Bắt đầu làm bài kiểm tra | Cao | Tạo QuizAttempt mới hoặc tiếp tục attempt dở dang | Học viên
- F.3.7 | Nộp bài kiểm tra | Cao | Chấm điểm tự động (Template Method + Strategy) | Học viên
- F.3.8 | Xem kết quả bài kiểm tra | Cao | Xem điểm và đáp án đúng/sai từng câu | Học viên

**Module 4 — Tiến độ & Thông báo** (liên quan FR.07 = UC7)
- F.4.1 | Xem tiến độ học tập | Cao | % bài giảng hoàn thành + điểm quiz theo từng khóa học | Học viên
- F.4.2 | Xem thông báo | TB | Nhận thông báo bài giảng mới/hạn nộp bài (Observer) | Học viên, Giảng viên, Quản trị

**Module 5 — Danh mục** (liên quan FR.08 = UC8)
- F.5.1 | Xem danh sách danh mục | TB | Public, dùng để lọc tìm kiếm khóa học | Tất cả
- F.5.2 | Thêm danh mục | Cao | Tạo danh mục khóa học mới | Quản trị viên
- F.5.3 | Sửa danh mục | TB | Cập nhật tên/mô tả danh mục | Quản trị viên
- F.5.4 | Xóa danh mục | Thấp | Chặn xóa nếu còn khóa học thuộc danh mục (BR.06) | Quản trị viên

**Module 6 — Luyện thi TOEIC** (liên quan FR.10, mở rộng UC4/UC6)
- F.6.1 | Xem thư viện đề thi TOEIC | Cao | Danh sách đề kèm số part, số câu, điểm cao nhất đã đạt | Học viên
- F.6.2 | Xem chi tiết đề thi | Cao | Thông tin từng part, số câu, các dạng bài có trong đề | Học viên
- F.6.3 | Luyện tập theo part | Cao | Chọn một/nhiều part, tự chọn giới hạn thời gian | Học viên
- F.6.4 | Làm full test | Cao | Làm trọn đề trong 120 phút, mô phỏng thi thật | Học viên
- F.6.5 | Nộp bài & quy đổi điểm | Cao | Chấm tự động, quy đổi thang 990 (chỉ với full test) | Học viên
- F.6.6 | Xem phân tích kết quả | Cao | Tỉ lệ đúng theo từng part và theo dạng bài (tag) | Học viên
- F.6.7 | Xem lịch sử làm bài | TB | Danh sách các lượt đã làm kèm điểm quy đổi | Học viên
- F.6.8 | Nghe audio phần Listening | Cao | Phát audio cho Part 1-4 khi làm bài | Học viên
- F.6.9 | Tạo đề TOEIC & câu hỏi theo part | Cao | Giảng viên soạn đề theo cấu trúc 7 part | Giảng viên

**Module 7 — Từ vựng & Flashcards** (liên quan FR.09 = UC9)
- F.7.1 | Xem danh sách list từ vựng | Cao | Kèm số từ đã nhớ / đang học / cần ôn | Học viên
- F.7.2 | Xem chi tiết list từ | Cao | Danh sách từ kèm phiên âm, nghĩa, ví dụ, trạng thái ghi nhớ | Học viên
- F.7.3 | Luyện bằng Flashcards | Cao | Lật thẻ, tự đánh giá đã nhớ hay chưa | Học viên
- F.7.4 | Luyện bằng Trắc nghiệm từ vựng | Cao | Chọn nghĩa đúng trong 4 lựa chọn | Học viên
- F.7.5 | Luyện bằng Tìm cặp | TB | Ghép từ với nghĩa tương ứng | Học viên
- F.7.6 | Luyện bằng Điền từ | TB | Xem nghĩa và gõ lại từ tiếng Anh, có gợi ý | Học viên
- F.7.7 | Ôn tập từ đến hạn | Cao | Hệ thống chọn ra các từ tới lịch ôn theo spaced repetition | Học viên

**Module 8 — Nghe chép chính tả** (liên quan FR.11 = UC10)
- F.8.1 | Xem danh sách bài chép chính tả | Cao | Kèm cấp độ, part liên quan, số câu đã đạt và độ chính xác trung bình | Học viên
- F.8.2 | Nghe từng câu | Cao | Phát audio từng câu, chỉnh tốc độ 0.75x/1x/1.25x, phím tắt Ctrl để nghe lại | Học viên
- F.8.3 | Gõ lại và chấm câu | Cao | Server so khớp từng từ, trả về độ chính xác và từ đúng/sai/thiếu/thừa | Học viên
- F.8.4 | Hiện đáp án | TB | Xem nội dung câu gốc và bản dịch khi không nghe được | Học viên
- F.8.5 | Theo dõi tiến độ bài chép | TB | Lưu độ chính xác tốt nhất của từng câu, đánh dấu hoàn thành bài | Học viên

## 7. Business Rule (BR) — dùng cho tài liệu 2.4

- BR.01 | Module Khóa học | Học viên chỉ đăng ký được khóa học có `isPublished = true`.
- BR.02 | Module Khóa học | Một học viên chỉ đăng ký một khóa học đúng một lần (ràng buộc unique student+course trên collection Enrollment).
- BR.03 | Module Bài kiểm tra | Học viên phải có Enrollment với khóa học thì mới được bắt đầu làm bài kiểm tra thuộc khóa học đó.
- BR.04 | Module Bài kiểm tra | Câu hỏi trắc nghiệm (MCQ) phải có tối thiểu 2 lựa chọn và đúng 1 lựa chọn được đánh dấu đúng.
- BR.05 | Module Bài kiểm tra | Nếu Quiz có `timeLimitMinutes`, học viên không được nộp bài sau khi quá thời gian tính từ lúc bắt đầu (`startedAt + timeLimitMinutes`).
- BR.06 | Module Danh mục | Không thể xóa danh mục nếu vẫn còn khóa học thuộc danh mục đó.
- BR.07 | Module Khóa học/Bài kiểm tra | Chỉ giảng viên sở hữu (`instructor` = user hiện tại) mới được sửa/xóa khóa học, bài giảng, bài kiểm tra của khóa học đó.
- BR.08 | Module Bài kiểm tra | Điểm bài kiểm tra = (tổng điểm đạt được / tổng điểm tối đa của đề) × 100, làm tròn 2 chữ số thập phân.
- BR.09 | Module Thông báo | Khi giảng viên thêm bài giảng mới hoặc tạo bài kiểm tra có hạn nộp, toàn bộ học viên đã đăng ký khóa học tự động nhận Notification (Observer pattern).
- BR.10 | Module Luyện thi TOEIC | Chỉ chế độ **làm full test** mới được quy đổi sang thang điểm 990; chế độ luyện từng part chỉ báo tỉ lệ đúng.
- BR.11 | Module Luyện thi TOEIC | Với đề rút gọn (dưới 200 câu), điểm quy đổi được tính bằng cách nội suy tỉ lệ câu đúng của từng kỹ năng về thang 100 rồi tra bảng, và phải được ghi rõ là **điểm ước lượng**.
- BR.12 | Module Luyện thi TOEIC | Câu hỏi Part 2 có đúng 3 lựa chọn (A–C); các part còn lại có 4 lựa chọn (A–D).
- BR.13 | Module Luyện thi TOEIC | Mỗi câu trong đề TOEIC có giá trị 1 điểm như nhau; trả lời sai hoặc bỏ trống đều được 0 điểm, không trừ điểm.
- BR.14 | Module Từ vựng | Một từ chỉ được tính là "Đã nhớ" sau khi học viên nhớ đúng **4 lần liên tiếp**; trước đó từ ở trạng thái "Đang học".
- BR.15 | Module Từ vựng | Khi học viên trả lời sai/không nhớ một từ, chuỗi nhớ liên tiếp (streak) được đặt lại về 0 và từ đó phải ôn lại ngay trong phiên hiện tại.
- BR.16 | Module Từ vựng | Khoảng cách ôn tập giãn dần theo số lần nhớ liên tiếp: 1 → 2 → 4 → 8 → 16 → 30 ngày.
- BR.17 | Module Chép chính tả | Khi chấm, không phân biệt chữ hoa/thường, bỏ qua dấu câu và dấu nháy (vì "I'm" và "im" phát âm như nhau — đây là bài nghe, không phải bài chính tả viết).
- BR.18 | Module Chép chính tả | Độ chính xác = (số từ đúng − 0,5 × số từ gõ thừa) / tổng số từ của câu gốc × 100, không âm. Gõ thừa bị trừ để tránh gõ bừa nhiều từ cho khớp.
- BR.19 | Module Chép chính tả | Một câu được coi là đạt khi độ chính xác tốt nhất ≥ 80%; bài chép được đánh dấu hoàn thành khi mọi câu đều đạt.
- BR.20 | Module Luyện thi TOEIC | Với Part 1 và Part 2, nội dung các phương án chỉ được đọc trong audio và KHÔNG hiển thị khi làm bài (đúng như đề thi thật); nội dung chỉ hiện ra khi xem lại kết quả.
- BR.21 | Module Luyện thi TOEIC | Ảnh dùng trong đề (Part 1) phải có giấy phép mở (CC BY, CC BY-SA hoặc public domain) và luôn hiển thị ghi nguồn tác giả kèm theo ảnh.

## 8. Chuẩn ID dùng xuyên suốt

- Use Case: `UC1`–`UC8`
- Functional Requirement: `FR.01`–`FR.08`
- Function: `F.<module>.<số thứ tự>` (vd `F.3.7`)
- Business Rule: `BR.01`–`BR.09`
- Test Requirement: `T.R.<số>` (theo function được test)
- Test Case: `T.C.<function>.<số>` (vd `T.C.F1.1.01`)

## 9. Nguồn tham khảo kỹ thuật (đã có sẵn, dùng để viết tài liệu Architecture/Database)

- Domain model / ERD: xem các file Mongoose schema trong `backend/src/models/*.js` — **19 collection**:
  - Gốc (12): User, Category, Course, Lecture, Enrollment, LectureProgress, Notification, Quiz, Question, Choice, QuizAttempt, Answer
  - Mở rộng TOEIC (1): QuestionGroup — ngữ liệu dùng chung cho nhóm câu hỏi (audio Part 3/4, đoạn văn Part 6/7)
  - Mở rộng Từ vựng (3): VocabSet, VocabWord, VocabProgress
  - Mở rộng Chép chính tả (3): DictationLesson (bài chép), DictationSegment (từng câu + audio), DictationProgress (kết quả từng câu của học viên — lưu dạng mảng subdocument `segments[]`)
- Trường mới so với bản gốc:
  - `Quiz.examType` (QUIZ | TOEIC_TEST)
  - `Question`: part, group, imageUrl, imageCredit, audioUrl, tags[], explanation
  - `QuizAttempt`: mode (FULL | PART), selectedParts[], timeLimitMinutes, listeningCorrect, readingCorrect, listeningScore, readingScore, totalScore
- Hằng số nghiệp vụ TOEIC: `backend/src/domain/toeic.js` (cấu trúc 7 part, bảng quy đổi điểm, xếp loại trình độ)
- Thuật toán ôn tập giãn cách: `backend/src/domain/spacedRepetition.js`
- Thuật toán chấm chép chính tả: `backend/src/domain/dictation.js` — so khớp mức từ bằng dãy con chung dài nhất (LCS), ghép các từ thiếu/thừa trong cùng một khoảng lệch thành cặp "gõ sai"; có 7 unit test ở `backend/src/domain/dictation.test.js` (chạy `npm test`, dùng `node:test` có sẵn của Node)
- Ảnh Part 1: 4 ảnh từ Wikimedia Commons (CC BY 2.0 / CC BY 4.0), thông tin ghi nguồn ở `backend/public/images/part1/credits.json`, tải bằng `tools/fetch_part1_images.py`; phục vụ tĩnh tại `/images/*`
- 4 design pattern (đã mở rộng cho TOEIC):
  - **Factory Method** — `backend/src/patterns/factory/questionFactory.js`: 7 creator (MCQ, TF, Part1Photo, Part2Response, GroupedTalk cho Part 3/4, Part5Grammar, GroupedPassage cho Part 6/7)
  - **Strategy** — tách 2 tầng: `strategy/gradingStrategy.js` (chấm từng câu: SingleChoice, Toeic) và `strategy/scoringStrategy.js` (tổng kết bài: Percent, ToeicFullTest quy đổi 990, ToeicPartPractice chỉ tính độ chính xác)
  - **Template Method** — `patterns/templateMethod/quizAttemptService.js`: khung `submit()` cố định với 3 biến thể StandardQuiz / ToeicFullTest / ToeicPartPractice, khác nhau ở hook `validateCanSubmit()`, `collectQuestions()`, `scoringStrategy()`
  - **Observer** — `backend/src/patterns/observer/courseSubject.js` (không đổi)
- Audio phần nghe: sinh bằng text-to-speech từ kịch bản nhóm tự viết (`backend/src/seeds/listeningScripts.js`, script `tools/generate_audio.py`), phục vụ tĩnh tại `/audio/*.mp3`
- Kiến trúc layer: `backend/src/routes` → `backend/src/controllers` → `backend/src/patterns` (service layer) → `backend/src/models` → MongoDB; frontend `frontend/src/pages` → `frontend/src/api/client.js` → backend REST API
- Đặc tả use case chi tiết (bản nháp cũ, vẫn đúng nội dung): `docs/_phan-tich-so-bo/01-dac-ta-usecase.md`
