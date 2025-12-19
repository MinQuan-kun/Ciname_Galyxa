'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaFilm, FaCalendarAlt, FaUsers, FaChartBar, FaSignOutAlt, FaHome } from 'react-icons/fa';
import axiosClient from '../../api/axios';
import { toast } from 'react-toastify';
const Sidebar = () => {
  const pathname = usePathname();

  // --- HÀM XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = async () => {
    try {
      // 1. Gọi API đăng xuất ở Backend (để xóa cookie)
      await axiosClient.post('/auth/logout'); 
      toast.info("Đăng xuất. Quay lại trang chủ!", {
            theme: "dark"
        });
      // 2. Xóa thông tin user lưu ở trình duyệt
      localStorage.removeItem('user'); 

      // 3. Chuyển hướng về Trang chủ (dùng window.location để reload lại Navbar trang chủ)
      window.location.href = '/'; 
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      toast.success("Đăng xuất thất bại, vui lòng thử lại!");
    }
  };

  // Danh sách menu
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <FaChartBar /> },
    { name: 'Quản lý Phim', path: '/admin/movies', icon: <FaFilm /> },
    { name: 'Lịch chiếu', path: '/admin/showtimes', icon: <FaCalendarAlt /> },
    { name: 'Người dùng', path: '/admin/users', icon: <FaUsers /> },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-white fixed left-0 top-0 shadow-xl flex flex-col border-r border-slate-700">
      
      {/* LOGO */}
      <div className="p-6 border-b border-slate-700 flex flex-col items-center">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase tracking-widest">
          ADMIN
        </h1>
        <span className="text-xs text-slate-400 tracking-[0.3em]">PANEL</span>
      </div>

      {/* MENU CHÍNH */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  href={item.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* FOOTER MENU  */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        {/* Nút Đăng xuất */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full font-bold"
        >
          <FaSignOutAlt className="text-xl" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;