import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar cố định bên trái */}
      <Sidebar />
      
      {/* Nội dung chính bên phải */}
      <div className="ml-64 flex-1 p-8">
        {children}
      </div>
    </div>
  );
}