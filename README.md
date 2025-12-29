# 🎬 Ciname Galyxa - Hệ thống Đặt vé Xem phim Trực tuyến

**Ciname Galyxa** là một ứng dụng web full-stack hiện đại phục vụ việc quản lý và đặt vé xem phim. Dự án cung cấp trải nghiệm người dùng mượt mà từ việc chọn phim, chọn ghế đến đặt vé, đồng thời cung cấp hệ thống quản trị mạnh mẽ cho rạp phim.

**

## 🚀 Tính năng Chính

### 👤 Dành cho Khách hàng (User)

* **Trang chủ:** Xem danh sách phim đang chiếu, sắp chiếu, banner khuyến mãi nổi bật.
* **Thông tin phim:** Xem chi tiết nội dung, trailer, diễn viên và đánh giá.
* **Đặt vé trực tuyến:**
* Lựa chọn suất chiếu theo ngày giờ.
* Sơ đồ chọn ghế trực quan (phân loại ghế thường, ghế VIP).
* Chọn thêm Combo bắp nước.


* **Thanh toán & Vé:** Quy trình đặt vé hoàn chỉnh, lưu lịch sử vé đã đặt.
* **Thành viên:** Quản lý hồ sơ cá nhân, xem điểm thưởng và đổi quà.
* **Đánh giá:** Viết review và chấm điểm cho phim.

### 🛠️ Dành cho Quản trị viên (Admin)

* **Dashboard:** Tổng quan thống kê doanh thu, số lượng vé bán ra.
* **Quản lý Phim:** Thêm, xóa, sửa thông tin phim (tích hợp upload ảnh poster/banner).
* **Quản lý Lịch chiếu:** Sắp xếp suất chiếu, gán phòng chiếu cho phim.
* **Quản lý Phòng & Ghế:** Thiết lập sơ đồ phòng chiếu.
* **Quản lý Kinh doanh:** Quản lý danh sách Combo (Bắp/Nước) và phần thưởng (Rewards).
* **Quản lý Người dùng:** Xem và quản lý danh sách tài khoản khách hàng.

## 🛠️ Công nghệ Sử dụng

Dự án sử dụng kiến trúc **MERN Stack** (biến thể với Next.js) tách biệt hoàn toàn Frontend và Backend.

### Frontend (Client-side)

* **Framework:** [Next.js 14](https://nextjs.org/) (Sử dụng App Router hiện đại)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Thiết kế giao diện responsive nhanh chóng.
* **HTTP Client:** Axios (xử lý gọi API).
* **Icons:** React Icons / SVG.

### Backend (Server-side)

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Sử dụng Mongoose ODM).
* **Authentication:** JWT (JSON Web Token) middleware bảo mật.
* **Cloud Storage:** Cloudinary (Lưu trữ và quản lý hình ảnh).

## ⚙️ Hướng dẫn Cài đặt & Chạy dự án

### 1. Yêu cầu tiên quyết

* Node.js (v18 trở lên).
* Tài khoản MongoDB Atlas (hoặc MongoDB cài sẵn trên máy).
* Tài khoản Cloudinary (để lấy API Key upload ảnh).

### 2. Thiết lập Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend

```


2. Cài đặt các gói thư viện:
```bash
npm install

```


3. Tạo file `.env` tại thư mục `backend/` và cấu hình các biến sau:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_random
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```


4. Khởi chạy server:
```bash
npm start

```


*Server sẽ chạy tại: `http://localhost:5000*`

### 3. Thiết lập Frontend

1. Mở terminal mới và di chuyển vào thư mục frontend:
```bash
cd frontend

```


2. Cài đặt các gói thư viện:
```bash
npm install

```


3. (Tùy chọn) Cấu hình biến môi trường nếu cần thiết tại `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

```


4. Khởi chạy ứng dụng:
```bash
npm run dev

```


*Truy cập ứng dụng tại: `http://localhost:3000*`

## 📂 Cấu trúc Thư mục

```bash
ciname_galyxa/
├── backend/                 # Mã nguồn Server (Node.js/Express)
│   ├── src/
│   │   ├── config/          # Cấu hình DB, Cloudinary
│   │   ├── controllers/     # Xử lý logic nghiệp vụ (Booking, Movie, User...)
│   │   ├── middleware/      # Middleware (Auth, Upload)
│   │   ├── models/          # Schemas MongoDB (Movie, Room, Showtime...)
│   │   ├── routes/          # Định tuyến API
│   │   └── server.js        # Entry point của server
│   └── ...
│
└── frontend/                # Mã nguồn Client (Next.js)
    ├── public/              # Tài nguyên tĩnh (Ảnh, Icons)
    ├── src/
    │   ├── api/             # Cấu hình Axios instance
    │   ├── app/             # App Router (Next.js 14)
    │   │   ├── (admin)/     # Các trang quản trị (Dashboard, Movies, Users...)
    │   │   └── (user)/      # Các trang người dùng (Home, Booking, Profile...)
    │   ├── components/      # UI Components (Navbar, MovieCard, Sidebar...)
    │   └── ...
    └── ...

```

*Dự án phục vụ mục đích học tập.*
