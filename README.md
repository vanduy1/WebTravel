# THTravel

Trang web tĩnh xem và quản lý bài viết tour du lịch, giao diện tối ưu cho điện thoại.
Chỉ dùng HTML + CSS + JavaScript thuần — không framework, không build, không database.

## Chức năng

1. **Danh sách bài viết** — card hiển thị ảnh bìa, hạng khách sạn, danh mục, tiêu đề, đánh giá sao, nơi khởi hành, phương tiện và giá.
2. **Thêm bài viết** — nút `+` ở thanh tiêu đề, tab `Thêm` ở đáy, hoặc mục trong menu trượt.
3. **Sửa bài viết** — bấm vào card hoặc nút `Xem chi tiết`. Trong màn sửa có thêm nút xoá.

Kèm theo: tìm kiếm theo từ khoá, lọc theo danh mục, sắp xếp theo giá, và hai trang tĩnh Giới thiệu / Liên hệ.

## Đăng nhập và phân quyền

| | Khách (chưa đăng nhập) | Quản trị (đã đăng nhập) |
|---|---|---|
| Xem danh sách, tìm kiếm, lọc, sắp xếp | ✔ | ✔ |
| Xem chi tiết hành trình | ✔ | ✔ |
| Xem Giới thiệu, Liên hệ | ✔ | ✔ |
| Thêm / sửa / xoá bài viết | ✖ | ✔ |
| Sửa nội dung Giới thiệu, Liên hệ | ✖ | ✔ |

## Đăng nhập và phân quyền\n\nĐăng nhập dùng Supabase Auth bằng email/mật khẩu. Người dùng có thể đăng ký tài khoản, nhưng tài khoản mới chưa có quyền quản trị. Chỉ người dùng có `user_id` trong bảng `public.admin_users` mới được thêm/sửa/xoá bài viết và nội dung trang. Mật khẩu không nằm trong mã nguồn.\n\nKhách bấm vào card sẽ mở **màn chi tiết chỉ đọc**. Quản trị thấy thêm nút `Sửa bài viết` ở màn đó, nút `+` trên thanh tiêu đề, tab `Thêm`, nhãn `QUẢN TRỊ` cạnh tên web, và nút bút chì ở hai trang Giới thiệu / Liên hệ. Vào thẳng `#/new`, `#/edit/...`, `#/about/edit`, `#/contact/edit` khi chưa đăng nhập thì bị đẩy về màn đăng nhập.

Phiên đăng nhập lưu ở `localStorage` khoá `wd_session`, nên đóng trình duyệt mở lại vẫn còn; bấm `Đăng xuất` trong menu trượt để thoát.

> ⚠️ **Đây không phải bảo mật.** Web không có server nên mật khẩu nằm ngay trong `js/auth.js` — ai xem source hoặc mở DevTools đều đọc được, và có thể tự bật quyền sửa bằng một dòng lệnh trong console. Nó chỉ để tách chế độ xem và chế độ quản trị cho người dùng bình thường. Muốn chặn thật thì phải kiểm tra ở phía server.

## Menu và điều hướng

| Thành phần | Vị trí | Nội dung |
|---|---|---|
| Tab bar | Cố định đáy màn hình | Trang chủ · Giới thiệu · Liên hệ, thêm `Thêm` khi đã đăng nhập, thêm `Đăng nhập` khi chưa |
| Menu trượt | Nút ☰ góc trái thanh tiêu đề | Các mục như trên, kèm tên tài khoản và nút Đăng xuất |
| Ô tìm kiếm | Trong thanh tiêu đề màn danh sách | Lọc ngay khi gõ, khớp tiêu đề và nơi khởi hành |
| Chip danh mục | Dưới thanh tiêu đề | Tất cả · Trong nước · Nước ngoài · Combo · Nghỉ dưỡng |
| Sắp xếp | Bên phải tiêu đề mục | Mới nhất · Giá thấp→cao · Giá cao→thấp |

Tab bar **tự ẩn ở màn thêm/sửa và màn đăng nhập** vì những màn đó đã có thanh nút dính đáy.

Các đường dẫn:

