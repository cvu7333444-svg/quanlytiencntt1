# Danh sách bug đã fix (class-fund-v10)

## 🔴 Lỗi nghiêm trọng (không chạy được)

### 1. `middleware.js` dùng `jsonwebtoken` trên Edge Runtime → build/runtime crash
- **Nguyên nhân**: Middleware Next.js chạy trên Edge Runtime, KHÔNG có module `crypto` của Node.js mà thư viện `jsonwebtoken` yêu cầu. Build sẽ báo lỗi kiểu `A Node.js API is used (crypto) which is not supported in the Edge Runtime`, hoặc nếu qua được thì mọi route bảo vệ đều lỗi 500 → không vào được trang nào sau đăng nhập.
- **Fix**: Thay bằng `jose` (jwtVerify), tương thích Edge. Thêm `jose` vào `package.json`. Middleware đổi thành `async`.
- **File**: `middleware.js`, `package.json`

### 2. `.env` thiếu `JWT_SECRET` → mọi đăng nhập đều bị đá về `/login`
- **Nguyên nhân**: File `.env` chỉ có `MONGODB_URI`. `jwt.verify(token, undefined)` luôn throw → middleware redirect về `/login` dù cookie hợp lệ. Trên Vercel nếu quên set env var cũng vậy.
- **Fix**: Thêm `JWT_SECRET` (đã sinh chuỗi 32 byte hex), `JWT_EXPIRES=7d`, `BLOB_READ_WRITE_TOKEN=`, `NEXT_PUBLIC_SITE_URL`.
- **File**: `.env`

### 3. Thiếu file PWA trong `public/` → không cài được lên điện thoại
- **Nguyên nhân**: README nói có PWA nhưng không có `manifest.json`, `sw.js`, icon → Chrome/Safari không hiện nút "Add to Home screen".
- **Fix**: Tạo `public/manifest.json`, `public/sw.js` (an toàn, không cache API/HTML), `public/icon.svg` + `icon-192.png` + `icon-512.png` (đủ điều kiện cài app).
- **Lưu ý**: Phải link manifest + đăng ký service worker trong `app/layout.jsx` (đã thêm mẫu vào file này).

## 🟡 Lỗi trung bình (deploy/UI lỗi)

### 4. `vercel.json` `maxDuration: 30` → deploy fail trên gói Hobby (free)
- **Nguyên nhân**: Vercel Hobby giới hạn serverless tối đa 10s. Đặt 30 sẽ bị từ chối lúc deploy.
- **Fix**: Đổi thành `10`. (Nếu dùng gói Pro có thể tăng lại.)

### 5. `tailwind.config.js` thiếu các sắc thái `brand-300/400/800/900`
- **Nguyên nhân**: Nếu code dùng `bg-brand-300`, `text-brand-800`… class không sinh ra → màu sai/trống.
- **Fix**: Bổ sung đủ thang màu brand 50→900.

### 6. `jsconfig.json` thiếu `baseUrl`
- **Fix**: Thêm `"baseUrl": "."` để alias `@/*` hoạt động ổn định.

### 7. `package.json` script `seed` không load `.env`
- **Fix**: Đổi thành `node --env-file=.env lib/seed.js` (Node ≥20.6).

### 8. `.gitignore` quá ít
- **Fix**: Bổ sung `.env.local`, `.vercel`, `out`, `dist`, `*.log`, `.DS_Store`.

### 9. `middleware` matcher không loại trừ file tĩnh PNG → icon PWA bị redirect `/login`
- **Nguyên nhân**: Matcher cũ chỉ bỏ qua `icon.svg`, nhưng `icon-192.png`/`icon-512.png` (bắt buộc để cài app) vẫn chạy qua middleware → không có cookie → redirect 307 về `/login` → ảnh không load được → Chrome không đủ điều kiện hiện nút cài PWA.
- **Fix**: Matcher loại trừ luôn `/api` và mọi đuôi file tĩnh (svg/png/jpg/.../font).

## ⚪ Khuyến nghị
- **Bảo mật**: `.env` đang chứa mật khẩu MongoDB thật — tuyệt đối không commit, và nên đổi mật khẩu cluster vì đã được upload.
- Trên Vercel phải khai báo đủ 3 biến: `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL` (và `BLOB_READ_WRITE_TOKEN` nếu bật Blob).
- `app/layout.jsx` cần có `metadata.manifest = "/manifest.json"` và component client đăng ký `navigator.serviceWorker.register('/sw.js')`.
