import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-red-600 uppercase tracking-wider">
          Mì Tôm Cinema
        </Link>

        {/* Menu Links */}
        <div className="space-x-6 font-medium">
          <Link to="/" className="hover:text-red-500 transition">Trang chủ</Link>
          <Link to="/schedule" className="hover:text-red-500 transition">Lịch chiếu</Link>
          <Link to="/news" className="hover:text-red-500 transition">Tin tức</Link>
        </div>

        {/* Auth Buttons */}
        <div>
          <button className="bg-transparent border border-white px-4 py-2 rounded mr-2 hover:bg-white hover:text-black transition cursor-pointer">
            Đăng nhập
          </button>
          <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer">
            Đăng ký
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;