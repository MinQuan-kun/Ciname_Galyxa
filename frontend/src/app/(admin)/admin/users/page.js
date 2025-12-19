'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { FaUserShield, FaTrash, FaSearch, FaUser } from 'react-icons/fa';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/users'); // Cần Backend API: GET /users
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải users:", error);
      // Dữ liệu giả lập để bạn xem giao diện nếu chưa có API
      setUsers([
        { _id: '1', name: 'Admin Minh Quân', email: 'admin@gmail.com', role: 'admin', createdAt: '2025-10-01' },
        { _id: '2', name: 'Nguyễn Văn A', email: 'userA@gmail.com', role: 'user', createdAt: '2025-12-15' },
        { _id: '3', name: 'Trần Thị B', email: 'userB@gmail.com', role: 'user', createdAt: '2025-12-18' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. Xóa User
  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await axiosClient.delete(`/users/${id}`);
        toast.success('Đã xóa người dùng!');
        fetchUsers();
      } catch (error) {
        toast.error('Xóa thất bại (Cần API Backend)');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            QUẢN LÝ NGƯỜI DÙNG
          </h1>
          <p className="text-slate-400 text-sm mt-1">Tổng thành viên: <span className="text-white font-bold">{users.length}</span></p>
        </div>
        
        {/* Ô tìm kiếm */}
        <div className="bg-slate-800 p-3 rounded-xl flex items-center gap-3 border border-slate-700 shadow-md w-full md:w-auto">
            <FaSearch className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm tên hoặc email..." 
              className="bg-transparent border-none outline-none text-white placeholder-slate-500 min-w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-bold border-b border-slate-700">Avatar</th>
                <th className="p-5 font-bold border-b border-slate-700">Họ tên</th>
                <th className="p-5 font-bold border-b border-slate-700">Email</th>
                <th className="p-5 font-bold border-b border-slate-700">Vai trò</th>
                <th className="p-5 font-bold border-b border-slate-700">Ngày tham gia</th>
                <th className="p-5 font-bold border-b border-slate-700 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-700/30 transition">
                  <td className="p-4">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-slate-300">
                        <FaUser />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">{user.name}</td>
                  <td className="p-4 text-slate-300">{user.email}</td>
                  <td className="p-4">
                    {user.role === 'admin' ? (
                        <span className="flex items-center gap-1 w-fit bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                            <FaUserShield /> Admin
                        </span>
                    ) : (
                        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
                            Member
                        </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 text-center">
                    {user.role !== 'admin' && (
                        <button onClick={() => handleDelete(user._id)} className="text-slate-400 hover:text-red-500 transition p-2 hover:bg-red-500/10 rounded">
                            <FaTrash />
                        </button>
                    )}
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