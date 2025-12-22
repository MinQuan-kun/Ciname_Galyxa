'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await axiosClient.delete(`/users/${id}`);
      toast.success('Người dùng đã được xóa');
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleLock = async (id, isLocked) => {
    try {
      await axiosClient.put(`/users/${id}`, { isLocked: !isLocked });
      toast.success(isLocked ? 'Tài khoản đã được mở khóa' : 'Tài khoản đã được khóa');
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái tài khoản');
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100 font-sans">

      {/* HEADER */}
      <header className="mb-8 border-b border-gray-700 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Quản lý Người dùng
          </h1>
          <p className="text-gray-400 text-sm mt-1">Xem và quản lý thông tin người dùng.</p>
        </div>
      </header>

      {/* TABLE */}
      <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm uppercase">
                <th className="p-4 border-b border-gray-600">Tên</th>
                <th className="p-4 border-b border-gray-600">Email</th>
                <th className="p-4 border-b border-gray-600">Số điện thoại</th>
                <th className="p-4 border-b border-gray-600">Vai trò</th>
                <th className="p-4 border-b border-gray-600">Trạng thái</th>
                <th className="p-4 border-b border-gray-600 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-700/50 transition">
                  <td className="p-4 font-medium text-white">{user.name}</td>
                  <td className="p-4 text-gray-300">{user.email}</td>
                  <td className="p-4 text-gray-300">{user.phone || 'N/A'}</td>
                  <td className="p-4 text-gray-300">{user.role}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm font-bold border ${
                      user.isLocked
                        ? 'bg-red-900 text-red-200 border-red-700/50'
                        : 'bg-green-900 text-green-200 border-green-700/50'
                    }`}>
                      {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-3">
                    {user.role === 'user' && (
                      <button
                        onClick={() => handleLock(user._id, user.isLocked)}
                        className={`px-3 py-1 rounded font-bold transition ${
                          user.isLocked
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                        title={user.isLocked ? 'Mở khóa' : 'Khóa'}
                      >
                        {user.isLocked ? '🔓' : '🔒'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-400 hover:text-red-300 bg-gray-700/50 hover:bg-red-900/30 p-2 rounded transition"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;