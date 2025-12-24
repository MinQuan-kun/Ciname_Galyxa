'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';

import { FaPlus, FaEdit, FaTrash, FaFire, FaImage, FaListUl } from 'react-icons/fa';

const CombosPage = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCombo, setCurrentCombo] = useState(null);

  const [notification, setNotification] = useState(null); // Thông báo kết quả
  const [confirmModal, setConfirmModal] = useState(null); // Xác nhận xóa
  // State form
  const [formData, setFormData] = useState({
    name: '',
    items: '',
    description: '',
    price: '',
    isHot: false,
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const res = await axiosClient.get('/combos');
      setCombos(res.data);
    } catch (error) {
      console.error("Lỗi tải combo:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (combo = null) => {
    if (combo) {
      setCurrentCombo(combo);
      setFormData({
        name: combo.name,
        items: combo.items || '',
        description: combo.description || '',
        price: combo.price,
        isHot: combo.isHot || false,
        image: null
      });
      setImagePreview(combo.image);
    } else {
      setCurrentCombo(null);
      setFormData({
        name: '',
        items: '',
        description: '',
        price: '',
        isHot: false,
        image: null
      });
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        setImagePreview(URL.createObjectURL(file));
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('items', formData.items);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('isHot', formData.isHot);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (currentCombo) {
        await axiosClient.put(`/combos/${currentCombo._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Đã cập nhật thông tin Combo.'
        });
      } else {
        await axiosClient.post('/combos', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Đã thêm Combo mới.'
        });
      }
      setIsModalOpen(false);
      fetchCombos();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu dữ liệu. Vui lòng thử lại.'
      });
    }
  };


  const handleRequestDelete = (combo) => {
    setConfirmModal(combo);
  };

  const executeDelete = async () => {
    if (!confirmModal) return;
    try {
      await axiosClient.delete(`/combos/${confirmModal._id}`);
      setNotification({
        type: 'success',
        title: 'Đã xóa',
        message: `Đã xóa combo "${confirmModal.name}" thành công.`
      });
      fetchCombos();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Lỗi xóa',
        message: 'Không thể xóa combo này.'
      });
    } finally {
      setConfirmModal(null);
    }
  }

  const closeNotification = () => setNotification(null);
  const closeConfirmModal = () => setConfirmModal(null);

  // Helper Styles cho Popup
  const getPopupStyles = (type) => {
    switch (type) {
      case 'success': return { bgHeader: 'bg-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path> };
      case 'error': return { bgHeader: 'bg-red-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path> };
      case 'warning': return { bgHeader: 'bg-yellow-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path> };
      default: return { bgHeader: 'bg-blue-600', icon: null };
    }
  };



  if (loading) return <div className="text-white text-center py-10 bg-gray-900 h-screen">Loading...</div>;
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
          Quản Lý Dịch Vụ & Combo
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-xl font-bold transition shadow-lg shadow-orange-900/40 text-white"
        >
          <FaPlus /> Thêm Combo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map(combo => (
          <div key={combo._id} className={`bg-gray-800 rounded-2xl overflow-hidden border transition hover:border-orange-500/50 group relative ${combo.isHot ? 'border-yellow-500/50 shadow-yellow-900/20 shadow-lg' : 'border-gray-700'}`}>

            {/* Ảnh */}
            <div className="h-48 w-full overflow-hidden relative">
              <img
                src={combo.image || '/popcorn-placeholder.png'}
                alt={combo.name}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
              />
              {combo.isHot && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <FaFire /> HOT
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-white mb-1">{combo.name}</h3>

              {/* Hiển thị Items */}
              <div className="flex items-start gap-2 text-gray-300 text-sm mb-2 bg-gray-700/30 p-2 rounded-lg">
                <FaListUl className="mt-1 text-orange-500 flex-shrink-0" />
                <span>{combo.items || 'Chưa cập nhật chi tiết món'}</span>
              </div>

              <p className="text-gray-400 text-xs mb-3 line-clamp-2 italic">{combo.description}</p>

              <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-700">
                <span className="text-2xl font-bold text-orange-400">{Number(combo.price).toLocaleString()} đ</span>
                <div className="flex gap-2">
                  <button onClick={() => openModal(combo)} className="p-2 bg-gray-700 hover:bg-blue-600 rounded-lg transition text-white"><FaEdit /></button>
                  <button onClick={() => handleRequestDelete(combo)} className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition text-white"><FaTrash /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-700 p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
              {currentCombo ? 'Cập nhật Combo' : 'Thêm Combo Mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tên */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tên Combo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: Combo Bắp Nước Family"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                />
              </div>

              {/* Items*/}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Chi tiết món (Items)</label>
                <input
                  type="text"
                  name="items"
                  value={formData.items}
                  onChange={handleInputChange}
                  placeholder="VD: 2 Bắp Phô Mai + 2 Pepsi Lớn"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mô tả Combo</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="VD: Thơm ngon, giòn tan, tiết kiệm hơn khi mua combo..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none h-20 resize-none text-white"
                ></textarea>
              </div>

              {/* Giá & Checkbox Hot */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Giá (VNĐ)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-white"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-900 px-3 py-2 rounded-lg border border-gray-700">
                    <input
                      type="checkbox"
                      name="isHot"
                      checked={formData.isHot}
                      onChange={handleInputChange}
                      className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                    />
                    <span className={`font-bold text-sm ${formData.isHot ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {formData.isHot ? '🔥 Đề xuất Hot' : 'Dịch vụ thường'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Upload Ảnh */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Hình ảnh</label>
                <div className="flex items-center gap-4">
                  {/* Khung Preview Ảnh */}
                  <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden border border-gray-600 flex-shrink-0 relative group">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <FaImage size={24} />
                      </div>
                    )}
                  </div>

                  {/* Nút Chọn Ảnh  */}
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold transition shadow-md">
                      <FaImage />
                      <span>Chọn ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                      />
                    </label>

                    {formData.image && formData.image.name && (
                      <p className="text-sm text-white mt-1 truncate max-w-[200px]">
                        📁 {formData.image.name}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-1">Hỗ trợ: JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-white">Hủy</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 font-bold shadow-lg shadow-orange-900/30 transition text-white">
                  {currentCombo ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 1: CẢNH BÁO XÁC NHẬN XÓA --- */}
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
                Bạn có chắc chắn muốn xóa combo này không?
              </p>
              
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex gap-3 items-center">
                 {confirmModal.image ? (
                    <img src={confirmModal.image} alt={confirmModal.name} className="w-12 h-12 rounded object-cover border border-gray-600"/>
                 ) : (
                    <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center text-gray-500 text-xs">No Img</div>
                 )}
                 <div>
                    <h4 className="text-white font-bold">{confirmModal.name}</h4>
                    <p className="text-orange-400 text-sm font-mono">{Number(confirmModal.price).toLocaleString()} đ</p>
                 </div>
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

      {/* --- MODAL 2: THÔNG BÁO KẾT QUẢ CHUNG --- */}
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

export default CombosPage;