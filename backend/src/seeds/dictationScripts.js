/**
 * Bài nghe chép chính tả — nhóm tự biên soạn. Mỗi câu được sinh audio riêng bằng
 * text-to-speech (tools/generate_audio.py) để học viên nghe và gõ lại từng câu.
 *
 * Hai bài đầu lấy lại ngữ liệu Part 3 và Part 4 của đề mẫu, đúng phương pháp
 * "làm bài xong thì nghe chép lại chính bài vừa làm" để luyện bắt âm.
 */

const lessons = [
  {
    key: 'dict-office',
    title: 'Câu ngắn nơi công sở',
    description: 'Câu ngắn, tốc độ vừa phải — phù hợp để làm quen với việc nghe và gõ lại.',
    level: 'BEGINNER',
    part: null,
    segments: [
      { voice: 'en-US-AriaNeural', text: 'The meeting starts at nine.', translation: 'Cuộc họp bắt đầu lúc 9 giờ.' },
      { voice: 'en-US-GuyNeural', text: 'Please send me the report by Friday.', translation: 'Vui lòng gửi tôi bản báo cáo trước thứ Sáu.' },
      { voice: 'en-GB-SoniaNeural', text: 'The printer on the second floor is broken.', translation: 'Máy in ở tầng hai bị hỏng.' },
      { voice: 'en-AU-NatashaNeural', text: 'Could you book a table for four people?', translation: 'Bạn đặt giúp một bàn cho bốn người được không?' },
      { voice: 'en-CA-LiamNeural', text: 'Our office will be closed on Monday.', translation: 'Văn phòng chúng tôi sẽ nghỉ vào thứ Hai.' },
      { voice: 'en-US-AriaNeural', text: 'I left the documents on your desk.', translation: 'Tôi để tài liệu trên bàn của bạn rồi.' },
      { voice: 'en-US-GuyNeural', text: 'The new manager joined the team last week.', translation: 'Quản lý mới vào nhóm từ tuần trước.' },
      { voice: 'en-GB-SoniaNeural', text: 'Let me check my schedule and call you back.', translation: 'Để tôi xem lịch rồi gọi lại cho bạn.' },
    ],
  },
  {
    key: 'dict-meeting',
    title: 'Hội thoại: Đặt lại lịch họp',
    description: 'Chép lại đoạn hội thoại của Part 3 trong đề mẫu — luyện bắt từ nối và số giờ.',
    level: 'INTERMEDIATE',
    part: 3,
    segments: [
      { voice: 'en-US-AriaNeural', text: "Hi David, I'm calling about the budget meeting scheduled for Thursday morning.", translation: 'Chào David, tôi gọi về cuộc họp ngân sách dự kiến sáng thứ Năm.' },
      { voice: 'en-US-AriaNeural', text: 'Our finance director has to fly to Singapore that day, so we need to move it.', translation: 'Giám đốc tài chính phải bay sang Singapore hôm đó nên chúng ta cần dời lịch.' },
      { voice: 'en-CA-LiamNeural', text: "That's not a problem. How about Friday at ten?", translation: 'Không sao. Thứ Sáu lúc 10 giờ thì sao?' },
      { voice: 'en-CA-LiamNeural', text: 'The conference room on the fourth floor is free then.', translation: 'Lúc đó phòng họp tầng bốn đang trống.' },
      { voice: 'en-US-AriaNeural', text: 'Friday works for me, but could we make it eleven instead?', translation: 'Thứ Sáu thì được, nhưng mình đổi sang 11 giờ được không?' },
      { voice: 'en-US-AriaNeural', text: 'I have a client call at ten.', translation: 'Tôi có cuộc gọi với khách hàng lúc 10 giờ.' },
      { voice: 'en-CA-LiamNeural', text: "Sure, eleven it is. I'll send out an updated invitation this afternoon.", translation: 'Được, vậy 11 giờ nhé. Chiều nay tôi sẽ gửi thư mời cập nhật.' },
    ],
  },
  {
    key: 'dict-supermarket',
    title: 'Thông báo trong siêu thị',
    description: 'Chép lại bài nói Part 4 trong đề mẫu — câu dài hơn, luyện nghe số liệu và chi tiết.',
    level: 'INTERMEDIATE',
    part: 4,
    segments: [
      { voice: 'en-GB-SoniaNeural', text: 'Attention, shoppers. Thank you for visiting Greenfield Market this evening.', translation: 'Quý khách chú ý. Cảm ơn quý khách đã ghé Greenfield Market tối nay.' },
      { voice: 'en-GB-SoniaNeural', text: "Please note that our fresh bakery counter will close at eight o'clock tonight.", translation: 'Xin lưu ý quầy bánh tươi sẽ đóng cửa lúc 8 giờ tối nay.' },
      { voice: 'en-GB-SoniaNeural', text: "Our staff need to prepare for tomorrow's grand reopening.", translation: 'Nhân viên cần chuẩn bị cho lễ khai trương lại vào ngày mai.' },
      { voice: 'en-GB-SoniaNeural', text: 'All bread and pastries are now thirty percent off.', translation: 'Tất cả bánh mì và bánh ngọt hiện đang giảm 30%.' },
      { voice: 'en-GB-SoniaNeural', text: 'Members of our loyalty programme can collect double points this week.', translation: 'Thành viên chương trình khách hàng thân thiết được nhân đôi điểm trong tuần này.' },
      { voice: 'en-GB-SoniaNeural', text: 'You can sign up free of charge at the customer service desk.', translation: 'Quý khách có thể đăng ký miễn phí tại quầy chăm sóc khách hàng.' },
    ],
  },
];

module.exports = lessons;
