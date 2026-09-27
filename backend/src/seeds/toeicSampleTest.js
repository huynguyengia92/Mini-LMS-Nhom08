/**
 * Bộ đề TOEIC mẫu — nội dung do nhóm tự biên soạn theo format công khai của bài thi
 * (không sao chép đề của ETS hay của bất kỳ nền tảng luyện thi nào).
 * Đây là "đề rút gọn" dùng để demo: 3 câu Listening (Part 3) + 20 câu Reading (Part 5/6/7).
 */

// ---------------------------------------------------------------- Part 3 (có group audio)
const part3Group = {
  part: 3,
  title: 'Hội thoại 1 — Đặt lại lịch họp',
  order: 1,
  audioUrl: '', // chưa có file nghe; giao diện sẽ hiển thị bản ghi bên dưới
  passageText: `W: Hi David, I'm calling about the budget meeting scheduled for Thursday morning.
Our finance director has to fly to Singapore that day, so we need to move it.

M: That's not a problem. How about Friday at ten? The conference room on the fourth floor is free then.

W: Friday works for me, but could we make it eleven instead? I have a client call at ten.

M: Sure, eleven it is. I'll send out an updated invitation this afternoon.`,
};

const part3Questions = [
  {
    text: 'What is the main reason for the phone call?',
    tags: ['Câu hỏi về chủ đề, mục đích'],
    explanation: 'Người phụ nữ mở đầu bằng việc thông báo cần dời cuộc họp ngân sách.',
    choices: [
      { text: 'To cancel a business trip', isCorrect: false },
      { text: 'To reschedule a meeting', isCorrect: true },
      { text: 'To book a conference room', isCorrect: false },
      { text: 'To introduce a new director', isCorrect: false },
    ],
  },
  {
    text: 'Why is the original date no longer suitable?',
    tags: ['Câu hỏi về chi tiết cuộc hội thoại'],
    explanation: 'Giám đốc tài chính phải bay sang Singapore đúng hôm đó.',
    choices: [
      { text: 'A room is unavailable', isCorrect: false },
      { text: 'A report is not ready', isCorrect: false },
      { text: 'An executive will be travelling', isCorrect: true },
      { text: 'A client cancelled a call', isCorrect: false },
    ],
  },
  {
    text: 'What will the man most likely do next?',
    tags: ['Câu hỏi về hành động tương lai'],
    explanation: 'Người đàn ông nói sẽ gửi lại thư mời trong buổi chiều.',
    choices: [
      { text: 'Send an updated invitation', isCorrect: true },
      { text: 'Call the finance director', isCorrect: false },
      { text: 'Reserve a flight', isCorrect: false },
      { text: 'Prepare a budget report', isCorrect: false },
    ],
  },
];

