/*
 * Dữ liệu mẫu hiển thị cho người mở web lần đầu (localStorage của họ đang trống).
 * Sửa file này rồi push lại GitHub là đổi được nội dung mặc định.
 *
 * Ảnh ở đây là ảnh nền SVG tự vẽ, không phải ảnh thật — để repo nhẹ và chạy được
 * khi không có mạng. Muốn dùng ảnh thật thì thay `image` bằng chuỗi base64
 * (thêm bài viết trên web, mở DevTools > Application > Local Storage > wd_posts,
 * copy giá trị `image` dán vào đây) hoặc bằng URL ảnh trên internet.
 */
var SEED_POSTS = (function () {
  function cover (fromColor, toColor, label) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="' + fromColor + '"/>' +
          '<stop offset="1" stop-color="' + toColor + '"/>' +
        '</linearGradient></defs>' +
        '<rect width="800" height="520" fill="url(#g)"/>' +
        '<text x="400" y="290" text-anchor="middle" fill="#ffffff" fill-opacity="0.92" ' +
          'font-family="Helvetica, Arial, sans-serif" font-size="62" font-weight="700">' + label + '</text>' +
      '</svg>'
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  }

  return [
    {
      id: 'seed-sg',
      category: 'Nước ngoài',
      image: cover('#5b6b7f', '#28323d', 'SINGAPORE'),
      title: 'Singapore: Combo 3N2Đ VMB + Lưu trú khách sạn Hotel Chancellor',
      rating: 4,
      departure: 'TP. Hồ Chí Minh',
      transport: 'Máy bay',
      hotelClass: 'Khách sạn tương đương 3*',
      price: 9790000,
      updatedAt: 4
    },
    {
      id: 'seed-dn',
      category: 'Trong nước',
      image: cover('#1f8a9c', '#0d4a58', 'ĐÀ NẴNG'),
      title: 'Đà Nẵng - Hội An 4N3Đ: nghỉ resort ven biển, tắm Cù Lao Chàm',
      rating: 5,
      departure: 'Hà Nội',
      transport: 'Máy bay',
      hotelClass: 'Khách sạn 5*',
      price: 6250000,
      updatedAt: 3
    },
    {
      id: 'seed-dl',
      category: 'Trong nước',
      image: cover('#4e7a3f', '#24401d', 'ĐÀ LẠT'),
      title: 'Đà Lạt 3N2Đ: săn mây Cầu Đất, vườn hoa Vạn Thành',
      rating: 4,
      departure: 'TP. Hồ Chí Minh',
      transport: 'Ô tô',
      hotelClass: 'Khách sạn 3*',
      price: 2890000,
      updatedAt: 2
    },
    {
      id: 'seed-pq',
      category: 'Combo',
      image: cover('#d79a4a', '#8a5420', 'PHÚ QUỐC'),
      title: 'Phú Quốc 3N2Đ: VMB khứ hồi + tour 4 đảo, lặn ngắm san hô',
      rating: 5,
      departure: 'Hà Nội',
      transport: 'Máy bay',
      hotelClass: 'Khách sạn tương đương 4*',
      price: 5490000,
      updatedAt: 1
    }
  ]
})()
