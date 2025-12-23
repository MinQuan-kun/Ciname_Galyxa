'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { FaCamera, FaUser, FaHistory, FaStar, FaTicketAlt, FaCalendarAlt, FaSpinner,FaMapMarkerAlt  } from 'react-icons/fa';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'history' | 'reviews'
  const [loading, setLoading] = useState(true);

  // State upload ảnh
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  // State edit info
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

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
        email: res.data.email,
        password: '',
        confirmPassword: ''
      });
      setAvatarPreview(res.data.avatar);
    } catch (error) {
      toast.error('Lỗi tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      // API này cần backend hỗ trợ, nếu chưa có sẽ trả về lỗi 404
      const res = await axiosClient.get('/bookings/my-bookings');
      setBookings(res.data);
    } catch (error) {
      // Không làm gì nếu lỗi, hoặc log ra console
      console.log('Chưa có lịch sử đặt vé');
    }
  };

  // --- LOGIC UPLOAD ẢNH (HOÀN THIỆN) ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng và kích thước
    if (!file.type.startsWith('image/')) {
      return toast.error('Vui lòng chọn file ảnh hợp lệ!');
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return toast.error('Ảnh quá lớn (Tối đa 5MB)');
    }

    // Hiển thị preview ngay lập tức (UI Optimistic)
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    // Chuẩn bị dữ liệu gửi đi
    const data = new FormData();
    data.append('avatar', file);
    // Backend yêu cầu các trường khác không được null nếu dùng hàm update chung, 
    // nhưng nếu backend tách riêng route avatar thì chỉ cần avatar.
    // Ở đây ta gửi kèm name/phone cũ để đảm bảo không bị lỗi validation (tùy logic backend)
    data.append('name', user.name);
    data.append('phone', user.phone || '');

    try {
      setIsUploading(true);

      const res = await axiosClient.patch('/users/profile/avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Cập nhật lại user mới từ server trả về
      setUser(res.data);
      setAvatarPreview(res.data.avatar); // Cập nhật URL thật từ server (Cloudinary)

      // Cập nhật LocalStorage để đồng bộ Header
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, avatar: res.data.avatar }));

      // Phát sự kiện để Header (nếu có nghe) cập nhật lại avatar
      window.dispatchEvent(new Event('storage'));

      toast.success('Đổi ảnh đại diện thành công!');
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên');
      setAvatarPreview(user.avatar); // Revert lại ảnh cũ nếu lỗi
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();

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

      // Cập nhật localStorage tên mới
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, name: res.data.name }));

      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1121] text-gray-100 pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* SIDEBAR TRÁI: AVATAR & MENU */}
        <div className="lg:col-span-3">
          <div className="bg-[#151f32] rounded-2xl p-6 border border-gray-700 shadow-xl text-center sticky top-28">

            {/* AVATAR UPLOAD SECTION */}
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-700 shadow-lg relative bg-gray-800">
                <img
                  src={
                    avatarPreview ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&color=fff&size=128`
                  }
                  alt={user.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  // Xử lý khi ảnh bị lỗi (link hỏng) thì tự động chuyển về ảnh chữ cái
                  onError={(e) => {
                    e.target.onerror = null; // Tránh lặp vô hạn
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&color=fff&size=128`;
                  }}
                />

                {/* Overlay khi upload */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                  </div>
                )}

                {/* Overlay khi hover để chọn ảnh */}
                {!isUploading && (
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer z-10">
                    <div className="flex flex-col items-center text-white">
                      <FaCamera size={24} className="mb-1" />
                      <span className="text-xs font-bold">Đổi ảnh</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-sm text-gray-400 mb-6 truncate">{user.email}</p>

            {/* Menu Tabs */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition font-medium ${activeTab === 'info' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'}`}
              >
                <FaUser /> Thông tin tài khoản
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition font-medium ${activeTab === 'history' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'}`}
              >
                <FaHistory /> Lịch sử vé đã đặt
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition font-medium ${activeTab === 'reviews' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'}`}
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
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                  <h3 className="text-2xl font-bold text-white">Hồ Sơ Cá Nhân</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm bg-blue-600/10 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition border border-blue-600/30 font-bold"
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 disabled:bg-gray-800 transition text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Số điện thoại</label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 disabled:bg-gray-800 transition text-white"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Email (Không thể thay đổi)</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      disabled
                      className="w-full bg-gray-900/30 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed font-mono"
                    />
                  </div>

                  {/* PHẦN ĐỔI MẬT KHẨU - CHỈ HIỆN KHI EDIT */}
                  {isEditing && (
                    <div className="md:col-span-2 bg-gray-900/30 p-4 rounded-xl border border-gray-800 mt-2">
                      <p className="text-orange-500 text-sm mb-4 font-bold uppercase tracking-wider">🔒 Đổi mật khẩu (Tùy chọn)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-gray-400 text-sm font-medium">Mật khẩu mới</label>
                          <input
                            type="password"
                            placeholder="Nhập mật khẩu mới..."
                            value={formData.password || ''}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-gray-400 text-sm font-medium">Xác nhận mật khẩu</label>
                          <input
                            type="password"
                            placeholder="Nhập lại mật khẩu..."
                            value={formData.confirmPassword || ''}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-700">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            phone: user.phone,
                            email: user.email,
                            password: '',
                            confirmPassword: ''
                          });
                        }}
                        className="px-6 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 transition font-bold text-gray-300"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold text-white shadow-lg shadow-orange-900/40 transition transform active:scale-95"
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
                <h3 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-4 text-white">Lịch Sử Xem Phim</h3>
                {bookings.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center opacity-50">
                    <FaTicketAlt size={48} className="mb-4 text-gray-500" />
                    <p className="text-gray-400">Bạn chưa đặt vé nào.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-4 hover:border-orange-500/50 transition group">
                        <div className="w-full md:w-24 h-36 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={booking.showtimeId?.movieId?.poster || '/placeholder.jpg'}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white group-hover:text-orange-400 transition">{booking.showtimeId?.movieId?.title}</h4>
                          <div className="text-sm text-gray-400 mt-2 space-y-1">
                            <p className="flex items-center gap-2"><FaCalendarAlt className="text-orange-500" /> {new Date(booking.showtimeId?.startTime).toLocaleString('vi-VN')}</p>
                            <p className="flex items-center gap-2"><FaTicketAlt className="text-blue-500" /> Ghế: <span className="text-white font-bold">{booking.seats.join(', ')}</span></p>
                            <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-red-500" /> {"280 An Dương Vương, Q.5, TP.HCM"}</p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between items-end text-right mt-4 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${booking.status === 'confirmed'
                              ? 'bg-green-900/30 text-green-400 border border-green-800'
                              : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                            }`}>
                            {booking.status === 'confirmed' ? 'Thành công' : 'Đang xử lý'}
                          </span>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                            <p className="font-bold text-2xl text-orange-400">{booking.totalPrice?.toLocaleString()} đ</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ĐÁNH GIÁ (Placeholder) */}
            {activeTab === 'reviews' && (
              <div className="animate-fade-in text-center py-20 flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <FaStar className="text-yellow-500 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-white">Tính năng đang phát triển</h3>
                <p className="text-gray-400 mt-2 max-w-md mx-auto">Danh sách các bài đánh giá phim của bạn sẽ sớm được hiển thị tại đây.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;