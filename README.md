# TripNest - Nền Tảng Đặt Phòng Nghỉ Dưỡng & Quản Trị Du Lịch Trực Tuyến

Hệ thống bao gồm 2 phân hệ chính:
- **Frontend**: Ứng dụng khách hàng & Cổng quản trị Admin Portal cao cấp (React + Vite + Tabler Icons + Be Vietnam Pro).
- **Backend**: API RESTful, quản lý cơ sở dữ liệu và phân quyền nghiệp vụ (Laravel Framework).

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### 1. Frontend (React + Vite)
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```
- **Trang Khách Hàng (Client)**: `http://localhost:5173`
- **Cổng Quản Trị Admin (Admin Portal)**: `http://localhost:5173/admin`

### 2. Backend (Laravel API)
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies (nếu chưa cài)
composer install

# Chạy migration & nạp dữ liệu mẫu
php artisan migrate:fresh --seed

# Khởi chạy server API
php artisan serve
```
- **API Backend**: `http://127.0.0.1:8000`

---

## 👑 Cổng Quản Trị TripNest Admin Portal

Hệ thống Admin Portal được thiết kế theo phong cách **Modern Light SaaS** với hệ thống 10 phân hệ nghiệp vụ chuyên sâu, đồng bộ 100% về giao diện, hỗ trợ font chữ tiếng Việt `Be Vietnam Pro` và chống tràn vỡ layout.

### 🌐 Danh Sách 10 Trang Nghiệp Vụ Riêng Biệt

