# TripNest - Hệ Thống Quản Lý Đặt Phòng Du Lịch

TripNest là nền tảng hỗ trợ tìm kiếm, đặt phòng nghỉ dưỡng du lịch và quản trị hệ thống. Dự án bao gồm 2 phân hệ chính:
- **Frontend**: Giao diện người dùng & Trang quản trị Admin (React + Vite).
- **Backend**: API RESTful và quản lý cơ sở dữ liệu (Laravel Framework).

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
TripNest/
├── frontend/          # Giao diện người dùng & Admin (React + Vite)
│   ├── src/
│   │   ├── components/ # Component giao diện, modals, admin
│   │   ├── services/   # Gọi API backend & mock data
│   │   └── data/       # Dữ liệu tĩnh
│   └── package.json
│
└── backend/           # API RESTful & Cơ sở dữ liệu (Laravel)
    ├── app/           # Controllers, Models, Middleware
    ├── config/        # Cấu hình CORS, database,...
    ├── database/      # Migrations & Seeders
    ├── routes/        # Định nghĩa các Route API (api.php)
    └── composer.json
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Frontend (React + Vite)
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```
- **Giao diện Client**: `http://localhost:5173`
- **Giao diện Admin**: `http://localhost:5173/admin`

---

### 2. Backend (Laravel API)
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies (nếu chưa cài)
composer install

# Cấu hình môi trường (nếu chưa có file .env)
cp .env.example .env
php artisan key:generate

# Chạy migration dữ liệu
php artisan migrate

# Khởi chạy server API
php artisan serve
```
- **API Backend**: `http://127.0.0.1:8000`

---

## 👥 Quy Tắc Làm Việc Nhóm & Phân Quyền Code (Team Collaboration Rules)

Nhằm đảm bảo dự án phát triển mượt mà, **tránh xung đột (conflict) và tuyệt đối không ghi đè / làm hỏng code của nhau**, tất cả thành viên trong nhóm phải tuân thủ nghiêm ngặt các nguyên tắc sau:

### 1. 🚫 Nguyên Tắc Bất Di Bất Dịch Về Code (Code Isolation)
- **Tôn trọng phạm vi phân công (Module Ownership)**: Mỗi thành viên chỉ làm việc trong module/tính năng được giao. Tuyệt đối **KHÔNG** tự ý chỉnh sửa, xóa, hoặc refactor file thuộc module của người khác khi chưa thảo luận và có sự đồng thuận.
- **Tích hợp thông qua Interface / API Contract**:
  - Frontend và Backend thống nhất cấu trúc dữ liệu JSON (Request/Response) trước khi code.
  - Sử dụng Mock Data hoặc API Service riêng biệt, không chỉnh sửa trực tiếp vào logic đang chạy của thành viên khác.
- **Không tự ý sửa file cấu hình dùng chung**: Các file như `routes/api.php`, `App.jsx`, `package.json`, `.env.example`, `config/*` cần được trao đổi trong nhóm trước khi bổ sung route hoặc thư viện mới.

---

### 2. 🌿 Quy Trình Làm Việc Với Git (Git Workflow)

```text
               (Tạo nhánh mới)
[main] ────────────────────────────► [feature/user-management-minh]
  │                                               │
  │                                               ▼ (Code & Commit)
  │                                  [Commit: feat: add user CRUD]
  │                                               │
  │ (Pull Request & Code Review)                  │
[main] ◄──────────────────────────────────────────┘
```

#### Bước 1: Luôn cập nhật mã nguồn mới nhất trước khi làm việc
```bash
git checkout main
git pull origin main
```

#### Bước 2: Tạo nhánh riêng theo tính năng & tên thành viên
> ⚠️ **TUYỆT ĐỐI KHÔNG commit hoặc push trực tiếp lên nhánh `main`.**

Quy tắc đặt tên nhánh:
- Tính năng mới: `feature/<ten-tinh-nang>-<ten-thanh-vien>`
  - *Ví dụ: `feature/user-management-minh`, `feature/booking-flow-nam`*
- Sửa lỗi: `fix/<ten-loi>-<ten-thanh-vien>`
  - *Ví dụ: `fix/cors-api-minh`, `fix/login-modal-hung`*

```bash
# Tạo và chuyển sang nhánh mới
git checkout -b feature/user-management-minh
```

#### Bước 3: Commit code rõ ràng theo chuẩn Conventional Commits
- Commit thường xuyên theo từng đơn vị công việc nhỏ (atomic commit), kèm thông điệp rõ nghĩa:
  - `feat: ...` : Thêm tính năng mới
  - `fix: ...` : Sửa lỗi
  - `refactor: ...` : Tối ưu / tái cấu trúc mã nguồn (không đổi logic)
  - `style: ...` : Chỉnh sửa giao diện, CSS, format code
  - `docs: ...` : Cập nhật tài liệu, README

```bash
git add .
git commit -m "feat: implement user creation API and form validation"
```

#### Bước 4: Đẩy nhánh lên Remote & Tạo Pull Request (PR)
```bash
git push -u origin feature/user-management-minh
```
- Tạo **Pull Request (PR)** trên GitHub/GitLab vào nhánh `main`.
- Gắn tag thành viên khác hoặc trưởng nhóm để **Review Code**.
- Chỉ merge vào `main` khi:
  - Đã pass kiểm tra (build không lỗi, test pass).
  - Được ít nhất 1 thành viên khác review xác nhận không ảnh hưởng đến module của họ.

---

### 3. 🛠️ Quy Tắc Xử Lý Khi Có Xung Đột (Conflict Resolution)
1. **Không tự ý force push (`git push --force`)** lên các nhánh dùng chung (`main`, `develop`).
2. Nếu nhánh làm việc bị chậm so với `main`, thực hiện rebase/merge từ `main` về nhánh của mình để xử lý conflict tại máy local trước:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/user-management-minh
   git merge main
   # Xử lý các đoạn code conflict trong IDE nếu có, sau đó test lại
   git add .
   git commit -m "chore: merge latest main and resolve conflicts"
   git push origin feature/user-management-minh
   ```
3. **Khi gặp conflict ở file của người khác**: Phải liên hệ trực tiếp với người phụ trách file đó để cùng giải quyết, không tự ý chọn *Accept Current* hoặc *Accept Incoming* làm mất code của đồng đội.
