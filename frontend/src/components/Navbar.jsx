'use client';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSnowflake, FaGift, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import AuthModal from './AuthModal'; 
import axiosClient from '../api/axios'; 

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Lỗi đọc user từ localStorage", e);
          }
      }
    }
  }, []);

  // --- CÁC HÀM XỬ LÝ ---
  const openLogin = () => { setModalTab('login'); setIsModalOpen(true); };
  const openRegister = () => { setModalTab('register'); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = async () => {
      try {
          await axiosClient.post('/auth/logout'); 
          toast.success(` Đăng xuất thành công !`, {
                      position: "top-center",
                      autoClose: 2000
                  });
          localStorage.removeItem('user'); 
          setUser(null);
          window.location.href = '/'; 
      } catch (error) {
          console.error("Lỗi đăng xuất:", error);
      }
  };

  return (
    <>
      <nav className="bg-slate-900 text-white shadow-2xl sticky top-0 z-50 border-b-4 border-blue-600 overflow-hidden">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 filter drop-shadow-lg">
                CINAME
              </span>
              <span className="text-blue-300 text-sm font-bold tracking-[0.3em] uppercase pl-1 flex items-center gap-1">
                GALYXA <span className="text-[10px] text-yellow-400 animate-pulse">✦</span>
              </span>
            </div>
          </Link>

          {/* MENU LINK */}
          <div className="hidden md:flex space-x-8 font-bold text-sm uppercase tracking-wide">
             <Link href="/" className="hover:text-blue-400 transition flex items-center gap-1">Trang chủ</Link>
             <Link href="/schedule" className="hover:text-blue-400 transition">Lịch chiếu</Link>
             <Link href="/news" className="hover:text-blue-400 transition">Tin tức</Link>
          </div>

          {/* CHECK TRẠNG THÁI ĐĂNG NHẬP */}
          <div className="flex items-center gap-4">
            
            {user ? (
                // --- ĐÃ ĐĂNG NHẬP ---
                <div className="flex items-center gap-3 animate-in fade-in duration-300">
                    <span className="hidden md:flex items-center gap-2 text-sm font-bold text-blue-300">
                        <FaUserCircle className="text-xl"/> Chào, {user.name}
                    </span>
                    
                    {user.role === 'admin' && (
                        <Link href="/admin" className="text-xs bg-red-600 px-2 py-1 rounded text-white font-bold hover:bg-red-500">
                            QUẢN TRỊ
                        </Link>
                    )}

                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-1 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg border border-gray-600 transition"
                    >
                        <FaSignOutAlt /> <span className="hidden md:inline">Đăng xuất</span>
                    </button>
                </div>
            ) : (
                // --- CHƯA ĐĂNG NHẬP ---
                <>
                    <button 
                    onClick={openLogin}
                    className="hidden md:block text-sm font-bold hover:text-blue-400 transition"
                    >
                    Đăng nhập
                    </button>
                    <button 
                    onClick={openRegister}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition flex items-center gap-2 border border-white/20"
                    >
                    <FaGift /> Đăng ký
                    </button>
                </>
            )}

          </div>
        </div>

        {/* HOẠT HÌNH TRANG TRÍ */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-900/30 overflow-visible pointer-events-none">
           <div className="absolute bottom-0 animate-chibi-run z-20">
              <img src="/img/Haru.gif" alt="Running Chibi" className="h-16 w-auto object-contain drop-shadow-lg"/>
           </div>
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <FaSnowflake className="absolute top-2 left-10 text-blue-200/10 animate-bounce" />
            <FaSnowflake className="absolute top-5 right-20 text-blue-200/10 animate-pulse" />
            <FaSnowflake className="absolute bottom-10 left-1/3 text-blue-200/05 animate-spin-slow text-xl" />
        </div>
      </nav>

      {/* MODAL */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        initialTab={modalTab}
      />
    </>
  );
};

export default Navbar;