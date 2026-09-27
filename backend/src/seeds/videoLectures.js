/**
 * Bài giảng dạng video — nhúng từ YouTube.
 *
 * Đây là tư liệu tham khảo của các kênh bên ngoài, KHÔNG phải sản phẩm của nhóm:
 * hệ thống chỉ nhúng link công khai và ghi rõ nguồn ngay dưới trình phát, không tải
 * hay lưu lại nội dung video. Khoá `youtubeId` giữ nguyên để dễ đối chiếu với link gốc.
 */
const lessons = [
  {
    courseTitle: 'TOEIC LR — Lộ trình 500+',
    title: 'Lộ trình tự học TOEIC tại nhà theo từng trình độ',
    youtubeId: 'xxihW876AHc',
    source: 'Lộ trình tự học TOEIC tại nhà (chi tiết từng level) — kênh Mất Gốc',
    note:
      'Video giúp bạn xác định trình độ hiện tại và chọn lộ trình phù hợp trước khi bắt đầu khóa học.\n'
      + 'Xem xong, hãy làm đề TOEIC Practice Test 01 trong khóa này để biết điểm xuất phát của mình.',
  },
  {
    courseTitle: 'TOEIC LR — Lộ trình 500+',
    title: 'Kế hoạch học TOEIC từ mất gốc lên 800+',
    youtubeId: 'fwnapu0k7Aw',
    source: 'Lộ trình tự học TOEIC 2025 | 0-800+ — kênh Anh Lê TOEIC',
    note:
      'Tham khảo cách chia giai đoạn học và phân bổ thời gian cho từng kỹ năng.\n'
      + 'Mục tiêu của khóa này là 500+, nhưng cách lập kế hoạch trong video áp dụng được cho mọi mốc điểm.',
  },
  {
    courseTitle: 'TOEIC Listening — Chiến lược Part 1-4',
    title: 'Chiến thuật làm bài Part 1 — Mô tả tranh',
    youtubeId: 'iKyQzEsil3E',
    source: 'Chiến thuật làm bài thi TOEIC Part 1 — kênh Ms Hoa TOEIC Official',
    note:
      'Xem trước khi đọc bài giảng "Part 1 — Nghe mô tả tranh và các bẫy thường gặp" để đối chiếu.\n'
      + 'Chú ý phần phân tích bẫy động từ và bẫy từ nghe gần giống nhau.',
  },
  {
    courseTitle: 'TOEIC Listening — Chiến lược Part 1-4',
    title: 'Các dạng câu hỏi thường gặp ở Part 2',
    youtubeId: 'az0qiPzQhvg',
    source: 'TOEIC Listening Part 2 — các dạng câu hỏi thường gặp — kênh Ms Thắm Toeic',
    note:
      'Video hệ thống lại các dạng câu hỏi hay ra ở Part 2 và cách phản xạ với từng dạng.\n'
      + 'Luyện tiếp bằng bài nghe chép chính tả để quen tốc độ nói của người bản xứ.',
  },
  {
    courseTitle: 'TOEIC Reading — Ngữ pháp & Đọc hiểu Part 5-7',
    title: 'Tự học Reading cho mục tiêu 500 điểm',
    youtubeId: 'q_6oYvTkDJI',
    source: 'Tự học TOEIC Reading mục tiêu 500 — Unit 3 — kênh Ms Hoa TOEIC Official',
    note:
      'Bài giảng mẫu cho người mới bắt đầu phần Reading, bám theo dạng câu hỏi của Part 5.\n'
      + 'Xem xong hãy làm bài kiểm tra cuối khóa để kiểm tra lại.',
  },
];

module.exports = lessons.map((lesson) => ({
  courseTitle: lesson.courseTitle,
  title: lesson.title,
  contentType: 'VIDEO',
  videoUrl: `https://www.youtube.com/embed/${lesson.youtubeId}`,
  textContent: `${lesson.note}\n\nNguồn video: ${lesson.source} (YouTube). Video thuộc về tác giả gốc, `
    + 'Mini-LMS chỉ nhúng lại để phục vụ việc học.',
}));
