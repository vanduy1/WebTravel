/*
 * Nội dung mặc định của hai trang Giới thiệu và Liên hệ.
 *
 * Đây là nội dung MẪU — thay bằng thông tin thật của bạn. Có hai cách:
 *   1. Đăng nhập rồi sửa ngay trên web (bản sửa lưu trong localStorage của máy đó).
 *   2. Sửa thẳng file này rồi push lại, để ai mở web lần đầu cũng thấy nội dung mới.
 */
var DEFAULT_PAGES = {
  about: {
    title: 'Về THTravel',
    intro: 'THTravel là đơn vị tổ chức tour trong nước và nước ngoài, tập trung vào ' +
      'các hành trình trọn gói: vé máy bay, lưu trú, đưa đón và hướng dẫn viên. ' +
      'Mỗi hành trình đều được khảo sát trước khi đưa vào khai thác.',
    features: [
      {
        title: 'Giá trọn gói, không phát sinh',
        text: 'Báo giá đã gồm vé, phòng và các bữa ăn theo chương trình.'
      },
      {
        title: 'Khách sạn đã kiểm định',
        text: 'Chỉ hợp tác với khách sạn từ 3 sao trở lên, có hợp đồng dài hạn.'
      },
      {
        title: 'Hỗ trợ suốt hành trình',
        text: 'Đường dây nóng trực trong toàn bộ thời gian đoàn đi.'
      }
    ]
  },

  contact: {
    title: 'Liên hệ đặt tour',
    intro: 'Gọi trực tiếp hoặc gửi email, chúng tôi phản hồi trong giờ làm việc.',
    phone: '0900 000 000',
    email: 'lienhe@THtravel.vn',
    address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
    hours: 'Thứ 2 – Thứ 7, 08:00 – 17:30'
  }
}
