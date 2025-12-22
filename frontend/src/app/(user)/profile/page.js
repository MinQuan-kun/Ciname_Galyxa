'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { FaCamera, FaUserEdit, FaAward } from 'react-icons/fa';

const ProfilePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false); // Trạng thái đang upload ảnh

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser && !userId) {
      toast.warning('Vui lòng đăng nhập để xem hồ sơ');
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = userId ? `/users/${userId}` : '/users/profile';
      const response = await axiosClient.get(endpoint);
      
      const userData = response.data;
      setUser(userData);
      
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        password: '',
        confirmPassword: ''
      });
      setAvatarPreview(userData.avatar || '');
      setCanEdit(!userId); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lấy thông tin người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * LOGIC MỚI: THAY AVATAR LÀ LƯU NGAY
   */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Ảnh quá lớn (tối đa 2MB)');
    }

    // Hiển thị preview tạm thời
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    // Chuẩn bị dữ liệu gửi đi
    const data = new FormData();
    data.append('avatar', file);

    try {
      setIsUploading(true);
      toast.info('Đang tải ảnh đại diện lên...');
      
      // Gọi API PATCH riêng cho avatar (đã viết ở Controller trước)
      const response = await axiosClient.patch('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Cập nhật State và LocalStorage ngay lập tức
      const updatedUser = { ...user, avatar: response.data.avatar };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên server');
      setAvatarPreview(user?.avatar || ''); // Trả về ảnh cũ nếu lỗi
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }

    // Ở đây không còn dùng FormData cho File nữa, chỉ gửi dữ liệu JSON thông thường
    const updatePayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };
    if (formData.password) updatePayload.password = formData.password;

    try {
      const response = await axiosClient.put('/users/profile', updatePayload);
      setUser(response.data);
      setEditing(false);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      toast.error('Không thể cập nhật hồ sơ');
    }
  };

  const points = user?.points || 0;
  const nextLevelPoints = 1000;
  const progress = Math.min((points / nextLevelPoints) * 100, 100);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-2 bg-orange-500 rounded-full"></div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Tài khoản Galaxy</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700 shadow-2xl text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className={`relative w-full h-full rounded-full overflow-hidden border-4 border-gray-700 shadow-lg ${isUploading ? 'opacity-50' : ''}`}>
                  <img
                    src={avatarPreview || '/default-avatar.png'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                {/* Chỉ hiện nút đổi ảnh nếu là profile của mình */}
                {canEdit && (
                  <label className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full cursor-pointer hover:scale-110 transition shadow-lg">
                    <FaCamera size={16} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-orange-500 font-medium mb-4 italic">Thành viên Galaxy</p>

              <div className="bg-[#0f172a] rounded-xl p-4 text-left border border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm flex items-center gap-2"><FaAward className="text-yellow-500"/> Điểm tích lũy</span>
                  <span className="font-bold text-orange-400">{points}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400">Tích lũy thêm {nextLevelPoints - points} điểm để lên cấp.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-[#1e293b] rounded-2xl p-6 md:p-8 border border-gray-700 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FaUserEdit className="text-blue-400" /> Thông tin cá nhân
                </h3>
                {canEdit && !editing && (
                  <button 
                    onClick={() => setEditing(true)}
                    className="text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase ml-1">Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase ml-1">Số điện thoại</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition disabled:opacity-60"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs text-gray-400 uppercase ml-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition disabled:opacity-60"
                    />
                  </div>
                </div>

                {editing && (
                  <div className="pt-4 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-700 pt-6">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase ml-1">Mật khẩu mới</label>
                        <input
                          type="password"
                          name="password"
                          placeholder="Bỏ trống nếu không đổi"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase ml-1">Xác nhận mật khẩu</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 focus:border-orange-500 outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => { setEditing(false); fetchProfile(); }}
                        className="px-6 py-2.5 rounded-xl font-medium text-gray-400 hover:bg-gray-800 transition"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-2.5 bg-orange-600 rounded-xl font-bold hover:bg-orange-500 transition shadow-lg shadow-orange-900/20"
                      >
                        Lưu thông tin
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;