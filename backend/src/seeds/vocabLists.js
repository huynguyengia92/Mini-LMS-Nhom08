/**
 * Từ vựng TOEIC mẫu — nhóm tự biên soạn theo các chủ đề thường gặp trong bài thi.
 * Mỗi từ gồm phiên âm, từ loại, nghĩa và một câu ví dụ mang ngữ cảnh văn phòng/thương mại.
 */

const officeList = {
  title: 'List 1 — Văn phòng & Hành chính',
  topic: 'Office',
  description: 'Từ vựng xuất hiện nhiều ở Part 5, 6 và các đoạn email/thông báo của Part 7.',
  words: [
    {
      word: 'invoice', pronunciation: '/ˈɪn.vɔɪs/', wordType: 'n',
      meaning: 'hóa đơn (đòi tiền)',
      example: 'Please settle the invoice within 30 days of delivery.',
      exampleMeaning: 'Vui lòng thanh toán hóa đơn trong vòng 30 ngày kể từ khi giao hàng.',
    },
    {
      word: 'reimburse', pronunciation: '/ˌriː.ɪmˈbɜːs/', wordType: 'v',
      meaning: 'hoàn trả, bồi hoàn (chi phí)',
      example: 'The company will reimburse employees for travel expenses.',
      exampleMeaning: 'Công ty sẽ hoàn trả chi phí đi lại cho nhân viên.',
    },
    {
      word: 'deadline', pronunciation: '/ˈded.laɪn/', wordType: 'n',
      meaning: 'hạn chót',
      example: 'We missed the deadline because the supplier was late.',
      exampleMeaning: 'Chúng tôi trễ hạn vì nhà cung cấp giao muộn.',
    },
    {
      word: 'agenda', pronunciation: '/əˈdʒen.də/', wordType: 'n',
      meaning: 'chương trình nghị sự, nội dung cuộc họp',
      example: 'The agenda for Monday’s meeting is attached.',
      exampleMeaning: 'Nội dung cuộc họp thứ Hai được đính kèm.',
    },
    {
      word: 'postpone', pronunciation: '/pəʊstˈpəʊn/', wordType: 'v',
      meaning: 'hoãn lại',
      example: 'The training session was postponed until next week.',
      exampleMeaning: 'Buổi tập huấn được hoãn tới tuần sau.',
    },
    {
      word: 'colleague', pronunciation: '/ˈkɒl.iːɡ/', wordType: 'n',
      meaning: 'đồng nghiệp',
      example: 'Ask a colleague to cover your shift.',
      exampleMeaning: 'Hãy nhờ một đồng nghiệp trực ca thay bạn.',
    },
    {
      word: 'supervisor', pronunciation: '/ˈsuː.pə.vaɪ.zər/', wordType: 'n',
      meaning: 'người giám sát, quản lý trực tiếp',
      example: 'Submit the form to your supervisor for approval.',
      exampleMeaning: 'Nộp biểu mẫu cho quản lý của bạn để được phê duyệt.',
    },
    {
      word: 'attend', pronunciation: '/əˈtend/', wordType: 'v',
      meaning: 'tham dự',
      example: 'All department heads must attend the briefing.',
      exampleMeaning: 'Tất cả trưởng bộ phận phải tham dự buổi họp ngắn.',
    },
    {
      word: 'apply', pronunciation: '/əˈplaɪ/', wordType: 'v',
      meaning: 'nộp đơn; áp dụng',
      example: 'The discount applies to orders over 20 units.',
      exampleMeaning: 'Mức giảm giá áp dụng cho đơn từ 20 sản phẩm trở lên.',
    },
    {
      word: 'notify', pronunciation: '/ˈnəʊ.tɪ.faɪ/', wordType: 'v',
      meaning: 'thông báo cho ai',
      example: 'Please notify the front desk if you arrive after 6 P.M.',
      exampleMeaning: 'Vui lòng báo quầy lễ tân nếu bạn đến sau 6 giờ tối.',
    },
    {
      word: 'available', pronunciation: '/əˈveɪ.lə.bəl/', wordType: 'adj',
      meaning: 'có sẵn; rảnh',
      example: 'The conference room is available after lunch.',
      exampleMeaning: 'Phòng họp trống sau giờ trưa.',
    },
    {
      word: 'temporarily', pronunciation: '/ˈtem.pər.er.əl.i/', wordType: 'adv',
      meaning: 'tạm thời',
      example: 'The lobby entrance is temporarily closed for repairs.',
      exampleMeaning: 'Lối vào sảnh tạm đóng để sửa chữa.',
    },
  ],
};

