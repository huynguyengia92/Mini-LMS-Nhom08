# Đặc tả Use Case — Mini-LMS

Actor: **Học viên (HV)**, **Giảng viên (GV)**, **Quản trị viên (QT)**

---

## UC1. Đăng ký / Đăng nhập
**Actor:** HV, GV, QT (khách chưa có tài khoản → HV/GV)
**Tiền điều kiện:** Không có
**Hậu điều kiện:** Người dùng có phiên đăng nhập hợp lệ, được điều hướng đến workspace theo vai trò.

**Luồng chính (Đăng ký):**
1. Người dùng chọn "Đăng ký", nhập username, email, họ tên, mật khẩu, chọn vai trò (Học viên/Giảng viên).
2. Hệ thống kiểm tra hợp lệ (username chưa tồn tại, mật khẩu đủ mạnh) và tạo tài khoản.
3. Hệ thống tự động đăng nhập và chuyển đến trang chủ.

**Luồng chính (Đăng nhập):**
1. Người dùng nhập username/mật khẩu.
2. Hệ thống xác thực, tạo phiên đăng nhập.
3. Hệ thống điều hướng: HV → Khóa học của tôi; GV → Quản lý khóa học; QT → Quản lý danh mục.

**Luồng ngoại lệ:** Sai thông tin đăng nhập → hiển thị lỗi, không tạo phiên. Username đã tồn tại khi đăng ký → báo lỗi, yêu cầu nhập lại.

---

## UC2. Tìm kiếm & đăng ký khóa học
**Actor:** Học viên
**Tiền điều kiện:** Đã đăng nhập với vai trò Học viên.
**Hậu điều kiện:** Tồn tại bản ghi `Enrollment` liên kết Học viên — Khóa học.

**Luồng chính:**
1. HV vào trang "Tìm khóa học", nhập từ khóa và/hoặc chọn danh mục.
2. Hệ thống lọc và hiển thị danh sách khóa học đã xuất bản phù hợp.
3. HV chọn xem chi tiết một khóa học.
4. HV bấm "Đăng ký khóa học".
5. Hệ thống tạo `Enrollment`, hiển thị xác nhận.

**Luồng rẽ nhánh:** Không tìm thấy khóa học phù hợp → hiển thị thông báo trống. Đã đăng ký trước đó → nút chuyển thành trạng thái "Đã đăng ký" (không tạo trùng, ràng buộc unique student+course).

---

## UC3. Xem bài giảng
**Actor:** Học viên (đã đăng ký khóa học)
**Tiền điều kiện:** HV đã đăng ký khóa học chứa bài giảng.
**Hậu điều kiện:** (tùy chọn) `LectureProgress.is_completed = True` cho bài giảng đó.

**Luồng chính:**
1. HV vào trang chi tiết khóa học, chọn một bài giảng trong danh sách.
2. Hệ thống hiển thị nội dung (video nhúng hoặc tài liệu tải xuống) kèm ghi chú.
3. HV bấm "Đánh dấu đã học xong".
4. Hệ thống cập nhật/ tạo `LectureProgress` cho HV — dữ liệu này nuôi UC7.

**Luồng ngoại lệ:** HV chưa đăng ký khóa học → không thấy nội dung chi tiết bài giảng (chỉ thấy tiêu đề, được nhắc đăng ký).

---

## UC4. Làm bài kiểm tra trắc nghiệm & xem điểm
**Actor:** Học viên (đã đăng ký khóa học)
**Tiền điều kiện:** Khóa học có ít nhất một `Quiz` với câu hỏi.
**Hậu điều kiện:** `QuizAttempt` được chấm điểm và lưu `score`.

**Luồng chính:**
1. HV chọn một bài kiểm tra trong khóa học đã đăng ký, bấm "Làm bài".
2. Hệ thống tạo (hoặc tiếp tục) một `QuizAttempt` chưa nộp, hiển thị danh sách câu hỏi.
3. HV chọn đáp án cho từng câu, bấm "Nộp bài".
4. Hệ thống (Template Method `QuizAttemptService.submit`) kiểm tra ràng buộc thời gian, sau đó với **mỗi câu hỏi** chọn `GradingStrategy` tương ứng loại câu hỏi để chấm, cộng dồn điểm.
5. Hệ thống lưu điểm, hiển thị trang kết quả kèm đáp án đúng/sai từng câu.

