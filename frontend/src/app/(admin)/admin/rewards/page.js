'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { FaPlus, FaEdit, FaTrash, FaGift, FaPercent, FaMoneyBillWave, FaHistory, FaTicketAlt } from 'react-icons/fa';

const RewardsPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vouchers'); // 'vouchers' | 'history'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState(null);

  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'amount',
    value: '',
    minOrderValue: 0,
    pointCost: '',
    quantity: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchVouchers();
    fetchRedemptions();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await axiosClient.get('/rewards/admin/vouchers');
      setVouchers(res.data);
    } catch (error) {
      console.error("Lỗi tải vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const res = await axiosClient.get('/rewards/all-redemptions');
      setRedemptions(res.data);
    } catch (error) {
      console.error("Lỗi tải lịch sử đổi điểm:", error);
    }
  };

  const openModal = (voucher = null) => {
    if (voucher) {
      setCurrentVoucher(voucher);
      setFormData({
        code: voucher.code,
        name: voucher.name,
        description: voucher.description || '',
        discountType: voucher.discountType,
        value: voucher.value,
        minOrderValue: voucher.minOrderValue || 0,
        pointCost: voucher.pointCost,
        quantity: voucher.quantity,
        startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : '',
        endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : '',
        isActive: voucher.isActive
      });
    } else {
      setCurrentVoucher(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        discountType: 'amount',
        value: '',
        minOrderValue: 0,
        pointCost: '',
        quantity: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      value: Number(formData.value),
      minOrderValue: Number(formData.minOrderValue),
      pointCost: Number(formData.pointCost),
      quantity: Number(formData.quantity)
    };

    try {
      if (currentVoucher) {
        await axiosClient.put(`/rewards/admin/vouchers/${currentVoucher._id}`, payload);
        setNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Đã cập nhật phần thưởng.'
        });
      } else {
        await axiosClient.post('/rewards/admin/vouchers', payload);
        setNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Đã thêm phần thưởng mới.'
        });
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể lưu dữ liệu. Vui lòng thử lại.'
      });
    }
  };

  const handleRequestDelete = (voucher) => {
    setConfirmModal(voucher);
  };

  const executeDelete = async () => {
    if (!confirmModal) return;
    try {
      await axiosClient.delete(`/rewards/admin/vouchers/${confirmModal._id}`);
      setNotification({
        type: 'success',
        title: 'Đã xóa',
        message: `Đã xóa phần thưởng "${confirmModal.name}" thành công.`
      });
      fetchVouchers();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Lỗi xóa',
        message: error.response?.data?.message || 'Không thể xóa phần thưởng này.'
      });
    } finally {
      setConfirmModal(null);
    }
  };

  const closeNotification = () => setNotification(null);
  const closeConfirmModal = () => setConfirmModal(null);

  const getPopupStyles = (type) => {
    switch (type) {
      case 'success': return { bgHeader: 'bg-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path> };
      case 'error': return { bgHeader: 'bg-red-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path> };
      case 'warning': return { bgHeader: 'bg-yellow-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path> };
      default: return { bgHeader: 'bg-blue-600', icon: null };
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

  if (loading) return <div className="text-white text-center py-10 bg-gray-900 h-screen">Loading...</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
          Quản Lý Phần Thưởng Đổi Điểm
        </h1>
        {activeTab === 'vouchers' && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-xl font-bold transition shadow-lg shadow-orange-900/40 text-white"
          >
            <FaPlus /> Thêm Phần Thưởng
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
            activeTab === 'vouchers' 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <FaGift /> Danh sách phần thưởng
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
            activeTab === 'history' 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <FaHistory /> Lịch sử đổi điểm
        </button>
      </div>

      {/* Tab Content: Vouchers */}
      {activeTab === 'vouchers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-20">
              <FaGift size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có phần thưởng nào. Hãy thêm phần thưởng mới!</p>
            </div>
          ) : (
            vouchers.map(voucher => (
              <div 
                key={voucher._id} 
                className={`bg-gray-800 rounded-2xl overflow-hidden border transition hover:border-orange-500/50 group relative ${
                  voucher.isActive ? 'border-gray-700' : 'border-red-500/30 opacity-60'
                }`}
              >
                {/* Header Card */}
                <div className={`p-4 ${voucher.discountType === 'percent' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-green-600 to-teal-600'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                        {voucher.code}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">{voucher.name}</h3>
                    </div>
                    <div className="text-right">
                      {voucher.discountType === 'percent' ? (
                        <div className="flex items-center gap-1 text-2xl font-black text-white">
                          <FaPercent size={16} />
                          <span>{voucher.value}%</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-black text-white">
                          {formatCurrency(voucher.value)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Card */}
                <div className="p-5">
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{voucher.description || 'Không có mô tả'}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Điểm cần đổi:</span>
                      <span className="text-orange-400 font-bold">{voucher.pointCost} điểm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Số lượng:</span>
                      <span className={`font-bold ${voucher.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {voucher.quantity > 0 ? voucher.quantity : 'Hết hàng'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Đơn tối thiểu:</span>
                      <span className="text-white">{voucher.minOrderValue > 0 ? formatCurrency(voucher.minOrderValue) : 'Không'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hết hạn:</span>
                      <span className={`font-medium ${new Date(voucher.endDate) < new Date() ? 'text-red-400' : 'text-white'}`}>
                        {formatDate(voucher.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-700">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${voucher.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {voucher.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(voucher)} className="p-2 bg-gray-700 hover:bg-blue-600 rounded-lg transition text-white"><FaEdit /></button>
                      <button onClick={() => handleRequestDelete(voucher)} className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition text-white"><FaTrash /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: History */}
      {activeTab === 'history' && (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-bold text-gray-300">Người dùng</th>
                  <th className="text-left px-4 py-3 text-sm font-bold text-gray-300">Phần thưởng</th>
                  <th className="text-left px-4 py-3 text-sm font-bold text-gray-300">Mã voucher</th>
                  <th className="text-left px-4 py-3 text-sm font-bold text-gray-300">Điểm đã dùng</th>
                  <th className="text-left px-4 py-3 text-sm font-bold text-gray-300">Trạng thái</th>
                  <th className="text-left px-4 py-3 text-sm font-bold text-gray-300">Ngày đổi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {redemptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      <FaTicketAlt size={32} className="mx-auto mb-2 opacity-50" />
                      Chưa có lượt đổi điểm nào
                    </td>
                  </tr>
                ) : (
                  redemptions.map(item => (
                    <tr key={item._id} className="hover:bg-gray-700/30 transition">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white">{item.userId?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{item.userId?.email || ''}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{item.voucherId?.name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-orange-400 bg-gray-700 px-2 py-1 rounded text-sm">{item.voucherCode}</span>
                      </td>
                      <td className="px-4 py-3 text-orange-400 font-bold">{item.pointsSpent} điểm</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          item.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'used' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.status === 'active' ? 'Chưa dùng' : item.status === 'used' ? 'Đã dùng' : 'Hết hạn'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(item.redeemedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL ADD/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-xl shadow-2xl border border-gray-700 p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
              {currentVoucher ? 'Cập nhật Phần thưởng' : 'Thêm Phần thưởng Mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Code & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mã code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="VD: TET2025"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tên hiển thị</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="VD: Giảm 50k"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết phần thưởng..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none h-20 resize-none text-white"
                ></textarea>
              </div>

              {/* Row 2: Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Loại giảm giá</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                  >
                    <option value="amount">Số tiền (VNĐ)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Giá trị {formData.discountType === 'percent' ? '(%)' : '(VNĐ)'}
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                  />
                </div>
              </div>

              {/* Row 3: Min Order & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Điểm cần đổi</label>
                  <input
                    type="number"
                    name="pointCost"
                    value={formData.pointCost}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                  />
                </div>
              </div>

              {/* Row 4: Quantity & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Số lượng</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-900 px-3 py-2 rounded-lg border border-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                    />
                    <span className={`font-bold text-sm ${formData.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                      {formData.isActive ? '✓ Kích hoạt' : 'Tạm tắt'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 5: Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ngày hết hạn</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-white">Hủy</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 font-bold shadow-lg shadow-orange-900/30 transition text-white">
                  {currentVoucher ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRM DELETE */}
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
              <p className="text-gray-300">Bạn có chắc chắn muốn xóa phần thưởng này không?</p>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h4 className="text-white font-bold">{confirmModal.name}</h4>
                <p className="text-orange-400 text-sm font-mono">{confirmModal.code}</p>
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

      {/* MODAL NOTIFICATION */}
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

export default RewardsPage;
