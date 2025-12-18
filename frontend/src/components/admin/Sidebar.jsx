import Link from 'next/link';
import { FaFilm, FaCalendarAlt, FaUsers, FaHome, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 h-screen text-white fixed left-0 top-0 shadow-xl flex flex-col">
      {/* Logo Admin */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-red-600 uppercase tracking-widest">
          Admin CP
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-red-600 transition">
          <FaHome /> <span>Dashboard</span>
        </Link>
        <Link href="/admin/movies" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-gray-800 transition">
          <FaFilm /> <span>Quản lý Phim</span>
        </Link>
        <Link href="/admin/showtimes" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-gray-800 transition">
          <FaCalendarAlt /> <span>Lịch chiếu</span>
        </Link>
        <Link href="/admin/users" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-gray-800 transition">
          <FaUsers /> <span>Người dùng</span>
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded hover:bg-red-600 transition text-gray-400 hover:text-white">
          <FaSignOutAlt /> <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;