| STT | Phân Hệ Quản Trị | Đường Dẫn Trực Tiếp | Chức Năng Chính |
| :---: | :--- | :--- | :--- |
| **1** | **Bảng Điều Khiển (Dashboard)** | [`/admin/dashboard`](http://localhost:5173/admin/dashboard) | Tổng quan KPIs doanh thu GMV, hoa hồng 11%, tỷ lệ lấp phòng, hồ sơ KYC chờ duyệt và 5 đơn đặt mới nhất. |
| **2** | **Cơ Sở Lưu Trú (Accommodations)** | [`/admin/accommodations`](http://localhost:5173/admin/accommodations) | Quản lý danh sách khách sạn/villa, lọc theo tỉnh thành, phân trang, thêm/sửa thông tin, ghim Nổi Bật (Featured) / Yêu Thích. |
| **3** | **Sổ Cái Đặt Phòng (Bookings)** | [`/admin/bookings`](http://localhost:5173/admin/bookings) | Quản lý sổ cái đơn phòng, lọc mã booking/khách, xem chi tiết hóa đơn, phê duyệt đơn, xử lý hủy đơn và xuất hóa đơn. |
| **4** | **Thẩm Định Pháp Lý KYC (Hosts KYC)** | [`/admin/hosts_kyc`](http://localhost:5173/admin/hosts_kyc) | Thẩm định hồ sơ pháp lý của Chủ nhà: soi ảnh CCCD 2 mặt, xác minh tài khoản ngân hàng nhận tiền giải ngân, cấp huy hiệu Superhost. |
| **5** | **Quản Lý Người Dùng (Users)** | [`/admin/users`](http://localhost:5173/admin/users) | CRUD thành viên, phân quyền tài khoản (Guest / Host / Admin), lọc nhóm người dùng, khóa / mở khóa tài khoản, xem CCCD & địa chỉ. |
| **6** | **Duyệt Đơn Xin Làm Host (Role Requests)** | [`/admin/role_requests`](http://localhost:5173/admin/role_requests) | Cổng tiếp nhận và xét duyệt đơn xin nâng quyền từ Khách du lịch (`Guest`) lên Chủ nhà (`Host`) để mở khóa quyền đăng phòng. |
| **7** | **Tài Chính & Payouts (Financials)** | [`/admin/financials`](http://localhost:5173/admin/financials) | Quản lý GMV, giữ lại 11% phí sàn, quản lý sổ cái giải ngân Payouts định kỳ và xác nhận chuyển tiền cho Chủ nhà. |
| **8** | **Kiểm Duyệt Đánh Giá (Reviews)** | [`/admin/reviews`](http://localhost:5173/admin/reviews) | Kiểm duyệt nội dung nhận xét của khách, phân tích radar 6 tiêu chí (Sạch sẽ, Vị trí, Giá trị, Nhận phòng, Giao tiếp, Chính xác), ẩn/hiện bình luận vi phạm. |
| **9** | **Danh Mục & Tiện Nghi (Categories)** | [`/admin/categories`](http://localhost:5173/admin/categories) | Quản lý 14 danh mục loại hình lưu trú và hệ thống danh mục tiện nghi (Wifi, Hồ bơi, Bếp BBQ, v.v.). |
| **10** | **Tour & Trải Nghiệm (Experiences)** | [`/admin/experiences`](http://localhost:5173/admin/experiences) | Quản lý danh sách tour du lịch trải nghiệm địa phương, thời lượng tour, giá vé và bật/tắt trạng thái mở bán. |

---

## 🔄 Kiến Trúc Luồng Dữ Liệu API (Backend Laravel ➔ Frontend React)

Mô hình luồng hoạt động chuẩn của các tính năng API (ví dụ: Lấy danh sách người dùng `GET /api/admin/users`):

```text
[1. React Component]                [2. Service API]                 [3. Laravel Route]               [4. Controller]              [5. MySQL DB]
  AdminLayout.jsx    ──(fetch)──►   adminApi.js     ──(HTTP GET)──►    api.php         ──(invoke)──►   UserController.php  ──(SQL)──► accounts & users
  setUsers(data)     ◄──(render)──   parse JSON      ◄──(200 OK)────    JSON Response   ◄──(map data)──  Eloquent with()    ◄──(rows)── 2 Tables Joined
```

### 📋 1. Luồng Lấy Danh Sách Thành Viên (Index - `GET /api/admin/users`)

1. **Frontend Trigger**: Khi người dùng mở trang `/admin/users`, Hook `useEffect` trong `AdminLayout.jsx` được kích hoạt.
2. **Gửi Request**: `adminService.getUsers()` trong `adminApi.js` thực hiện gọi hàm `fetch('http://localhost:8000/api/admin/users')`.
3. **Định Tuyến Backend**: File `backend/routes/api.php` nhận request và chuyển tiếp cho `UserController@index`.
4. **Truy Vấn Eloquent**: `UserController.php` gọi `Account::with('user')->orderBy('id', 'desc')->get()` để truy vấn đồng thời 2 bảng `accounts` và `users` qua quan hệ 1-1.
5. **Định Dạng JSON**: Hàm `$accounts->map(...)` chuẩn hóa dữ liệu thành định dạng JSON chuẩn (kết hợp `email`, `role`, `status` với `full_name`, `phone`, `id_card`, `address`, `avatar`).
6. **Cập Nhật State React**: React nhận kết quả JSON `{ success: true, data: [...] }` và gọi `setUsers(data)`.
7. **Render Giao Diện**: `UsersPage.jsx` và `UserTable.jsx` nhận danh sách `users`, tự động phân trang và vẽ bảng dữ liệu hoàn chỉnh.

---

### 📋 2. Luồng Chỉnh Sửa Thông Tin Thành Viên (Update - `PUT /api/admin/user/{id}`)

```text
[1. Admin bấm icon "Sửa"] ──► Modal UserEditModal.jsx mở ra với dữ liệu cũ
             │
             ▼ (Admin chỉnh sửa họ tên, SĐT, CCCD, địa chỉ, quyền, mật khẩu mới)
[2. Bấm "Lưu Thay Đổi"]  ──► UserEditModal gọi onSave(formData)
             │
             ▼
[3. adminService.saveUser] ──► Gửi HTTP PUT http://localhost:8000/api/admin/user/{id} (JSON Body)
             │
             ▼
[4. Router: api.php]     ──► Gọi UserController::class, 'update'
             │
             ▼
[5. UserController.php]
     ├── Bước 5.1: Validate (Họ tên bắt buộc, Email hợp lệ & unique ngoại trừ user hiện tại, Password min 6)
     ├── Bước 5.2: DB::beginTransaction() đảm bảo an toàn giao dịch
     ├── Bước 5.3: Cập nhật bảng `accounts`: `email`, `role`, `status`, `password` (Hash::make nếu có nhập mới)
     ├── Bước 5.4: Cập nhật bảng `users`: `full_name`, `phone_number`, `id_card_number`, `address`, `avatar_url`
     └── Bước 5.5: DB::commit() và trả về JSON { success: true, message: '...', data: { ... } }
             │
             ▼
[6. React nhận kết quả]   ──► Cập nhật mảng state `users` ➔ Bảng tự động cập nhật ngay lập tức ➔ Đóng Modal
```

#### 📌 Bảng Ánh Xạ Dữ Liệu Form Sang 2 Bảng Cơ Sở Dữ Liệu MySQL:

| Trường Trên Giao Diện (Form Field) | Bảng Đích (Table) | Cột CSDL (Column) | Ghi Chú Xử Lý Backend |
| :--- | :--- | :--- | :--- |
| **Họ và tên** (`name`) | `users` | `full_name` | Lưu thông tin cá nhân |
| **Email đăng nhập** (`email`) | `accounts` | `email` | Unique trong bảng `accounts`, trừ ID hiện tại |
| **Mật khẩu mới** (`password`) | `accounts` | `password` | Mã hóa bằng `Hash::make()` nếu có nhập |
| **Số điện thoại** (`phone`) | `users` | `phone_number` | Tối đa 20 ký tự |
| **Số CCCD / Hộ chiếu** (`id_card_number`) | `users` | `id_card_number` | Dùng cho xác minh định danh KYC |
| **Địa chỉ thường trú** (`address`) | `users` | `address` | Tỉnh/thành phố, địa chỉ cư trú |
| **Vai trò tài khoản** (`role`) | `accounts` | `role` | `guest` (Khách), `host` (Chủ nhà), `admin` (Quản trị) |
| **Trạng thái tài khoản** (`status`) | `accounts` | `status` | `active` (Hoạt động), `banned` (Bị khóa) |
| **Ảnh đại diện** (`avatar`) | `users` | `avatar_url` | URL ảnh đại diện |

---

## 🔄 Phân Biệt Nghiệp Vụ Host: `/admin/role_requests` vs `/admin/hosts_kyc`

```text
[1. Khách Hàng (Guest)]
        │
        ▼ (Nộp đơn xin trở thành Chủ nhà)
[2. /admin/role_requests] ──► Admin duyệt ➔ Vai trò tài khoản đổi thành "Host"
        │
        ▼ (Host tải lên ảnh CCCD 2 mặt & STK Ngân hàng)
[3. /admin/hosts_kyc]     ──► Admin thẩm định pháp lý ➔ Mở khóa nhận tiền giải ngân Payouts
        │
        ▼
[4. Host Đăng Phòng & Kinh Doanh Hợp Pháp]
```

---

## 🏗️ Cấu Trúc Mã Nguồn Phân Hệ Admin (`frontend/src/components/admin/`)

```text
frontend/src/components/admin/
├── AdminLayout.jsx              # Master Layout điều phối URL router & đồng bộ trạng thái
├── AdminHeader.jsx              # Topbar tìm kiếm, chuông báo pending KYC, nút Reset Demo
├── AdminSidebar.jsx             # Sidebar điều hướng 10 trang, hỗ trợ thu gọn/mở rộng
├── admin.css                    # Hệ thống Design Tokens, Typography, Anti-Wrap CSS
│
├── pages/                       # 10 Trang nghiệp vụ độc lập
│   ├── DashboardPage.jsx
│   ├── AccommodationsPage.jsx
│   ├── BookingsPage.jsx
│   ├── HostsKycPage.jsx
│   ├── UsersPage.jsx
│   ├── RoleUpgradeRequestsPage.jsx
│   ├── FinancialsPage.jsx
│   ├── ReviewsPage.jsx
│   ├── CategoriesPage.jsx
│   └── ExperiencesPage.jsx
│
├── common/                      # Component con tái sử dụng
│   ├── AdminPageHeader.jsx      # Tiêu đề trang & nút hành động
│   ├── AdminSearchFilterBar.jsx # Thanh công cụ tìm kiếm & bộ lọc
│   ├── AdminTableWrapper.jsx    # Khung bọc bảng chống tràn & phân trang
│   ├── AdminStatusBadge.jsx     # Huy hiệu trạng thái dữ liệu
│   ├── AdminConfirmDialog.jsx   # Hộp thoại xác nhận thao tác (Xóa, Hủy, Khóa)
│   └── Pagination.jsx           # Phân trang dùng chung (Pagination)
│
├── users/                       # Component con phục vụ quản lý người dùng
│   ├── UserTable.jsx            # Bảng hiển thị danh sách người dùng
│   ├── UserFilterTabs.jsx       # Tab lọc nhóm vai trò người dùng
│   └── UserUpgradeCard.jsx      # Thẻ hồ sơ xét duyệt làm Host
│
└── modals/                      # Hệ thống cửa sổ tương tác (Modal Dialogs)
    ├── UserEditModal.jsx        # Thêm & sửa thông tin người dùng (kèm xem trước Avatar & Password)
    ├── KycDetailModal.jsx       # Soi ảnh CCCD 2 mặt & thẩm định chủ nhà
    ├── BookingDetailModal.jsx   # Chi tiết hóa đơn thanh toán đơn đặt phòng
    ├── AccommodationEditModal.jsx # Chỉnh sửa thông tin cơ sở lưu trú
    └── PayoutConfirmModal.jsx   # Xác nhận lệnh giải ngân tiền về ngân hàng
```

---

## 🎨 Quy Chuẩn Thiết Kế (Design System & Standards)
- **100% Light Mode**: Tông màu sáng thanh lịch, nền trắng `#ffffff` và canvas xám dịu `#f8fafc`.
- **Typography Tiếng Việt**: Chuẩn hóa toàn diện với bộ font **`Be Vietnam Pro`** kết hợp **`Outfit`** cho các con số tài chính & KPI.
- **Hệ Thống Bo Góc Tinh Tế (Refined Radii)**: Bo góc nhẹ `6px - 8px` tạo sự vuông vắn, hiện đại chuẩn SaaS quốc tế.
- **Phân Trang & Chống Tràn**: Toàn bộ các bảng dữ liệu đều được trang bị phân trang (`Pagination`) và quy tắc `white-space: nowrap` chống gãy dòng.
