'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axios'; //
import { FaUser, FaEnvelope, FaLock, FaPhone, FaTimes, FaGoogle, FaFacebook } from 'react-icons/fa';

const AuthModal = ({ isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  // Hiệu ứng mở modal
  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      setActiveTab(initialTab || 'login');
      setError('');
    } else {
      setAnimate(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setFormData({ name: '', email: '', password: '', phone: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = activeTab === 'login' ? '/auth/login' : '/auth/register';
      const payload = activeTab === 'login' 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await axiosClient.post(endpoint, payload);

      alert(res.data.message);
      
      if (activeTab === 'login') {
        onClose();
        window.location.reload();
      } else {
        switchTab('login');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay làm mờ nền */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Hộp Modal chính */}
      <div className={`relative bg-gray-900 w-full max-w-md mx-4 p-8 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.3)] border border-gray-700 transform transition-all duration-300 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        {/* Nút đóng (X) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
        >
          <FaTimes size={20} />
        </button>

        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            {activeTab === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {activeTab === 'login' ? 'Nhập thông tin để tiếp tục trải nghiệm' : 'Tham gia cộng đồng điện ảnh ngay hôm nay'}
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-pulse">
            <span className="font-bold">⚠️</span> {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Các trường đăng ký */}
          {activeTab === 'register' && (
            <>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" name="name" placeholder="Họ và tên" required 
                  value={formData.name} onChange={handleChange}
                  className="w-full bg-gray-800/50 text-white pl-12 pr-4 py-3.5 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
                />
              </div>

              <div className="relative group">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" name="phone" placeholder="Số điện thoại" 
                  value={formData.phone} onChange={handleChange}
                  className="w-full bg-gray-800/50 text-white pl-12 pr-4 py-3.5 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="relative group">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="email" name="email" placeholder="Địa chỉ Email" required 
              value={formData.email} onChange={handleChange}
              className="w-full bg-gray-800/50 text-white pl-12 pr-4 py-3.5 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="password" name="password" placeholder="Mật khẩu" required 
              value={formData.password} onChange={handleChange}
              className="w-full bg-gray-800/50 text-white pl-12 pr-4 py-3.5 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
            />
          </div>

          {/* Nút Submit */}
          <button 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (activeTab === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ NGAY')}
          </button>
        </form>

        {/* Divider Hoặc */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-500">Hoặc tiếp tục với</span>
          </div>
        </div>

        {/* Social Login (Demo UI) */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-700 hover:bg-gray-800 transition text-gray-300 text-sm font-medium">
            <FaGoogle className="text-red-500" /> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-700 hover:bg-gray-800 transition text-gray-300 text-sm font-medium">
            <FaFacebook className="text-blue-500" /> Facebook
          </button>
        </div>

        {/* Switcher Login/Register */}
        <p className="mt-8 text-center text-gray-400 text-sm">
          {activeTab === 'login' ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button 
            onClick={() => switchTab(activeTab === 'login' ? 'register' : 'login')}
            className="text-blue-400 hover:text-purple-400 font-bold ml-1 transition-colors underline decoration-2 decoration-transparent hover:decoration-purple-400 underline-offset-4"
          >
            {activeTab === 'login' ? "Đăng ký miễn phí" : "Đăng nhập ngay"}
          </button>
        </p>

      </div>
    </div>
  );
};

export default AuthModal;