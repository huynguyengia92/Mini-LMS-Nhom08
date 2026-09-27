/**
 * Kịch bản phần nghe TOEIC — nhóm tự biên soạn, dùng để sinh file audio bằng
 * text-to-speech (tools/generate_audio.py). Không dùng lại audio của bất kỳ
 * nhà xuất bản hay nền tảng luyện thi nào.
 *
 * Bài thi thật dùng 4 giọng Mỹ / Anh / Canada / Úc nên các giọng bên dưới cũng
 * được phân bổ tương tự để học viên quen với nhiều chất giọng.
 */

// ---------------------------------------------------------------- Part 1: Mô tả tranh
// Ảnh lấy từ Wikimedia Commons (giấy phép mở, xem backend/public/images/part1/credits.json).
// Câu mô tả được viết SAU KHI xem từng ảnh để đáp án đúng khớp nội dung ảnh thật.
const part1Items = [
  {
    key: 'part1-01',
    tags: ['Tranh tả người'],
    explanation:
      'Người phụ nữ đang cầm thẻ và gõ laptop. (B) sai vì cô ấy đã ĐEO kính sẵn ("is wearing"), không phải đang đeo vào ("is putting on") — bẫy rất hay gặp. (D) có bánh donut trong tranh nhưng cô ấy không ăn.',
    statements: [
      { letter: 'A', text: "She's holding a card while using a laptop.", isCorrect: true },
      { letter: 'B', text: "She's putting on her glasses.", isCorrect: false },
      { letter: 'C', text: "She's closing the laptop.", isCorrect: false },
      { letter: 'D', text: "She's eating a donut.", isCorrect: false },
    ],
  },
  {
    key: 'part1-02',
    tags: ['Tranh tả người'],
    explanation:
      'Mọi người đang ngồi quanh bàn họp. Không có bảng trắng, laptop vẫn đang mở trên bàn và người phụ nữ đang ngồi chứ không đứng cạnh cửa.',
    statements: [
      { letter: 'A', text: 'A man is writing on a whiteboard.', isCorrect: false },
      { letter: 'B', text: 'Some people are seated around a table.', isCorrect: true },
      { letter: 'C', text: 'Laptops are being packed into bags.', isCorrect: false },
      { letter: 'D', text: 'A woman is standing by the door.', isCorrect: false },
    ],
  },
  {
    key: 'part1-03',
    tags: ['Tranh tả vật'],
    explanation:
      'Tranh không có người nên các câu "is being + V3" (đang được làm bởi ai đó) hoặc có người làm hành động đều sai. "Have been lined up" mô tả trạng thái — xe đẩy đã được xếp thành hàng.',
    statements: [
      { letter: 'A', text: 'Boxes are being loaded onto a truck.', isCorrect: false },
      { letter: 'B', text: 'A worker is pushing a cart.', isCorrect: false },
      { letter: 'C', text: 'Some carts have been lined up in an aisle.', isCorrect: true },
      { letter: 'D', text: 'The shelves are empty.', isCorrect: false },
    ],
  },
  {
    key: 'part1-04',
    tags: ['Tranh tả vật'],
    explanation:
      'Đèn chùm đang treo trên trần. Ghế đã được đặt sẵn quanh bàn chứ không "đang được sắp xếp" (không có người), quầy lễ tân không có ai và rèm cửa vẫn còn.',
    statements: [
      { letter: 'A', text: 'Some chairs are being arranged around a table.', isCorrect: false },
      { letter: 'B', text: 'A receptionist is greeting a guest.', isCorrect: false },
      { letter: 'C', text: 'Curtains have been removed from the windows.', isCorrect: false },
      { letter: 'D', text: 'A light fixture is hanging from the ceiling.', isCorrect: true },
    ],
  },
];

// Mỗi câu Part 1: đọc "Number X. Look at the picture." rồi 4 câu mô tả A–D bằng một giọng.
const PART1_VOICES = ['en-US-GuyNeural', 'en-GB-SoniaNeural', 'en-AU-NatashaNeural', 'en-CA-LiamNeural'];
part1Items.forEach((item, i) => {
  const voice = PART1_VOICES[i % PART1_VOICES.length];
  item.lines = [
    { voice, text: `Number ${i + 1}. Look at the picture marked number ${i + 1} in your test book.` },
    ...item.statements.map((s) => ({ voice, text: `${s.letter}. ${s.text}` })),
  ];
});