// ---------------------------------------------------------------- Part 5 (câu hỏi độc lập)
const part5Questions = [
  {
    text: 'All employees must submit their travel receipts ------- the end of the month.',
    tags: ['Grammar: Giới từ'],
    explanation: '"by + mốc thời gian" diễn tả hạn chót phải hoàn thành.',
    choices: [
      { text: 'by', isCorrect: true },
      { text: 'until', isCorrect: false },
      { text: 'within', isCorrect: false },
      { text: 'during', isCorrect: false },
    ],
  },
  {
    text: 'The marketing team worked ------- to launch the campaign before the holiday season.',
    tags: ['Grammar: Trạng từ'],
    explanation: 'Vị trí sau động từ "worked" cần một trạng từ.',
    choices: [
      { text: 'efficient', isCorrect: false },
      { text: 'efficiently', isCorrect: true },
      { text: 'efficiency', isCorrect: false },
      { text: 'more efficient', isCorrect: false },
    ],
  },
  {
    text: 'Ms. Tran, ------- joined the company last spring, has been promoted to branch manager.',
    tags: ['Grammar: Mệnh đề quan hệ'],
    explanation: 'Đại từ quan hệ chủ ngữ chỉ người trong mệnh đề không xác định là "who".',
    choices: [
      { text: 'which', isCorrect: false },
      { text: 'who', isCorrect: true },
      { text: 'whom', isCorrect: false },
      { text: 'whose', isCorrect: false },
    ],
  },
  {
    text: 'The new software allows managers to track expenses ------- than the previous system did.',
    tags: ['Grammar: So sánh'],
    explanation: 'Có "than" nên cần dạng so sánh hơn của trạng từ.',
    choices: [
      { text: 'accurate', isCorrect: false },
      { text: 'accurately', isCorrect: false },
      { text: 'more accurately', isCorrect: true },
      { text: 'most accurately', isCorrect: false },
    ],
  },
  {
    text: 'Please make sure that the attached invoice ------- to the accounting department today.',
    tags: ['Grammar: Thể bị động'],
    explanation: 'Hoá đơn được gửi đi nên dùng bị động "is forwarded".',
    choices: [
      { text: 'forwards', isCorrect: false },
      { text: 'is forwarded', isCorrect: true },
      { text: 'forwarding', isCorrect: false },
      { text: 'has forwarded', isCorrect: false },
    ],
  },
  {
    text: 'Due to the ------- demand for our summer collection, we have extended production by two weeks.',
    tags: ['Câu hỏi từ loại'],
    explanation: 'Chỗ trống bổ nghĩa cho danh từ "demand" nên cần tính từ.',
    choices: [
      { text: 'increase', isCorrect: false },
      { text: 'increased', isCorrect: true },
      { text: 'increasingly', isCorrect: false },
      { text: 'increases', isCorrect: false },
    ],
  },
  {
    text: 'The technician will inspect the machine ------- it is installed in the workshop.',
    tags: ['Grammar: Liên từ'],
    explanation: '"after" nối hai mệnh đề theo trình tự thời gian.',
    choices: [
      { text: 'after', isCorrect: true },
      { text: 'despite', isCorrect: false },
      { text: 'in order to', isCorrect: false },
      { text: 'because of', isCorrect: false },
    ],
  },
  {
    text: 'Participants are asked to register online; ------- , they may sign up at the front desk.',
    tags: ['Grammar: Trạng từ liên kết'],
    explanation: '"alternatively" giới thiệu một phương án thay thế.',
    choices: [
      { text: 'therefore', isCorrect: false },
      { text: 'alternatively', isCorrect: true },
      { text: 'nevertheless', isCorrect: false },
      { text: 'similarly', isCorrect: false },
    ],
  },
  {
    text: 'The renovation of the lobby is expected to be ------- by the end of October.',
    tags: ['Câu hỏi từ vựng'],
    explanation: '"be completed" — hoàn tất công việc.',
    choices: [
      { text: 'completed', isCorrect: true },
      { text: 'approved', isCorrect: false },
      { text: 'informed', isCorrect: false },
      { text: 'attended', isCorrect: false },
    ],
  },
  {
    text: 'Neither the supervisor nor the assistants ------- available for the training session tomorrow.',
    tags: ['Grammar: Hòa hợp chủ vị'],
    explanation: 'Với "neither ... nor", động từ chia theo chủ ngữ gần nhất — "assistants" (số nhiều).',
    choices: [
      { text: 'is', isCorrect: false },
      { text: 'are', isCorrect: true },
      { text: 'was', isCorrect: false },
      { text: 'has been', isCorrect: false },
    ],
  },
];

// ---------------------------------------------------------------- Part 6 (điền vào đoạn văn)
const part6Group = {
  part: 6,
  title: 'Thông báo nội bộ — Bảo trì hệ thống',
  order: 1,
  passageText: `To: All staff
From: IT Department
Subject: Scheduled system maintenance

Our email and file-sharing systems will be unavailable this Saturday from 8:00 A.M. to 2:00 P.M.
while we upgrade the servers. During this period you will not be able to ---(1)--- your work files
remotely. We recommend that you download any documents you need ---(2)--- Friday evening.

The upgrade will make file transfers noticeably faster. ---(3)--- We appreciate your patience
and ---(4)--- for any inconvenience this may cause.`,
};

const part6Questions = [
  {
    text: '(1)',
    tags: ['Câu hỏi từ vựng'],
    explanation: '"access your work files" — truy cập tệp làm việc.',
    choices: [
      { text: 'access', isCorrect: true },
      { text: 'inform', isCorrect: false },
      { text: 'replace', isCorrect: false },
      { text: 'attach', isCorrect: false },
    ],
  },
  {
    text: '(2)',
    tags: ['Grammar: Giới từ'],
    explanation: '"before Friday evening" — trước tối thứ Sáu.',
    choices: [
      { text: 'before', isCorrect: true },
      { text: 'since', isCorrect: false },
      { text: 'among', isCorrect: false },
      { text: 'through', isCorrect: false },
    ],
  },
  {
    text: '(3)',
    tags: ['Câu hỏi điền câu vào đoạn văn'],
    explanation: 'Câu được chọn phải nối tiếp ý "hệ thống nhanh hơn sau nâng cấp".',
    choices: [
      { text: 'It will also increase the storage limit for each account.', isCorrect: true },
      { text: 'Please return your parking card to the security desk.', isCorrect: false },
      { text: 'The cafeteria will close early on weekends.', isCorrect: false },
      { text: 'New employees should complete the orientation form.', isCorrect: false },
    ],
  },
  {
    text: '(4)',
    tags: ['Câu hỏi từ loại'],
    explanation: 'Sau "and" cần danh từ song song với "patience": "apologize" → danh từ "apologies".',
    choices: [
      { text: 'apologize', isCorrect: false },
      { text: 'apologies', isCorrect: true },
      { text: 'apologetic', isCorrect: false },
      { text: 'apologizing', isCorrect: false },
    ],
  },
];

