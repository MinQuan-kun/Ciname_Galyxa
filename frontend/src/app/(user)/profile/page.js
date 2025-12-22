'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { FaCamera, FaUser, FaHistory, FaStar, FaTicketAlt, FaCalendarAlt } from 'react-icons/fa';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]); // State cho lịch sử vé
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'history' | 'reviews'
  const [loading, setLoading] = useState(true);
  
  // State cho edit info
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchBookingHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get('/users/profile');
      setUser(res.data);
      setFormData({
        name: res.data.name,
        phone: res.data.phone || '',
        email: res.data.email
      });
      setAvatarPreview(res.data.avatar);
    } catch (error) {
      toast.error('Lỗi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      const res = await axiosClient.get('/bookings/my-bookings'); // Cần tạo route này ở backend
      setBookings(res.data);
    } catch (error) {
      console.log('Chưa có API history');
    }
  };

  const handleUpdateAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await axiosClient.patch('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser({ ...user, avatar: res.data.avatar });
      setAvatarPreview(res.data.avatar);
      toast.success('Cập nhật avatar thành công');
    } catch (err) {
      toast.error('Lỗi upload ảnh');
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu xác nhận
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        return toast.error('Mật khẩu xác nhận không khớp!');
      }
      if (formData.password.length < 6) {
        return toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      }
    }

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        ...(formData.password && { password: formData.password }) 
      };

      const res = await axiosClient.put('/users/profile', payload);
      setUser(res.data);
      setIsEditing(false);
      
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0b1121] text-gray-100 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR TRÁI: AVATAR & MENU */}
        <div className="lg:col-span-3">
          <div className="bg-[#151f32] rounded-2xl p-6 border border-gray-700 shadow-xl text-center sticky top-24">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <img 
                src={avatarPreview || '/default-avatar.png'} 
                className="w-full h-full rounded-full object-cover border-4 border-orange-500/50 shadow-lg"
              />
              <label className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition shadow-md border border-gray-600">
                <FaCamera size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={handleUpdateAvatar} />
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-gray-400 mb-6">{user.email}</p>

            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab('info')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition ${activeTab === 'info' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <FaUser /> Thông tin tài khoản
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition ${activeTab === 'history' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <FaHistory /> Lịch sử vé
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition ${activeTab === 'reviews' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <FaStar /> Đánh giá của tôi
              </button>
            </div>
          </div>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className="lg:col-span-9">
          <div className="bg-[#151f32] rounded-2xl p-6 md:p-8 border border-gray-700 shadow-xl min-h-[500px]">
            
            {/* TAB: THÔNG TIN */}
            {activeTab === 'info' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-4 flex justify-between items-center">
                  Hồ Sơ Cá Nhân
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="text-sm bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition border border-blue-600/30"
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </h3>

                <form onSubmit={handleUpdateInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Họ và tên</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={formData.phone || ''} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 transition"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Email (Không thể thay đổi)</label>
                    <input 
                      type="email" 
                      value={formData.email || ''} 
                      disabled
                      className="w-full bg-gray-900/30 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* PHẦN ĐỔI MẬT KHẨU - CHỈ HIỆN KHI EDIT */}
                  {isEditing && (
                    <>
                      <div className="md:col-span-2 mt-4 border-t border-gray-700/50 pt-4">
                        <p className="text-orange-500 text-sm mb-4 font-bold">Đổi mật khẩu (Bỏ trống nếu không muốn thay đổi)</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 text-sm font-medium">Mật khẩu mới</label>
                        <input 
                          type="password" 
                          placeholder="Nhập mật khẩu mới..."
                          value={formData.password || ''} 
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 text-sm font-medium">Xác nhận mật khẩu</label>
                        <input 
                          type="password" 
                          placeholder="Nhập lại mật khẩu..."
                          value={formData.confirmPassword || ''} 
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                    </>
                  )}
                  
                  {isEditing && (
                    <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ // Reset lại form về dữ liệu gốc
                            name: user.name,
                            phone: user.phone,
                            email: user.email,
                            password: '',
                            confirmPassword: ''
                          });
                        }} 
                        className="px-6 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 transition font-medium"
                      >
                        Hủy bỏ
                      </button>
                      <button 
                        type="submit" 
                        className="px-8 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold shadow-lg shadow-orange-900/40 transition transform active:scale-95"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* TAB: LỊCH SỬ VÉ */}
            {activeTab === 'history' && (
              <div className="animate-fade-in">
                 <h3 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-4">Lịch Sử Xem Phim</h3>
                 {bookings.length === 0 ? (
                   <p className="text-gray-400 text-center py-10">Bạn chưa đặt vé nào.</p>
                 ) : (
                   <div className="space-y-4">
                     {bookings.map((booking) => (
                       <div key={booking._id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex gap-4 hover:border-orange-500/50 transition">
                         <img 
                            src={booking.showtimeId?.movieId?.poster || '/placeholder.jpg'} 
                            className="w-20 h-28 object-cover rounded-lg shadow-md"
                         />
                         <div className="flex-1">
                           <h4 className="text-lg font-bold text-orange-400">{booking.showtimeId?.movieId?.title}</h4>
                           <div className="text-sm text-gray-400 mt-1 flex flex-col gap-1">
                              <p className="flex items-center gap-2"><FaCalendarAlt /> {new Date(booking.showtimeId?.startTime).toLocaleString('vi-VN')}</p>
                              <p className="flex items-center gap-2"><FaTicketAlt /> Ghế: {booking.seats.join(', ')}</p>
                              <p>Rạp: {booking.showtimeId?.room?.name}</p>
                           </div>
                         </div>
                         <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'confirmed' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
                            }`}>
                              {booking.status === 'confirmed' ? 'Thành công' : 'Đang xử lý'}
                            </span>
                            <p className="mt-2 font-bold text-xl">{booking.totalPrice.toLocaleString()} đ</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {/* TAB: ĐÁNH GIÁ (Placeholder) */}
            {activeTab === 'reviews' && (
              <div className="animate-fade-in text-center py-10">
                <FaStar className="mx-auto text-yellow-500 text-5xl mb-4" />
                <h3 className="text-xl font-bold">Tính năng đang phát triển</h3>
                <p className="text-gray-400 mt-2">Danh sách các bài đánh giá phim của bạn sẽ hiển thị ở đây.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;