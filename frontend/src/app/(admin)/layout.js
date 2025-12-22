import AdminLayoutClient from '@/components/admin/AdminLayoutClient'; // Import component mới tạo ở Bước 1

export const metadata = {
  title: 'Admin Dashboard - Ciname Galyxa',
  description: 'Trang quản trị hệ thống rạp chiếu phim',
};

export default function AdminLayout({ children }) {
  return (
    // Toàn bộ logic giao diện được chuyển sang Client Component
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}