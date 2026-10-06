# Quản lý Tiền quỹ Lớp học — Bản v10 (Next.js + Vercel + PWA)

Bản nâng cấp lớn từ v1: chuyển sang **Next.js 14 App Router** chạy được hoàn toàn trên **Vercel** (không cần tách server), giao diện **responsive điện thoại + máy tính**, **PWA cài được trên điện thoại**, **dark mode**, upload ảnh lên **Vercel Blob**.

## Mới trong v10 (so với v1)

- ✅ Deploy 1 click lên Vercel (API = serverless functions, không cần host riêng)
- ✅ Responsive: sidebar trên desktop, drawer + **bottom navigation** trên mobile
- ✅ **PWA**: cài app vào màn hình điện thoại, mở như app native
- ✅ **Dark mode** (theo hệ điều hành + toggle thủ công)
- ✅ Auth bằng **httpOnly cookie** (an toàn hơn localStorage)
- ✅ Middleware bảo vệ route + phân quyền ngay ở tầng edge
- ✅ Upload ảnh hóa đơn/chứng từ lên **Vercel Blob** (fallback base64 khi dev)
- ✅ Toast notification, skeleton loading, form validate đầy đủ

## Tech Stack

- **Next.js 14** (App Router) + **React 18** + **Tailwind CSS** + **Recharts**
- **MongoDB** (MongoDB Atlas miễn phí) + **Mongoose** (cached connection cho serverless)
- **Vercel Blob** (lưu ảnh) + **Vercel Serverless Functions** (API)
- **JWT** trong httpOnly cookie + **PWA** (manifest + service worker)

## Chạy local

```bash
npm install
cp .env.example .env   # sửa MONGODB_URI (dùng MongoDB Atlas hoặc local)
npm run dev            # http://localhost:3000
```

Tạo dữ liệu mẫu (cần Node >= 20.6):
```bash
node --env-file=.env lib/seed.js
```

## Deploy lên Vercel (5 bước)

### Bước 1: Tạo MongoDB Atlas (miễn phí)
1. Vào https://mongodb.com/atlas → tạo cluster FREE (M0).
2. Tạo database user (username + password).
3. **Network Access** → thêm IP `0.0.0.0/0` (cho phép Vercel kết nối).
4. Copy **connection string** dạng `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/class_fund?retryWrites=true&w=majority`.

### Bước 2: Đẩy code lên GitHub
```bash
git init && git add . && git commit -m "v10"
git remote add origin <repo-cua-ban> && git push -u origin main
```

### Bước 3: Import project vào Vercel
1. Vào https://vercel.com → **Add New → Project** → import repo GitHub.
2. Framework tự nhận là **Next.js**.
3. Mục **Environment Variables** thêm 3 biến:
   - `MONGODB_URI` = connection string từ bước 1
   - `JWT_SECRET` = một chuỗi ngẫu nhiên dài (VD: `openssl rand -hex 32`)
   - `NEXT_PUBLIC_SITE_URL` = URL Vercel sau khi deploy (có thể thêm sau)

### Bước 4: Bật Vercel Blob (lưu ảnh hóa đơn)
1. Trong project Vercel → tab **Storage** → **Create Database → Blob**.
2. Connect vào project. Biến `BLOB_READ_WRITE_TOKEN` sẽ tự động được thêm.
3. Redeploy lại là xong.

> Nếu chưa bật Blob, ảnh vẫn lưu tạm dạng base64 (chỉ phù hợp dev). Production **bắt buộc** bật Blob.

### Bước 5: Seed dữ liệu (tùy chọn)
Sau khi deploy, chạy local với `MONGODB_URI` trỏ tới Atlas:
```bash
node --env-file=.env lib/seed.js
```

## Cài app lên điện thoại (PWA)

- **Android (Chrome)**: mở web → menu ⋮ → **"Add to Home screen" / Cài đặt ứng dụng**.
- **iOS (Safari)**: mở web → nút Share → **"Add to Home Screen"**.
- Sau khi cài, mở như app native (full màn hình, không có thanh địa chỉ).

## Tài khoản mẫu (sau khi seed)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin (Thủ quỹ) | thuquy@class.edu | admin123 |
| Member | sv100@class.edu → sv104@class.edu | 123456 |

## Cấu trúc thư mục

```
app/
├── layout.jsx              # Root layout + PWA metadata
├── page.jsx                # Redirect → /dashboard
├── login/                  # Đăng nhập
├── dashboard/              # Tổng quan (biểu đồ)
├── campaigns/[id]/         # Đợt thu + QR + duyệt
├── expense/new/            # Ghi khoản chi (bắt buộc ảnh)
├── ledger/                 # Sổ quỹ công khai (public)
├── members/                # Quản lý thành viên (admin)
├── reports/                # Xuất Excel/PDF (admin)
└── api/                    # 16 API routes serverless
components/                 # AppShell (responsive), Providers, PWARegister
lib/                        # mongodb, models, auth, upload, qr, format, seed
public/                     # manifest.json, sw.js, icon.svg
middleware.js               # Bảo vệ route + phân quyền ở edge
vercel.json                 # Cấu hình Vercel
```

## API chính

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| POST | /api/auth/login | public | Đăng nhập (set httpOnly cookie) |
| GET | /api/transactions | public | Sổ quỹ công khai |
| GET | /api/transactions/summary | login | Dashboard |
| POST | /api/transactions/expense | admin | Ghi chi (bắt buộc ảnh, chặn vượt số dư) |
| POST | /api/campaigns | admin | Tạo đợt thu |
| POST | /api/contributions/:id/pay | member | Nộp tiền + ảnh chứng từ |
| PATCH | /api/contributions/:id/approve | admin | Duyệt → tự tạo giao dịch thu |
| GET | /api/reports/export?format=excel\|pdf | admin | Xuất báo cáo |