**Luồng ngoại lệ:** Hết thời gian làm bài (nếu `time_limit_minutes` được đặt) → từ chối nộp bài, báo lỗi "Đã hết thời gian làm bài".

---

## UC5. Tạo & quản lý khóa học (Giảng viên)
**Actor:** Giảng viên
**Tiền điều kiện:** Đã đăng nhập vai trò Giảng viên.
**Hậu điều kiện:** `Course`/`Lecture` được tạo/sửa/xóa; nếu thêm bài giảng mới, Observer thông báo cho học viên đã đăng ký.

**Luồng chính:**
1. GV vào "Quản lý khóa học", bấm "Tạo khóa học", nhập tiêu đề/mô tả/danh mục.
2. Hệ thống tạo `Course` gắn `instructor = GV hiện tại`.
3. GV vào trang quản lý nội dung khóa học, thêm bài giảng (loại Video/Tài liệu, nội dung, thứ tự).
4. Hệ thống tạo `Lecture`; sự kiện `NEW_LECTURE` được phát ra cho `CourseSubject`, mọi HV đã đăng ký nhận `Notification`.
5. GV có thể sửa/xóa khóa học hoặc bài giảng của chính mình.

**Ràng buộc quyền:** GV chỉ thao tác được trên khóa học mà mình là `instructor` (kiểm tra qua `CourseOwnerMixin`).

---

## UC6. Tạo đề kiểm tra (Giảng viên)
**Actor:** Giảng viên (chủ khóa học)
**Tiền điều kiện:** Đã tạo khóa học.
**Hậu điều kiện:** `Quiz` có tập `Question`/`Choice` sẵn sàng cho HV làm bài.

**Luồng chính:**
1. GV vào trang quản lý khóa học, bấm "Tạo bài kiểm tra", nhập tiêu đề, thời gian giới hạn (tùy chọn), hạn nộp (tùy chọn).
2. Hệ thống tạo `Quiz`; nếu có hạn nộp, Observer thông báo "hạn nộp bài" cho HV đã đăng ký.
3. GV chọn loại câu hỏi (Trắc nghiệm nhiều lựa chọn / Đúng-Sai), nhập nội dung, các lựa chọn, đáp án đúng, điểm.
4. Hệ thống gọi `QuestionFactory.create_question(...)` (Factory Method) — factory tương ứng loại câu hỏi tạo `Question` + các `Choice` phù hợp.
5. Lặp lại bước 3-4 cho đến khi đề đủ câu hỏi.

**Luồng ngoại lệ:** Thiếu lựa chọn đúng / chưa đủ 2 lựa chọn cho câu trắc nghiệm → validate lỗi, yêu cầu nhập lại.

---

## UC7. Theo dõi tiến độ học tập
**Actor:** Học viên
**Tiền điều kiện:** HV đã đăng ký ít nhất một khóa học.
**Hậu điều kiện:** Không thay đổi dữ liệu — chỉ đọc và tổng hợp.

**Luồng chính:**
1. HV vào trang "Tiến độ học tập".
2. Với mỗi khóa học đã đăng ký, hệ thống tính: % bài giảng đã hoàn thành (`LectureProgress`) và điểm cao nhất từng bài kiểm tra (`QuizAttempt`).
3. Hệ thống hiển thị thanh tiến độ (%) và bảng điểm theo từng khóa học.

**Quan hệ:** `extend` UC3 (mỗi lần đánh dấu hoàn thành bài giảng) và UC4 (mỗi lần nộp bài) — dữ liệu nguồn cho UC7.

---

## UC8. Quản lý danh mục khóa học (Quản trị)
**Actor:** Quản trị viên
**Tiền điều kiện:** Đã đăng nhập vai trò Quản trị viên.
**Hậu điều kiện:** `Category` được tạo/sửa/xóa.

**Luồng chính:**
1. QT vào "Quản lý danh mục", xem danh sách danh mục hiện có.
2. QT tạo danh mục mới (tên, mô tả) hoặc sửa/xóa danh mục đã có.
3. Hệ thống cập nhật `Category`; các khóa học thuộc danh mục bị xóa sẽ bị chặn xóa (ràng buộc `PROTECT`) để tránh mất liên kết dữ liệu.

**Luồng ngoại lệ:** Xóa danh mục đang có khóa học sử dụng → hệ thống từ chối (toàn vẹn dữ liệu tham chiếu).