| Hash | Màn | Quyền |
|---|---|---|
| `#/` | Danh sách | Ai cũng xem được |
| `#/post/<id>` | Chi tiết hành trình (chỉ đọc) | Ai cũng xem được |
| `#/about`, `#/contact` | Giới thiệu, Liên hệ | Ai cũng xem được |
| `#/login` | Đăng nhập | Chỉ khi chưa đăng nhập |
| `#/new`, `#/edit/<id>` | Thêm / sửa bài viết | Cần đăng nhập |
| `#/about/edit`, `#/contact/edit` | Sửa nội dung trang | Cần đăng nhập |

Dùng hash nên nút Back của điện thoại chạy đúng và GitHub Pages không cần cấu hình gì thêm.

> **Cần sửa trước khi dùng thật:** nội dung hai trang Giới thiệu và Liên hệ mặc định nằm trong `js/pages.js` — số điện thoại `0900 000 000`, email `lienhe@THtravel.vn` và địa chỉ `123 Đường ABC` đều là chỗ giữ chỗ. Sửa được bằng hai cách: đăng nhập rồi sửa ngay trên web (chỉ lưu trên máy đó), hoặc sửa file `js/pages.js` rồi push lại (ai mở web cũng thấy).

## Cấu trúc

```
WEB_DULICH/
├── index.html      markup 7 màn + menu trượt + tab bar, ẩn/hiện bằng class
├── css/style.css   mobile-first, từ 680px trở lên xếp 2 cột
└── js/
    ├── seed.js     bài viết mẫu cho người mở web lần đầu
    ├── pages.js    nội dung mặc định của trang Giới thiệu / Liên hệ
    ├── auth.js     đăng nhập, đăng xuất, kiểm tra quyền (mức giao diện)
    ├── store.js    đọc/ghi localStorage + thu nhỏ & nén ảnh
    ├── ui.js       dựng card, chi tiết, trang tĩnh, đổ dữ liệu vào form
    └── app.js      điều hướng, phân quyền, menu, tìm kiếm/lọc/sắp xếp
```

Sáu file JS nạp bằng thẻ `<script>` thường, **không** dùng ES module — module sẽ bị chặn CORS khi mở bằng `file://`.

Các khoá trong `localStorage`: `wd_posts` (bài viết), `wd_page_about` / `wd_page_contact` (nội dung trang đã sửa), `wd_session` (phiên đăng nhập), `wd_seeded` (cờ đã đổ dữ liệu mẫu).

## Chạy ở máy

```bash
cd WEB_DULICH
python3 -m http.server 8080
```

Mở `http://localhost:8080`. Trên điện thoại cùng Wi-Fi thì thay `localhost` bằng IP của máy.

**Nên mở qua HTTP, đừng mở thẳng bằng `file://`** — Chrome coi `file://` là origin không xác định nên có thể chặn `localStorage`, khi đó bấm Lưu sẽ báo lỗi không lưu được.

## Đưa lên GitHub Pages

Thư mục này nên là một repo riêng, không nằm trong repo khác.

```bash
cp -r WEB_DULICH ~/TH-travel
cd ~/TH-travel
git init
git add .
git commit -m "THTravel: danh sách, thêm, sửa bài viết"
git branch -M main
git remote add origin https://github.com/<tài-khoản>/<tên-repo>.git
git push -u origin main
```

Trên GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
Khoảng 1 phút sau web chạy ở `https://<tài-khoản>.github.io/<tên-repo>/`.

Repo phải để **Public** thì Pages mới bật được với tài khoản miễn phí.

## Lưu dữ liệu\n\n- Bài viết và nội dung trang Giới thiệu/Liên hệ được lưu trong Supabase Postgres.\n- Ảnh được nén JPEG trong trình duyệt và lưu trong bucket `travel-images` của Supabase Storage.\n- Người xem có thể đọc nội dung công khai; thao tác ghi được bảo vệ bằng RLS và bảng `admin_users`.\n- `supabase-client.js` chỉ chứa Project URL và Publishable Key. Không đưa `service_role` hoặc secret key vào frontend.\n\n## Cấp quyền admin lần đầu\n\n1. Mở `#/login`, chọn **Chưa có tài khoản? Đăng ký**, tạo tài khoản bằng email thật và mật khẩu tối thiểu 8 ký tự.\n2. Xác nhận email nếu Supabase yêu cầu.\n3. Chủ project cấp quyền quản trị bằng cách thêm UUID tài khoản vào `public.admin_users`. Các tài khoản đăng ký khác không tự có quyền quản trị.\n