# THTravel

Website chia sẻ hành trình và tour du lịch, giao diện mobile-first, triển khai trên Vercel.

## Chức năng

- Danh sách hành trình, tìm kiếm, lọc theo danh mục và sắp xếp theo giá.
- Trang chi tiết hành trình.
- Quản trị thêm, sửa, xoá hành trình.
- Quản trị chỉnh sửa nội dung Giới thiệu và Liên hệ.
- Đăng nhập bằng Supabase Auth (email/mật khẩu).
- Đồng bộ dữ liệu giữa các thiết bị bằng Supabase Postgres.
- Ảnh được nén tại trình duyệt và lưu trong Supabase Storage.

## Hạ tầng

- Frontend: HTML, CSS, JavaScript thuần.
- Hosting: Vercel.
- Database/Auth/Storage: Supabase.
- Supabase project: `kmzbqllnyrkolnpahpwt`.
- Storage bucket: `travel-images`.

## Phân quyền

Bảng `public.admin_users` là danh sách user được phép quản trị. Đăng ký tài khoản mới không tự cấp quyền admin. Việc thêm/sửa/xoá bài viết, sửa trang Giới thiệu/Liên hệ và upload ảnh đều được bảo vệ bằng Row Level Security (RLS).

### Cấp admin lần đầu

1. Mở website, vào **Đăng nhập quản trị** → **Chưa có tài khoản? Đăng ký**.
2. Đăng ký bằng email thật và mật khẩu tối thiểu 8 ký tự.
3. Xác nhận email nếu Supabase yêu cầu.
4. Chủ project thêm user vào `public.admin_users`. Sau đó người dùng đăng nhập bằng email và mật khẩu vừa tạo.

Ví dụ câu lệnh cấp quyền cho user đã đăng ký (thay UUID bằng Auth user ID thực tế):

```sql
insert into public.admin_users (user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;
```

## Cấu hình frontend

File `supabase-client.js` chỉ chứa Project URL và Publishable Key. Publishable Key được phép sử dụng trong trình duyệt khi RLS được cấu hình đúng.

**Không bao giờ đưa Supabase Secret Key hoặc service_role key vào GitHub/Vercel frontend.**

Thư viện Supabase JS được nạp từ jsDelivr, phiên bản được pin trong `index.html`.

## Cấu trúc mã nguồn

- `index.html`: toàn bộ markup và thứ tự nạp script.
- `style.css`: giao diện mobile-first.
- `supabase-client.js`: khởi tạo Supabase client.
- `auth.js`: đăng nhập, đăng ký, đăng xuất và kiểm tra admin.
- `store.js`: đọc/ghi bài viết, nội dung trang và upload ảnh.
- `pages.js`: dữ liệu mặc định của Giới thiệu/Liên hệ.
- `seed.js`: dữ liệu tour mẫu.
- `ui.js`: render giao diện và xử lý form.
- `app.js`: điều hướng, tìm kiếm, lọc, phân quyền giao diện.

## Chạy local

Có thể mở repo qua local HTTP server:

```bash
python3 -m http.server 8080
```

Sau đó truy cập `http://localhost:8080`.
