'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { 
  FaCamera, FaUser, FaHistory, FaStar, FaTicketAlt, 
  FaCalendarAlt, FaSpinner, FaMapMarkerAlt, FaCrown, FaGift, FaCheck 
} from 'react-icons/fa';

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

  // State rewards
  const [rewards, setRewards] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [rewardsTab, setRewardsTab] = useState('available'); // 'available' | 'myVouchers' | 'history'

  useEffect(() => {
    fetchProfile();
    fetchBookingHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get('/users/profile');
      // Đảm bảo có trường points, nếu API chưa trả về thì mặc định là 0
      const userData = { ...res.data, points: res.data.points || 0 };
      
      setUser(userData);
      setFormData({
        name: userData.name,
        phone: userData.phone || '',
        email: userData.email,
        password: '',
        confirmPassword: ''
      });
      setAvatarPreview(userData.avatar);
    } catch (error) {
      toast.error('Lỗi tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      const res = await axiosClient.get('/bookings/my-bookings');
      setBookings(res.data);
    } catch (error) {
      console.log('Chưa có lịch sử đặt vé');
    }
  };

  // Fetch rewards data when tab changes
  useEffect(() => {
    if (activeTab === 'rewards') {
      fetchRewards();
      fetchMyVouchers();
      fetchRedemptions();
    }
  }, [activeTab]);

  const fetchRewards = async () => {
    try {
      const res = await axiosClient.get('/rewards');
      setRewards(res.data);
    } catch (error) {
      console.log('Lỗi lấy danh sách phần thưởng');
    }
  };

  const fetchMyVouchers = async () => {
    try {
      const res = await axiosClient.get('/rewards/my-vouchers');
      setMyVouchers(res.data);
    } catch (error) {
      console.log('Lỗi lấy voucher');
    }
  };

  const fetchRedemptions = async () => {
    try {
      const res = await axiosClient.get('/rewards/my-redemptions');
      setRedemptions(res.data);
    } catch (error) {
      console.log('Lỗi lấy lịch sử đổi điểm');
    }
  };

  const handleRedeemReward = async (voucherId, pointCost) => {
    if (user.points < pointCost) {
      return toast.error(`Bạn cần ${pointCost} điểm để đổi, hiện có ${user.points} điểm`);
    }

    try {
      setIsRedeeming(true);
      const res = await axiosClient.post('/rewards/redeem', { voucherId });
      toast.success(res.data.message);
      
      // Cập nhật điểm user
      setUser(prev => ({ ...prev, points: prev.points - pointCost }));
      
      // Refresh data
      fetchRewards();
      fetchMyVouchers();
      fetchRedemptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi đổi điểm');
    } finally {
      setIsRedeeming(false);
    }
  };

  // --- LOGIC TÍNH HẠNG THÀNH VIÊN (MỚI) ---
  const getMembershipInfo = (points = 0) => {
      if (points >= 1000) {
          return { 
              rank: 'Thành viên Cao Cấp', 
              color: 'text-yellow-400', 
              bg: 'bg-yellow-400',
              border: 'border-yellow-400',
              nextGoal: 1000, 
              percent: 100,
              icon: <FaCrown className="text-yellow-400" />
          };
      }
      if (points >= 500) {
          return { 
              rank: 'Khách hàng Thân Thiết', 
              color: 'text-blue-400', 
              bg: 'bg-blue-400',
              border: 'border-blue-400',
              nextGoal: 1000, 
              percent: ((points - 500) / 500) * 100, 
              icon: <FaStar className="text-blue-400" />
          };
      }
      return { 
          rank: 'Thành viên Mới', 
          color: 'text-gray-400', 
          bg: 'bg-gray-400',
          border: 'border-gray-500',
          nextGoal: 500, 
          percent: (points / 500) * 100,
          icon: <FaUser className="text-gray-400" />
      };
  };

  const memberInfo = user ? getMembershipInfo(user.points) : {};

  // --- LOGIC UPLOAD ẢNH ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Vui lòng chọn file ảnh hợp lệ!');
    }
    if (file.size > 5 * 1024 * 1024) { 
      return toast.error('Ảnh quá lớn (Tối đa 5MB)');
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    const data = new FormData();
    data.append('avatar', file);
    data.append('name', user.name);
    data.append('phone', user.phone || '');

    try {
      setIsUploading(true);
      const res = await axiosClient.patch('/users/profile/avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Giữ nguyên điểm số khi cập nhật avatar
      const updatedUser = { ...res.data, points: user.points };
      setUser(updatedUser);
      setAvatarPreview(updatedUser.avatar);

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, avatar: updatedUser.avatar }));
      window.dispatchEvent(new Event('storage'));

      toast.success('Đổi ảnh đại diện thành công!');
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên');
      setAvatarPreview(user.avatar);
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
      // Giữ nguyên điểm số khi cập nhật info
      setUser({ ...res.data, points: user.points }); 
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

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

            {/* AVATAR */}
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className={`w-full h-full rounded-full overflow-hidden border-4 ${memberInfo.border || 'border-gray-700'} shadow-lg relative bg-gray-800`}>
                <img
                  src={
                    avatarPreview ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&color=fff&size=128`
                  }
                  alt={user.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&color=fff&size=128`;
                  }}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                  </div>
                )}
                {!isUploading && (
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer z-10">
                    <div className="flex flex-col items-center text-white">
                      <FaCamera size={24} className="mb-1" />
                      <span className="text-xs font-bold">Đổi ảnh</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
            
            {/* RANK BADGE (MỚI) */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/80 border ${memberInfo.border} text-xs font-bold ${memberInfo.color} mb-2`}>
                {memberInfo.icon} {memberInfo.rank}
            </div>
            
            <p className="text-sm text-gray-400 mb-6 truncate">{user.email}</p>

            {/* Menu Tabs */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition font-medium ${activeTab === 'info' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'}`}
              >
                <FaUser /> Thông tin & Điểm
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
              <button
                onClick={() => setActiveTab('rewards')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition font-medium ${activeTab === 'rewards' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'}`}
              >
                <FaGift /> Đổi Thưởng
              </button>
            </div>
          </div>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className="lg:col-span-9">
          <div className="bg-[#151f32] rounded-2xl p-6 md:p-8 border border-gray-700 shadow-xl min-h-[500px]">

            {/* TAB: THÔNG TIN */}
            {activeTab === 'info' && (
              <div className="animate-fade-in space-y-8">
                
                {/* --- 1. PHẦN THANH TÍCH ĐIỂM (MEMBERSHIP CARD - MỚI) --- */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                    {/* Background Decor */}
                    <FaCrown className="absolute -top-6 -right-6 text-gray-700 opacity-20 rotate-12" size={150} />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Điểm tích lũy</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                                        {user.points}
                                    </span>
                                    <span className="text-gray-500 font-bold">điểm</span>
                                </div>
                            </div>
                            <div className="text-right">
                                {memberInfo.rank !== 'Thành viên Cao Cấp' ? (
                                    <p className="text-sm text-gray-300">
                                        Thêm <span className="text-orange-400 font-bold">{memberInfo.nextGoal - user.points}</span> điểm để lên hạng kế tiếp
                                    </p>
                                ) : (
                                    <p className="text-sm text-yellow-400 font-bold">Bạn đã đạt hạng tối đa!</p>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-4 w-full bg-black/40 rounded-full p-1 shadow-inner border border-gray-600/30">
                            {/* Thanh chạy */}
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${memberInfo.bg}`}
                                style={{ width: `${Math.min(memberInfo.percent, 100)}%` }}
                            ></div>
                        </div>

                        {/* Mốc điểm */}
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <span className={user.points >= 0 ? 'text-white' : ''}>Mới (0)</span>
                            <span className={user.points >= 500 ? 'text-blue-400' : ''}>Thân thiết (500)</span>
                            <span className={user.points >= 1000 ? 'text-yellow-400' : ''}>Cao cấp (1000)</span>
                        </div>
                    </div>
                </div>

                {/* --- 2. FORM THÔNG TIN CÁ NHÂN --- */}
                <div>
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                        <h3 className="text-2xl font-bold text-white">Thông Tin Cá Nhân</h3>
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

            {/* TAB: ĐỔI THƯỞNG */}
            {activeTab === 'rewards' && (
              <div className="animate-fade-in space-y-6">
                {/* Header với điểm */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-700 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Đổi Điểm Thưởng</h3>
                    <p className="text-gray-400 text-sm mt-1">Dùng điểm để đổi voucher giảm giá và nhiều phần quà hấp dẫn</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-6 py-3 rounded-xl flex items-center gap-3">
                    <FaGift className="text-white text-xl" />
                    <div>
                      <p className="text-white/80 text-xs font-medium">Điểm hiện có</p>
                      <p className="text-white text-2xl font-black">{user.points}</p>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setRewardsTab('available')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${rewardsTab === 'available' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    Phần thưởng có thể đổi
                  </button>
                  <button
                    onClick={() => setRewardsTab('myVouchers')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${rewardsTab === 'myVouchers' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    Voucher của tôi ({myVouchers.length})
                  </button>
                  <button
                    onClick={() => setRewardsTab('history')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${rewardsTab === 'history' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    Lịch sử đổi điểm
                  </button>
                </div>

                {/* Sub-tab: Available Rewards */}
                {rewardsTab === 'available' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.length === 0 ? (
                      <div className="col-span-2 text-center py-12 text-gray-400">
                        <FaGift className="text-5xl mx-auto mb-4 opacity-50" />
                        <p>Chưa có phần thưởng nào có sẵn</p>
                      </div>
                    ) : (
                      rewards.map((reward) => (
                        <div key={reward._id} className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex gap-4 hover:border-orange-500/50 transition group">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaGift className="text-white text-2xl" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white group-hover:text-orange-400 transition">{reward.name}</h4>
                            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{reward.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1">
                                <span className="text-orange-400 font-bold">{reward.pointCost}</span>
                                <span className="text-gray-500 text-sm">điểm</span>
                              </div>
                              <button
                                onClick={() => handleRedeemReward(reward._id, reward.pointCost)}
                                disabled={isRedeeming || user.points < reward.pointCost}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
                                  user.points >= reward.pointCost 
                                    ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {isRedeeming ? <FaSpinner className="animate-spin" /> : 'Đổi ngay'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Sub-tab: My Vouchers */}
                {rewardsTab === 'myVouchers' && (
                  <div className="space-y-4">
                    {myVouchers.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <FaTicketAlt className="text-5xl mx-auto mb-4 opacity-50" />
                        <p>Bạn chưa có voucher nào</p>
                        <p className="text-sm mt-2">Hãy đổi điểm để nhận voucher!</p>
                      </div>
                    ) : (
                      myVouchers.map((item) => (
                        <div key={item._id} className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
                          <div className="w-14 h-14 bg-green-600/20 border border-green-600 rounded-xl flex items-center justify-center">
                            <FaCheck className="text-green-400 text-xl" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{item.voucherId?.name}</h4>
                            <p className="text-gray-400 text-xs mt-1">
                              {item.voucherId?.discountType === 'percent' 
                                ? `Giảm ${item.voucherId?.value}%` 
                                : `Giảm ${item.voucherId?.value?.toLocaleString()}đ`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="bg-orange-600 text-white px-3 py-1.5 rounded-lg font-mono font-bold text-sm">{item.voucherCode}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              HSD: {new Date(item.expiresAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Sub-tab: Redemption History */}
                {rewardsTab === 'history' && (
                  <div className="space-y-3">
                    {redemptions.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <FaHistory className="text-5xl mx-auto mb-4 opacity-50" />
                        <p>Chưa có lịch sử đổi điểm</p>
                      </div>
                    ) : (
                      redemptions.map((item) => (
                        <div key={item._id} className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.status === 'active' ? 'bg-green-600/20 text-green-400' :
                            item.status === 'used' ? 'bg-blue-600/20 text-blue-400' :
                            'bg-gray-600/20 text-gray-400'
                          }`}>
                            <FaGift />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-white">{item.voucherId?.name}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(item.redeemedAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-orange-400 font-bold">-{item.pointsSpent} điểm</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.status === 'active' ? 'bg-green-900/30 text-green-400' :
                              item.status === 'used' ? 'bg-blue-900/30 text-blue-400' :
                              'bg-gray-800 text-gray-400'
                            }`}>
                              {item.status === 'active' ? 'Chưa dùng' : item.status === 'used' ? 'Đã dùng' : 'Hết hạn'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;