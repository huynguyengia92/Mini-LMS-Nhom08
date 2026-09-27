/**
 * Hai khóa chiến lược làm bài, bổ sung cho khóa "TOEIC LR — Lộ trình 500+".
 * Nội dung do nhóm tự biên soạn (không sao chép từ đề thi hay khóa học thương mại nào).
 */
module.exports = [
  {
    title: 'TOEIC Listening — Chiến lược Part 1-4',
    description:
      'Cách nghe từng dạng bài Listening: bẫy thường gặp ở Part 1, cách chọn phản hồi ở Part 2 '
      + 'và thứ tự thông tin ở Part 3-4.',
    category: {
      name: 'Luyện nghe TOEIC',
      description: 'Các khóa rèn kỹ năng nghe: chiến lược từng part, nghe chép chính tả.',
    },
    lectures: [
      {
        title: 'Part 1 — Nghe mô tả tranh và các bẫy thường gặp',
        contentType: 'DOCUMENT',
        textContent:
          'Trước khi audio phát, hãy quan sát tranh và tự đoán từ vựng sẽ nghe: ai đang làm gì, đồ vật nào nổi bật, '
          + 'bối cảnh trong nhà hay ngoài trời.\n\n'
          + 'Ba bẫy hay gặp:\n'
          + '1. Vật có trong tranh nhưng hành động không diễn ra — câu nhắc đúng đồ vật để đánh lừa.\n'
          + '2. Từ nghe gần giống nhau, ví dụ "walking" và "working".\n'
          + '3. Câu mô tả đúng một chi tiết nhỏ nhưng sai chủ thể của hành động.\n\n'
          + 'Cách làm: nghe hết cả 4 câu, loại dần; câu nào chưa chắc thì đánh dấu và giữ lựa chọn tốt nhất, '
          + 'không dừng lại phân vân vì audio chỉ phát một lần.',
      },
      {
        title: 'Part 2 — Chọn phản hồi phù hợp',
        contentType: 'DOCUMENT',
        textContent:
          'Vài từ đầu tiên quyết định hướng trả lời: câu hỏi bắt đầu bằng Who, Where, When, Why, How cần thông tin '
          + 'tương ứng, không trả lời Yes/No.\n\n'
          + 'Lưu ý:\n'
          + '- Đáp án lặp lại từ vừa nghe trong câu hỏi thường là bẫy.\n'
          + '- Câu trả lời gián tiếp ("Tôi cũng chưa rõ", "Để tôi kiểm tra lại") rất hay là đáp án đúng.\n'
          + '- Câu đề nghị hoặc yêu cầu cần phản hồi đồng ý/từ chối, không cần thông tin chi tiết.\n\n'
          + 'Part 2 không in đáp án trên đề, vì vậy hãy tập trung nghe và chọn ngay; nghĩ lâu sẽ lỡ câu kế tiếp.',
      },
      {
        title: 'Part 3 & 4 — Đọc trước câu hỏi, nghe theo thứ tự',
        contentType: 'DOCUMENT',
        textContent:
          'Mỗi đoạn hội thoại (Part 3) hoặc bài nói (Part 4) đi kèm 3 câu hỏi, và thông tin trong bài xuất hiện '
          + 'gần như đúng thứ tự các câu hỏi đó.\n\n'
          + 'Quy trình đề xuất:\n'
          + '1. Tranh thủ đọc trước 3 câu hỏi khi phần hướng dẫn đang phát.\n'
          + '2. Gạch chân từ khóa của từng câu hỏi (nghề nghiệp, địa điểm, thời gian, vấn đề).\n'
          + '3. Nghe và chọn dần theo thứ tự, không quay lại câu đã qua.\n\n'
          + 'Dạng câu hỏi khó nhất là câu hỏi về ý định người nói ("Người nói muốn nói gì khi nói ..."): cần nghe '
          + 'cả ngữ cảnh trước và sau câu đó, không dịch từng từ.',
      },
    ],
    quiz: {
      title: 'Kiểm tra chiến lược nghe Part 1-4',
      description: 'Bài trắc nghiệm ngắn kiểm tra lại chiến lược làm bài phần Listening.',
      questions: [
        {
          type: 'MCQ',
          text: 'Trước khi audio Part 1 phát, việc nên làm nhất là gì?',
          choices: [
            { text: 'Đọc trước 4 đáp án in trong đề', isCorrect: false },
            { text: 'Quan sát tranh và đoán trước từ vựng sẽ nghe', isCorrect: true },
            { text: 'Ghi sẵn đáp án B cho mọi câu chưa nghe', isCorrect: false },
          ],
        },
        {
          type: 'MCQ',
          text: 'Ở Part 2, phần nào của câu hỏi quyết định hướng trả lời?',
          choices: [
            { text: 'Từ cuối cùng của câu', isCorrect: false },
            { text: 'Giọng của người nói là nam hay nữ', isCorrect: false },
            { text: 'Vài từ đầu tiên, nhất là từ để hỏi', isCorrect: true },
          ],
        },
        {
          type: 'TF',
          text: 'Ở Part 3 và Part 4, thông tin trong bài nghe xuất hiện gần như đúng thứ tự của 3 câu hỏi.',
          correctAnswer: true,
        },
        {
          type: 'TF',
          text: 'Ở Part 2, câu trả lời gián tiếp kiểu "Để tôi kiểm tra lại" không bao giờ là đáp án đúng.',
          correctAnswer: false,
        },
      ],
    },
  },
  {
    title: 'TOEIC Reading — Ngữ pháp & Đọc hiểu Part 5-7',
    description:
      'Xử lý nhanh câu hỏi từ loại ở Part 5, điền câu vào đoạn văn ở Part 6 và cách phân bổ thời gian '
      + 'cho Part 7.',
    category: {
      name: 'Ngữ pháp & Đọc hiểu TOEIC',
      description: 'Các khóa về ngữ pháp trọng tâm, từ vựng và kỹ năng đọc hiểu TOEIC.',
    },
    lectures: [
      {
        title: 'Part 5 — Bẫy từ loại và cách xử lý nhanh',
        contentType: 'DOCUMENT',
        textContent:
          'Bước 1: Nhìn vào 4 đáp án. Nếu cùng gốc từ khác đuôi thì đây là câu hỏi từ loại.\n'
          + 'Bước 2: Xác định vị trí chỗ trống trong câu (chủ ngữ, tân ngữ, bổ nghĩa).\n'
          + 'Bước 3: Chọn từ loại phù hợp, không cần đọc hết nghĩa của câu.\n\n'
          + 'Dấu hiệu nhanh: sau mạo từ hoặc tính từ thường là danh từ; sau chủ ngữ là động từ; bổ nghĩa cho '
          + 'động từ là trạng từ. Mỗi câu Part 5 chỉ nên mất khoảng 20 giây.',
      },
      {
        title: 'Part 6 — Điền từ và điền câu vào đoạn văn',
        contentType: 'DOCUMENT',
        textContent:
          'Part 6 giống Part 5 nhưng chỗ trống nằm trong một đoạn văn, nên có câu phải đọc ngữ cảnh mới chọn được, '
          + 'đặc biệt là câu hỏi về thì của động từ và từ nối.\n\n'
          + 'Với câu hỏi điền cả một câu vào đoạn: đọc câu ngay trước và ngay sau chỗ trống, chọn câu nối được ý '
          + 'của hai câu đó. Chú ý các từ nối như "However", "Therefore", "In addition" — chúng cho biết quan hệ '
          + 'giữa các câu là tương phản, nguyên nhân hay bổ sung.',
      },
      {
        title: 'Part 7 — Phân bổ thời gian khi đọc hiểu',
        contentType: 'DOCUMENT',
        textContent:
          'Part 7 dài nhất nên phải giữ thời gian: hoàn thành Part 5 và Part 6 trong khoảng 25 phút để còn '
          + 'khoảng 50 phút cho Part 7.\n\n'
          + 'Cách làm một bài đọc:\n'
          + '1. Đọc lướt tiêu đề, dạng văn bản (email, thông báo, tin nhắn) và người gửi/người nhận.\n'
          + '2. Đọc câu hỏi trước để biết cần tìm thông tin gì.\n'
          + '3. Quay lại quét văn bản tìm đúng chỗ chứa thông tin, không đọc kỹ từng câu.\n\n'
          + 'Với bài nhiều văn bản, câu hỏi khó thường yêu cầu ghép thông tin từ hai văn bản khác nhau — hãy '
          + 'xác định rõ dữ kiện nào nằm ở văn bản nào trước khi chọn.',
      },
    ],
    quiz: {
      title: 'Kiểm tra ngữ pháp & chiến lược đọc',
      description: 'Bài trắc nghiệm ngắn về cách xử lý câu hỏi Part 5-7.',
      questions: [
        {
          type: 'MCQ',
          text: 'Bốn đáp án của một câu Part 5 là: inform, information, informative, informatively. '
            + 'Đây là dạng câu hỏi gì?',
          choices: [
            { text: 'Câu hỏi về thì của động từ', isCorrect: false },
            { text: 'Câu hỏi về từ vựng đồng nghĩa', isCorrect: false },
            { text: 'Câu hỏi từ loại', isCorrect: true },
          ],
        },
        {
          type: 'MCQ',
          text: 'Nên dành khoảng bao nhiêu phút cho Part 5 và Part 6 để còn đủ thời gian cho Part 7?',
          choices: [
            { text: 'Khoảng 50 phút', isCorrect: false },
            { text: 'Khoảng 25 phút', isCorrect: true },
            { text: 'Khoảng 70 phút', isCorrect: false },
          ],
        },
        {
          type: 'MCQ',
          text: 'Với câu hỏi điền cả một câu vào đoạn văn ở Part 6, nên dựa vào đâu để chọn?',
          choices: [
            { text: 'Câu ngay trước và ngay sau chỗ trống', isCorrect: true },
            { text: 'Câu đầu tiên của đoạn văn', isCorrect: false },
            { text: 'Độ dài của các đáp án', isCorrect: false },
          ],
        },
        {
          type: 'TF',
          text: 'Ở Part 7, nên đọc kỹ toàn bộ văn bản trước rồi mới đọc câu hỏi.',
          correctAnswer: false,
        },
      ],
    },
  },
];
