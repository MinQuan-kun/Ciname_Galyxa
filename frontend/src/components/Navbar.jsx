'use client';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSnowflake, FaGift, FaSignOutAlt, FaWallet, FaUserShield } from 'react-icons/fa';
import AuthModal from './AuthModal';
import axiosClient from '../api/axios';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('login');
  const [user, setUser] = useState(null);

  // --- LOGIC LOAD USER & AUTO UPDATE ---
  useEffect(() => {
    const loadUser = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch (e) { console.error(e); }
        } else {
          setUser(null);
        }
      }
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    window.addEventListener('user-update', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('user-update', loadUser);
    };
  }, []);

  // --- HANDLERS ---
  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
      toast.success('Đăng xuất thành công!');
      localStorage.removeItem('user');
      setUser(null);
      window.dispatchEvent(new Event('user-update'));
      window.location.href = '/';
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <nav className="bg-slate-900 text-white shadow-2xl sticky top-0 z-50 border-b-4 border-blue-600 overflow-hidden">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">

          {/* 1. LOGO */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 filter drop-shadow-lg">
                CINAME
              </span>
              <span className="text-blue-300 text-sm font-bold tracking-[0.3em] uppercase pl-1 flex items-center gap-1">
                GALYXA <span className="text-[10px] text-yellow-400 animate-pulse">✦</span>
              </span>
            </div>
          </Link>

          {/* 2. MENU LINK */}
          <div className="hidden md:flex space-x-8 font-bold text-sm uppercase tracking-wide absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="hover:text-blue-400 transition flex items-center gap-1">Trang chủ</Link>
            <Link href="/schedule" className="hover:text-blue-400 transition">Lịch chiếu</Link>
            <Link href="/news" className="hover:text-blue-400 transition">Đánh giá</Link>
          </div>

          {/* 3. USER SECTION (Bên Phải) */}
          <div className="flex items-center gap-4 shrink-0">
            {user ? (
              <div className="flex items-center gap-4 animate-in fade-in duration-300">
                
                {/* Điểm tích lũy */}
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <FaWallet className="text-yellow-500" /> Điểm
                  </span>
                  <span className="text-sm font-black text-yellow-400">
                    {new Intl.NumberFormat('vi-VN').format(user.points || 0)} P
                  </span>
                </div>

                {/* Profile + Avatar */}
                <Link href="/profile" className="flex items-center gap-3 group">
                  {user.role !== 'admin' && (
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition truncate max-w-[150px]">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">Thành viên</p>
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full border-2 border-slate-700 overflow-hidden group-hover:border-blue-500 transition shadow-lg relative bg-slate-800">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=U";
                      }}
                    />
                  </div>
                </Link>

                {/* Nút Admin */}
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <button className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black px-3 py-2 rounded-xl font-bold text-xs shadow-lg shadow-yellow-500/30 transition-all transform hover:scale-105 border border-yellow-300">
                      <FaUserShield size={14} />
                      <span className="hidden lg:inline">QUẢN TRỊ</span>
                    </button>
                  </Link>
                )}

                {/* Nút Đăng xuất */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-full border border-slate-700 transition group"
                  title="Đăng xuất"
                >
                  <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              // Chưa đăng nhập
              <>
                <button onClick={() => { setModalTab('login'); setIsModalOpen(true); }} className="hidden md:block text-sm font-bold hover:text-blue-400 transition">
                  Đăng nhập
                </button>
                <button onClick={() => { setModalTab('register'); setIsModalOpen(true); }} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition flex items-center gap-2 border border-white/20">
                  <FaGift /> Đăng ký
                </button>
              </>
            )}
          </div>
        </div>

        {/* Decoration */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-900/30 overflow-visible pointer-events-none">
          <div className="absolute bottom-0 animate-chibi-run z-20">
            <img src="/img/Haru.gif" alt="Chibi" className="h-16 w-auto object-contain drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <FaSnowflake className="absolute top-2 left-10 text-blue-200/10 animate-bounce" />
          <FaSnowflake className="absolute top-5 right-20 text-blue-200/10 animate-pulse" />
          <FaSnowflake className="absolute bottom-10 left-1/3 text-blue-200/05 animate-spin-slow text-xl" />
        </div>
      </nav>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialTab={modalTab} />
    </>
  );
};

export default Navbar;