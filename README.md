# TripNest - Hệ Thống Quản Lý Đặt Phòng Du Lịch

Dự án bao gồm 2 phần riêng biệt: **Frontend** (React + Vite) và **Backend** (Laravel Framework).

---

## Cấu trúc thư mục

```text
TripNest/
├── frontend/    # Giao diện người dùng (React + Vite)
└── backend/     # API & Quản lý logic dữ liệu (Laravel)
```

---

## Hướng dẫn cài đặt & khởi chạy

### 1. Frontend (React)

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Ứng dụng Frontend sẽ chạy mặc định tại: `http://localhost:5173`

---

### 2. Backend (Laravel)

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies (nếu chưa cài)
composer install

# Khởi chạy server API
php artisan serve
```

API Backend sẽ chạy mặc định tại: `http://127.0.0.1:8000`
