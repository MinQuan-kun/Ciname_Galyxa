# 🎬 Ciname Galyxa - Hệ thống Đặt vé Xem phim Trực tuyến

![Status](https://img.shields.io/badge/Status-Development-yellow?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)

**Ciname Galyxa** là một ứng dụng web full-stack hiện đại phục vụ việc quản lý và đặt vé xem phim. Dự án cung cấp trải nghiệm người dùng mượt mà từ việc chọn phim, chọn ghế đến đặt vé, đồng thời cung cấp hệ thống quản trị mạnh mẽ cho rạp phim.

---

## 📸 Demo
👉 **Trải nghiệm ngay tại:** [https://ciname-galyxa.onrender.com](https://ciname-galyxa.onrender.com)
| Trang chủ | Chọn ghế | Dashboard Admin |
| :---: | :---: | :---: |
| ![Home](https://github.com/user-attachments/assets/3f94eb73-bbf4-41c7-91c8-423506386649) | ![Seat](https://github.com/user-attachments/assets/0360374a-3fc0-4cc3-81fb-ffd59c3c7175) | ![Admin](https://github.com/user-attachments/assets/091d0fe5-97f3-4282-86ac-5afa6afcbd87) |

---

## 🚀 Tính năng Chính

### 👤 Dành cho Khách hàng (User)
* **Trang chủ & Khám phá:**
    * Xem danh sách phim đang chiếu, sắp chiếu.
    * Tìm kiếm phim, xem banner khuyến mãi nổi bật.
* **Thông tin phim chi tiết:** Trailer, nội dung, diễn viên và xem đánh giá từ cộng đồng.
* **Quy trình Đặt vé thông minh:**
    * Lựa chọn suất chiếu theo ngày giờ linh hoạt.
    * **Sơ đồ ghế trực quan:** Phân loại ghế thường, ghế VIP, ghế đôi.
    * **Combo bắp nước:** Mua kèm bắp nước ngay khi đặt vé.
    * **Áp dụng Voucher:** Nhập mã giảm giá khi thanh toán.
* **Thành viên & Tiện ích:**
    * Quản lý hồ sơ cá nhân và lịch sử vé đã đặt.
    * **Hệ thống điểm thưởng:** Tích điểm khi đặt vé, đổi điểm lấy quà (Rewards).
    * Đánh giá và bình luận phim.

### 🛠️ Dành cho Quản trị viên (Admin)
* **Dashboard Thống kê:** Báo cáo doanh thu, số lượng vé bán ra, phim hot nhất theo thời gian thực.
* **Quản lý Phim:** CRUD phim, tích hợp upload ảnh poster/banner lên Cloudinary.
* **Quản lý Lịch chiếu:** Sắp xếp suất chiếu, gán phòng chiếu, tránh trùng lặp giờ.
* **Quản lý Hạ tầng:** Thiết lập sơ đồ phòng chiếu (số hàng, số cột, loại ghế).
* **Quản lý Kinh doanh:**
    * Quản lý Combo (Bắp/Nước).
    * **Quản lý Voucher:** Tạo mã giảm giá, quản lý hạn sử dụng.
    * Quản lý Phần thưởng (Rewards) cho khách hàng thân thiết.
* **Quản lý Người dùng:** Kiểm soát danh sách tài khoản khách hàng.

---

## 🛠️ Công nghệ Sử dụng

Dự án sử dụng kiến trúc **MERN Stack** (biến thể với Next.js) tách biệt hoàn toàn Frontend và Backend.

### Frontend (Client-side)
* **Framework:** [Next.js 14](https://nextjs.org/) (App Router).
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Thiết kế Responsive.
* **State Management & Data Fetching:** React Hooks, Axios.
* **UI Components:** React Icons, Modals tùy chỉnh.

### Backend (Server-side)
* **Runtime:** Node.js & Express.js.
* **Database:** MongoDB (Mongoose ODM).
* **Authentication:** JWT (JSON Web Token).
* **Storage:** Cloudinary (Lưu trữ ảnh).
* **Security:** Middleware xác thực phân quyền (Admin/User).

---

## ⚙️ Hướng dẫn Cài đặt & Chạy dự án

### 1. Yêu cầu tiên quyết
* Node.js (v18 trở lên).
* Git.
* Tài khoản MongoDB Atlas (hoặc MongoDB Local).
* Tài khoản Cloudinary (để lấy API upload ảnh).

### 2. Clone dự án
```bash
git clone [https://github.com/minquan-kun/ciname_galyxa.git](https://github.com/minquan-kun/ciname_galyxa.git)
cd ciname_galyxa

```

### 3. Thiết lập Backend

Di chuyển vào thư mục backend và cài đặt dependencies:

```bash
cd backend
npm install

```

Tạo file `.env` tại thư mục `backend/` và điền thông tin của bạn:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ciname_galyxa
JWT_SECRET=chuoi_bi_mat_cua_ban_123
CLOUDINARY_CLOUD_NAME=ten_cloud_name
CLOUDINARY_API_KEY=api_key_cua_ban
CLOUDINARY_API_SECRET=api_secret_cua_ban

```

Khởi chạy server (Development mode):

```bash
npm start
# Server chạy tại: http://localhost:5000

```

### 4. Thiết lập Frontend

Mở terminal mới, di chuyển vào thư mục frontend và cài đặt dependencies:

```bash
cd frontend
npm install

```

Tạo file `.env.local` tại thư mục `frontend/` (nếu cần đổi cổng API):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

```

Khởi chạy ứng dụng:

```bash
npm run dev
# Truy cập tại: http://localhost:3000

```

---

## 📂 Cấu trúc Thư mục

```bash
ciname_galyxa/
├── backend/                 # API Server (Express)
│   ├── src/
│   │   ├── config/          # DB, Cloudinary configs
│   │   ├── controllers/     # Logic: Booking, Movie, Voucher, Stats...
│   │   ├── middleware/      # Auth, Admin Check
│   │   ├── models/          # MongoDB Schemas
│   │   ├── routes/          # API Endpoints
│   │   └── server.js        # Entry point
│
└── frontend/                # Client App (Next.js)
    ├── public/              # Static assets
    ├── src/
    │   ├── api/             # Axios setup
    │   ├── app/             # App Router Pages
    │   │   ├── (admin)/     # Admin Dashboard routes
    │   │   └── (user)/      # User routes
    │   ├── components/      # Reusable UI components
    │   └── ...

```
