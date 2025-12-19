import Sidebar from '@/components/admin/Sidebar'; 

export const metadata = {
  title: 'Admin Dashboard - Ciname Galyxa',
  description: 'Trang quản trị hệ thống rạp chiếu phim',
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* 1. Sidebar cố định bên trái */}
      <Sidebar />

      {/* 2. Phần nội dung chính (Children) */}
      {/* ml-64 để né sidebar, w-full để chiếm hết phần còn lại */}
      <main className="ml-64 w-full p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}