'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { FaLock, FaUnlock, FaTrash, FaSearch, FaUserShield, FaUser } from 'react-icons/fa';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

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
      setNotification({ type: 'error', title: 'Lỗi tải trang', message: 'Không thể tải danh sách người dùng.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axiosClient.put(`/users/${id}`, { isLocked: newStatus });
      setNotification({ type: 'success', title: 'Thành công', message: newStatus ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản' });

      // Cập nhật UI ngay lập tức
      setUsers(users.map(u => u._id === id ? { ...u, isLocked: newStatus } : u));
    } catch (error) {
      setNotification({ type: 'error', title: 'Lỗi cập nhật trạng thái', message: 'Không thể cập nhật trạng thái tài khoản.' });
    }
  };

  const handleRequestDelete = (user) => {
    setConfirmModal(user);
  };

  // --- 2. THỰC HIỆN XÓA (Gọi API) ---
  const executeDelete = async () => {
    if (!confirmModal) return;
    try {
      await axiosClient.delete(`/users/${confirmModal._id}`);
      setNotification({
        type: 'success',
        title: 'Đã xóa',
        message: `Đã xóa người dùng "${confirmModal.name}" thành công.`
      });
      setUsers(users.filter(u => u._id !== confirmModal._id));
    } catch (error) {
      setNotification({ type: 'error', title: 'Lỗi xóa', message: 'Không thể xóa người dùng này.' });
    } finally {
      setConfirmModal(null);
    }
  };

  const closeNotification = () => setNotification(null);
  const closeConfirmModal = () => setConfirmModal(null);

  // Helper Styles cho Popup
  const getPopupStyles = (type) => {
    switch (type) {
      case 'success': return { bgHeader: 'bg-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path> };
      case 'error': return { bgHeader: 'bg-red-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path> };
      default: return { bgHeader: 'bg-blue-600', icon: null };
    }
  };

  if (loading) return <div className="text-center py-10 text-white">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100 relative">
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
                  {/* CỘT TÊN */}
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
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
                      : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                      }`}>
                      {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>

                  {/* CỘT TRẠNG THÁI */}
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isLocked
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
                          className={`p-2 rounded-lg transition ${user.isLocked
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white'
                            : 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white'
                            }`}
                          title={user.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                        >
                          {user.isLocked ? <FaUnlock /> : <FaLock />}
                        </button>
                      )}
                      <button
                        onClick={() => handleRequestDelete(user._id)}
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
      {/* --- MODAL: CẢNH BÁO XÁC NHẬN XÓA --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-800 border border-red-500/50 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">

            <div className="bg-red-600/90 p-4 flex items-center gap-3">
              <div className="bg-white text-red-600 rounded-full p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-white font-bold text-lg">Xác nhận xóa?</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                Bạn có chắc chắn muốn xóa người dùng <span className="text-white font-bold">"{confirmModal.name}"</span>?
              </p>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-400">
                <p>Email: {confirmModal.email}</p>
                <p>Vai trò: {confirmModal.role}</p>
              </div>
              <p className="text-xs text-red-400 italic text-center">* Hành động này không thể hoàn tác.</p>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button onClick={closeConfirmModal} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium">Hủy bỏ</button>
              <button onClick={executeDelete} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-bold shadow-lg shadow-red-900/50">Xác nhận Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: THÔNG BÁO KẾT QUẢ CHUNG --- */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100">
            <div className={`${getPopupStyles(notification.type).bgHeader} p-4 flex items-center gap-3`}>
              <div className={`bg-white text-gray-800 rounded-full p-1`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{getPopupStyles(notification.type).icon}</svg>
              </div>
              <h3 className="text-white font-bold text-lg">{notification.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 text-base">{notification.message}</p>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button onClick={closeNotification} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;