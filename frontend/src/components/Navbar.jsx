import React from 'react';
import Link from 'next/link';
import { FaSnowflake, FaGift } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-slate-900 text-white shadow-2xl sticky top-0 z-50 border-b-4 border-blue-600 overflow-hidden">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
        
        <Link href="/" className="flex items-center gap-3 group">
          
          {/* Phần Text bên cạnh Logo (Tuỳ chọn, nếu logo đã có chữ thì xóa phần này) */}
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 filter drop-shadow-lg">
              CINAME
            </span>
            <span className="text-blue-300 text-sm font-bold tracking-[0.3em] uppercase pl-1 flex items-center gap-1">
              GALYXA <span className="text-[10px] text-yellow-400 animate-pulse">✦</span>
            </span>
          </div>
        </Link>

        {/* Menu Links - Giữ nguyên */}
        <div className="hidden md:flex space-x-8 font-bold text-sm uppercase tracking-wide">
          <Link href="/" className="hover:text-blue-400 transition flex items-center gap-1">Trang chủ</Link>
          <Link href="/schedule" className="hover:text-blue-400 transition">Lịch chiếu</Link>
          <Link href="/news" className="hover:text-blue-400 transition">Tin tức</Link>
        </div>

        {/* Auth Buttons - Giữ nguyên */}
        <div className="flex items-center gap-3">
          <button className="hidden md:block text-sm font-bold hover:text-blue-400 transition">
            Đăng nhập
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition flex items-center gap-2 border border-white/20">
            <FaGift /> Đăng ký
          </button>
        </div>
      </div>

      {/* === 2. ANIMATION GIF CHIBI CHẠY === */}
      {/* Thanh track đường chạy */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-900/30 overflow-visible pointer-events-none">
         {/* Container chứa animation */}
         <div className="absolute bottom-0 animate-chibi-run z-20">
            
            <img 
              src="../img/Haru.gif" 
              alt="Running Chibi" 
              className="h-16 w-auto object-contain drop-shadow-lg"
            />
         </div>
      </div>

      {/* Tuyết rơi - Giữ nguyên */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <FaSnowflake className="absolute top-2 left-10 text-blue-200/10 animate-bounce" />
          <FaSnowflake className="absolute top-5 right-20 text-blue-200/10 animate-pulse" />
          <FaSnowflake className="absolute bottom-10 left-1/3 text-blue-200/05 animate-spin-slow text-xl" />
      </div>
    </nav>
  );
};

export default Navbar;