// ---------------------------------------------------------------- Part 2: Hỏi & đáp
const part2Items = [
  {
    key: 'part2-01',
    // Lời thoại đọc lên: câu hỏi + 3 phương án trả lời
    lines: [
      { voice: 'en-US-GuyNeural', text: 'Where did you put the quarterly sales report?' },
      { voice: 'en-GB-SoniaNeural', text: 'A. It was a very good quarter.' },
      { voice: 'en-GB-SoniaNeural', text: 'B. On the shelf behind your desk.' },
      { voice: 'en-GB-SoniaNeural', text: 'C. Yes, I reported it yesterday.' },
    ],
    question: 'Where did you put the quarterly sales report?',
    tags: ['Câu hỏi WHERE'],
    explanation: 'Câu hỏi WHERE cần câu trả lời chỉ vị trí — "On the shelf behind your desk".',
    choices: [
      { text: 'It was a very good quarter.', isCorrect: false },
      { text: 'On the shelf behind your desk.', isCorrect: true },
      { text: 'Yes, I reported it yesterday.', isCorrect: false },
    ],
  },
  {
    key: 'part2-02',
    lines: [
      { voice: 'en-AU-NatashaNeural', text: 'Would you like me to book a taxi for the airport?' },
      { voice: 'en-US-GuyNeural', text: 'A. That would be great, thanks.' },
      { voice: 'en-US-GuyNeural', text: 'B. The flight was delayed.' },
      { voice: 'en-US-GuyNeural', text: 'C. He booked it last week.' },
    ],
    question: 'Would you like me to book a taxi for the airport?',
    tags: ['Câu yêu cầu, đề nghị'],
    explanation: 'Lời đề nghị "Would you like me to..." thường được đáp lại bằng lời chấp nhận hoặc từ chối.',
    choices: [
      { text: 'That would be great, thanks.', isCorrect: true },
      { text: 'The flight was delayed.', isCorrect: false },
      { text: 'He booked it last week.', isCorrect: false },
    ],
  },
  {
    key: 'part2-03',
    lines: [
      { voice: 'en-CA-LiamNeural', text: 'Why was the product launch moved to June?' },
      { voice: 'en-US-AriaNeural', text: 'A. In the main showroom.' },
      { voice: 'en-US-AriaNeural', text: 'B. About two thousand units.' },
      { voice: 'en-US-AriaNeural', text: 'C. Because the packaging was not ready.' },
    ],
    question: 'Why was the product launch moved to June?',
    tags: ['Câu hỏi WHY'],
    explanation: 'Câu hỏi WHY cần lý do — đáp án C giải thích nguyên nhân bị dời lịch.',
    choices: [
      { text: 'In the main showroom.', isCorrect: false },
      { text: 'About two thousand units.', isCorrect: false },
      { text: 'Because the packaging was not ready.', isCorrect: true },
    ],
  },
];

// ---------------------------------------------------------------- Part 3: Hội thoại
const part3Conversation = {
  key: 'part3-01',
  lines: [
    {
      voice: 'en-US-AriaNeural',
      text: "Hi David, I'm calling about the budget meeting scheduled for Thursday morning. Our finance director has to fly to Singapore that day, so we need to move it.",
    },
    {
      voice: 'en-CA-LiamNeural',
      text: "That's not a problem. How about Friday at ten? The conference room on the fourth floor is free then.",
    },
    {
      voice: 'en-US-AriaNeural',
      text: 'Friday works for me, but could we make it eleven instead? I have a client call at ten.',
    },
    {
      voice: 'en-CA-LiamNeural',
      text: "Sure, eleven it is. I'll send out an updated invitation this afternoon.",
    },
  ],
};

// ---------------------------------------------------------------- Part 4: Bài nói ngắn
const part4Talk = {
  key: 'part4-01',
  title: 'Bài nói 1 — Thông báo trong siêu thị',
  lines: [
    {
      voice: 'en-GB-SoniaNeural',
      text: "Attention, shoppers. Thank you for visiting Greenfield Market this evening. Please note that our fresh bakery counter will close at eight o'clock tonight, one hour earlier than usual, so that our staff can prepare for tomorrow's grand reopening. All bread and pastries are now thirty percent off. In addition, members of our loyalty programme can collect double points on every purchase made this week. If you are not yet a member, you can sign up free of charge at the customer service desk near the main entrance. Thank you for shopping with us.",
    },
  ],
  passageText: `Attention, shoppers. Thank you for visiting Greenfield Market this evening. Please note that our fresh bakery counter will close at eight o'clock tonight, one hour earlier than usual, so that our staff can prepare for tomorrow's grand reopening. All bread and pastries are now thirty percent off.

In addition, members of our loyalty programme can collect double points on every purchase made this week. If you are not yet a member, you can sign up free of charge at the customer service desk near the main entrance. Thank you for shopping with us.`,
  questions: [
    {
      text: 'Where is the announcement most likely being made?',
      tags: ['Câu hỏi về địa điểm'],
      explanation: '"Shoppers", "bakery counter", "customer service desk" đều cho thấy đây là siêu thị.',
      choices: [
        { text: 'At a supermarket', isCorrect: true },
        { text: 'At a train station', isCorrect: false },
        { text: 'At a hotel', isCorrect: false },
        { text: 'At a library', isCorrect: false },
      ],
    },
    {
      text: 'Why will the bakery counter close early?',
      tags: ['Câu hỏi về chi tiết'],
      explanation: 'Đóng sớm một tiếng để nhân viên chuẩn bị cho lễ khai trương lại ngày mai.',
      choices: [
        { text: 'Because of a staff shortage', isCorrect: false },
        { text: 'To prepare for a reopening event', isCorrect: true },
        { text: 'Because the bread has sold out', isCorrect: false },
        { text: 'To carry out repairs', isCorrect: false },
      ],
    },
    {
      text: 'What can loyalty programme members do this week?',
      tags: ['Câu hỏi về chi tiết'],
      explanation: 'Thành viên được nhân đôi điểm thưởng cho mọi giao dịch trong tuần.',
      choices: [
        { text: 'Receive a free gift', isCorrect: false },
        { text: 'Earn double points', isCorrect: true },
        { text: 'Get free delivery', isCorrect: false },
        { text: 'Join a cooking class', isCorrect: false },
      ],
    },
  ],
};

module.exports = { part1Items, part2Items, part3Conversation, part4Talk };
