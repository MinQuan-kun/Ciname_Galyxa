'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaTachometerAlt,
  FaFilm,         
  FaCalendarAlt,   
  FaCouch,         
  FaHamburger,     
  FaUserCog,       
  FaGlobe,         
  FaSignOutAlt,
  FaTimes   
} from 'react-icons/fa';
import axiosClient from '../../api/axios';
import { toast } from 'react-toastify';

// Nhận props isOpen và toggleSidebar
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout'); 
      toast.info("Đăng xuất. Quay lại trang chủ!", { theme: "dark" });
      localStorage.removeItem('user'); 
      window.location.href = '/'; 
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      toast.success("Đăng xuất thất bại!");
    }
  };

  const menuItems = [
    { 
      name: 'Thống kê', 
      path: '/admin', 
      icon: <FaTachometerAlt /> 
    },
    { 
      name: 'Quản lý Phim', 
      path: '/admin/movies', 
      icon: <FaFilm /> 
    },
    { 
      name: 'Lịch chiếu', 
      path: '/admin/showtimes', 
      icon: <FaCalendarAlt /> 
    },
    { 
      name: 'Phòng chiếu', 
      path: '/admin/rooms', 
      icon: <FaCouch /> 
    },
    { 
      name: 'Dịch vụ & KM', 
      path: '/admin/combos', 
      icon: <FaHamburger /> 
    },
    { 
      name: 'Người dùng', 
      path: '/admin/users', 
      icon: <FaUserCog /> 
    },
    { 
      name: 'Về trang chủ', 
      path: '/', 
      icon: <FaGlobe /> 
    },
  ];
  return (
    <>
      {/* SIDEBAR CHÍNH */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-slate-900 text-white shadow-2xl border-r border-slate-700 z-50 flex flex-col transition-transform duration-300 ease-in-out w-60 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* HEADER LOGO + NÚT ĐÓNG */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex flex-col">
                <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase tracking-widest">
                ADMIN
                </h1>
                <span className="text-[10px] text-slate-400 tracking-[0.3em]">PANEL</span>
            </div>
            
            {/* Nút X để đóng menu bên trong */}
            <button onClick={toggleSidebar} className="text-slate-400 hover:text-white p-1">
                <FaTimes size={20} />
            </button>
        </div>

        {/* MENU LIST */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3"> 
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    // --- THÊM DÒNG NÀY ---
                    // Khi click vào link -> gọi toggleSidebar để đóng menu
                    onClick={toggleSidebar} 
                    // ---------------------
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-sm ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full font-bold text-sm"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div 
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
        ></div>
      )}
    </>
  );
};

export default Sidebar;