// ---------------------------------------------------------------- Part 7 (đọc hiểu)
const part7GroupA = {
  part: 7,
  title: 'Email — Xác nhận đơn hàng',
  order: 1,
  passageText: `From: orders@bluepeakoffice.com
To: h.nguyen@vietlinkco.vn
Date: 3 March
Subject: Order BP-48120 confirmed

Dear Ms. Nguyen,

Thank you for your order of 25 ergonomic desk chairs. The chairs are currently in our Da Nang
warehouse and will be dispatched on 6 March. Delivery to your Ho Chi Minh City office usually
takes three business days.

Because your order exceeds 20 units, we have applied a 12% bulk discount, which is reflected in
the attached invoice. Payment is due within 30 days of delivery.

If you would like our team to assemble the chairs on site, please reply to this email before
5 March. This service costs an additional 1,500,000 VND.

Best regards,
Tran Minh Khoa
Customer Service, Blue Peak Office Supplies`,
};

const part7QuestionsA = [
  {
    text: 'What is the purpose of the email?',
    tags: ['Câu hỏi về chủ đề, mục đích'],
    explanation: 'Tiêu đề và đoạn đầu đều xác nhận đơn hàng đã được tiếp nhận.',
    choices: [
      { text: 'To confirm an order', isCorrect: true },
      { text: 'To request a payment', isCorrect: false },
      { text: 'To apologize for a delay', isCorrect: false },
      { text: 'To advertise a new product', isCorrect: false },
    ],
  },
  {
    text: 'Why did Ms. Nguyen receive a discount?',
    tags: ['Câu hỏi về chi tiết'],
    explanation: 'Đơn hàng trên 20 sản phẩm được giảm 12%.',
    choices: [
      { text: 'She paid in advance', isCorrect: false },
      { text: 'She ordered more than 20 units', isCorrect: true },
      { text: 'She is a long-term customer', isCorrect: false },
      { text: 'She used a promotional code', isCorrect: false },
    ],
  },
  {
    text: 'What must Ms. Nguyen do by 5 March if she wants assembly service?',
    tags: ['Câu hỏi về hành động tương lai'],
    explanation: 'Email yêu cầu phản hồi trước ngày 5/3 để đăng ký dịch vụ lắp đặt.',
    choices: [
      { text: 'Visit the warehouse', isCorrect: false },
      { text: 'Pay the full invoice', isCorrect: false },
      { text: 'Reply to the email', isCorrect: true },
      { text: 'Sign a new contract', isCorrect: false },
    ],
  },
];

const part7GroupB = {
  part: 7,
  title: 'Thông báo — Hội chợ việc làm',
  order: 2,
  passageText: `RIVERSIDE CAREER FAIR
Saturday, 18 May · 9:00 A.M. – 4:00 P.M. · Riverside Convention Centre, Hall B

More than 60 employers from the technology, logistics and hospitality sectors will be recruiting
on site. Admission is free, but online registration is required because seating for the workshops
is limited.

Workshop schedule
  10:00 A.M.  Writing a CV that gets read
  1:00 P.M.   Interview skills for fresh graduates
  2:30 P.M.   Negotiating your first salary

Attendees are encouraged to bring at least ten printed copies of their CV. A free résumé review
desk will operate near the main entrance from 9:30 A.M. until noon.`,
};

const part7QuestionsB = [
  {
    text: 'What is required to attend the event?',
    tags: ['Câu hỏi về chi tiết'],
    explanation: 'Vào cửa miễn phí nhưng bắt buộc đăng ký trực tuyến.',
    choices: [
      { text: 'An admission fee', isCorrect: false },
      { text: 'Online registration', isCorrect: true },
      { text: 'A university diploma', isCorrect: false },
      { text: 'An employer invitation', isCorrect: false },
    ],
  },
  {
    text: 'At what time can attendees learn about salary negotiation?',
    tags: ['Câu hỏi kết hợp bảng biểu'],
    explanation: 'Lịch hội thảo ghi 2:30 chiều cho chủ đề đàm phán lương.',
    choices: [
      { text: '10:00 A.M.', isCorrect: false },
      { text: '1:00 P.M.', isCorrect: false },
      { text: '2:30 P.M.', isCorrect: true },
      { text: '4:00 P.M.', isCorrect: false },
    ],
  },
  {
    text: 'What is suggested about the résumé review desk?',
    tags: ['Câu hỏi suy luận'],
    explanation: 'Bàn này chỉ hoạt động từ 9:30 sáng tới trưa, tức không mở suốt sự kiện.',
    choices: [
      { text: 'It is available all day', isCorrect: false },
      { text: 'It requires an extra fee', isCorrect: false },
      { text: 'It closes before the event ends', isCorrect: true },
      { text: 'It is located in Hall A', isCorrect: false },
    ],
  },
];

module.exports = {
  part3Group,
  part3Questions,
  part5Questions,
  part6Group,
  part6Questions,
  part7GroupA,
  part7QuestionsA,
  part7GroupB,
  part7QuestionsB,
};