const businessList = {
  title: 'List 2 — Kinh doanh & Đơn hàng',
  topic: 'Business',
  description: 'Từ vựng cho các đoạn hội thoại mua bán, giao hàng và chăm sóc khách hàng.',
  words: [
    {
      word: 'shipment', pronunciation: '/ˈʃɪp.mənt/', wordType: 'n',
      meaning: 'lô hàng, chuyến hàng',
      example: 'The shipment will arrive at the warehouse on Friday.',
      exampleMeaning: 'Lô hàng sẽ tới kho vào thứ Sáu.',
    },
    {
      word: 'warehouse', pronunciation: '/ˈweə.haʊs/', wordType: 'n',
      meaning: 'nhà kho',
      example: 'All returned items are stored in the warehouse.',
      exampleMeaning: 'Toàn bộ hàng trả lại được lưu trong kho.',
    },
    {
      word: 'discount', pronunciation: '/ˈdɪs.kaʊnt/', wordType: 'n',
      meaning: 'khoản giảm giá',
      example: 'Members receive a 15% discount on all services.',
      exampleMeaning: 'Thành viên được giảm 15% cho mọi dịch vụ.',
    },
    {
      word: 'refund', pronunciation: '/ˈriː.fʌnd/', wordType: 'n, v',
      meaning: 'tiền hoàn lại; hoàn tiền',
      example: 'Customers may request a refund within 14 days.',
      exampleMeaning: 'Khách hàng có thể yêu cầu hoàn tiền trong vòng 14 ngày.',
    },
    {
      word: 'warranty', pronunciation: '/ˈwɒr.ən.ti/', wordType: 'n',
      meaning: 'bảo hành',
      example: 'The laptop comes with a two-year warranty.',
      exampleMeaning: 'Máy tính xách tay đi kèm bảo hành hai năm.',
    },
    {
      word: 'negotiate', pronunciation: '/nəˈɡəʊ.ʃi.eɪt/', wordType: 'v',
      meaning: 'đàm phán, thương lượng',
      example: 'We are negotiating a new contract with the supplier.',
      exampleMeaning: 'Chúng tôi đang đàm phán hợp đồng mới với nhà cung cấp.',
    },
    {
      word: 'estimate', pronunciation: '/ˈes.tɪ.mət/', wordType: 'n, v',
      meaning: 'bản báo giá; ước tính',
      example: 'Could you send us a cost estimate by Thursday?',
      exampleMeaning: 'Bạn gửi cho chúng tôi bản ước tính chi phí trước thứ Năm được không?',
    },
    {
      word: 'inventory', pronunciation: '/ˈɪn.vən.tɔːr.i/', wordType: 'n',
      meaning: 'hàng tồn kho; bản kiểm kê',
      example: 'We take inventory at the end of every quarter.',
      exampleMeaning: 'Chúng tôi kiểm kê hàng vào cuối mỗi quý.',
    },
    {
      word: 'vendor', pronunciation: '/ˈven.dər/', wordType: 'n',
      meaning: 'nhà cung cấp, người bán',
      example: 'The vendor guaranteed delivery within five days.',
      exampleMeaning: 'Nhà cung cấp cam kết giao hàng trong năm ngày.',
    },
    {
      word: 'purchase', pronunciation: '/ˈpɜː.tʃəs/', wordType: 'n, v',
      meaning: 'việc mua; mua',
      example: 'Keep your receipt as proof of purchase.',
      exampleMeaning: 'Giữ hóa đơn để làm bằng chứng mua hàng.',
    },
    {
      word: 'defective', pronunciation: '/dɪˈfek.tɪv/', wordType: 'adj',
      meaning: 'bị lỗi, hỏng',
      example: 'Return any defective product to the service counter.',
      exampleMeaning: 'Mang sản phẩm bị lỗi tới quầy dịch vụ để đổi trả.',
    },
    {
      word: 'promptly', pronunciation: '/ˈprɒmpt.li/', wordType: 'adv',
      meaning: 'ngay lập tức, đúng giờ',
      example: 'Complaints are handled promptly by our support team.',
      exampleMeaning: 'Khiếu nại được đội hỗ trợ xử lý ngay.',
    },
  ],
};

module.exports = [officeList, businessList];
