'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { FaLock, FaUnlock, FaTrash, FaSearch, FaUserShield, FaUser } from 'react-icons/fa';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axiosClient.put(`/users/${id}`, { isLocked: newStatus });
      toast.success(newStatus ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      
      // Cập nhật UI ngay lập tức
      setUsers(users.map(u => u._id === id ? { ...u, isLocked: newStatus } : u));
    } catch (error) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hành động này không thể hoàn tác. Xóa người dùng?')) return;
    try {
      await axiosClient.delete(`/users/${id}`);
      toast.success('Đã xóa người dùng');
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      toast.error('Lỗi khi xóa');
    }
  };

  if (loading) return <div className="text-center py-10 text-white">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
            Quản Lý Người Dùng
          </h1>
          <p className="text-gray-400 text-sm mt-1">Tổng số: {users.length} thành viên</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3 top-3.5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Họ và tên</th>
                <th className="p-4 font-semibold">Email & SĐT</th>
                <th className="p-4 font-semibold text-center">Vai trò</th>
                <th className="p-4 font-semibold text-center">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-700/30 transition duration-200">
                  {/* CỘT TÊN (Chỉ còn Tên) */}
                  <td className="p-4">
                    <span className="font-bold text-white text-lg">{user.name}</span>
                  </td>

                  {/* CỘT LIÊN HỆ */}
                  <td className="p-4 text-gray-300">
                    <div className="text-sm font-medium">{user.email}</div>
                    <div className="text-xs text-gray-500 mt-1">{user.phone || '---'}</div>
                  </td>

                  {/* CỘT VAI TRÒ */}
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' 
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                        : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                    }`}>
                      {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>

                  {/* CỘT TRẠNG THÁI */}
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.isLocked
                        ? 'bg-red-900/50 text-red-300 border border-red-700'
                        : 'bg-green-900/50 text-green-300 border border-green-700'
                    }`}>
                      {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>

                  {/* CỘT THAO TÁC */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleLock(user._id, user.isLocked)}
                          className={`p-2 rounded-lg transition ${
                            user.isLocked 
                              ? 'bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white' 
                              : 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white'
                          }`}
                          title={user.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                        >
                          {user.isLocked ? <FaUnlock /> : <FaLock />}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition"
                        title="Xóa người dùng"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;