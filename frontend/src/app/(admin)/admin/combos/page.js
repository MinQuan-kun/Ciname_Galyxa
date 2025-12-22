'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaHamburger, FaSave, FaTimes } from 'react-icons/fa';

const ComboPage = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Form
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    items: '',
    image: ''
  });

  // State quản lý chế độ Sửa
  const [isEditing, setIsEditing] = useState(false);
  const [currentComboId, setCurrentComboId] = useState(null);

  // 1. Lấy danh sách Combo
  const fetchCombos = async () => {
    try {
      const res = await axiosClient.get('/combos');
      setCombos(res.data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  // 2. Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Xử lý Submit (Thêm mới HOẶC Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.name || !formData.price) {
        return toast.warn("Vui lòng nhập tên và giá combo!");
    }

    try {
      if (isEditing) {
        // --- LOGIC CẬP NHẬT (PUT) ---
        await axiosClient.put(`/combos/${currentComboId}`, formData);
        toast.success("Đã cập nhật Combo thành công!");
      } else {
        // --- LOGIC THÊM MỚI (POST) ---
        await axiosClient.post('/combos', formData);
        toast.success("Đã thêm Combo mới!");
      }

      // Reset form và load lại danh sách
      resetForm();
      fetchCombos();

    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // 4. Chức năng Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa combo này?")) {
      try {
        await axiosClient.delete(`/combos/${id}`);
        toast.success("Đã xóa combo!");
        fetchCombos();
      } catch (error) {
        toast.error("Xóa thất bại");
      }
    }
  };

  // 5. Chức năng Chuyển sang chế độ Sửa
  const handleEdit = (combo) => {
      setIsEditing(true);
      setCurrentComboId(combo._id);
      setFormData({
          name: combo.name,
          price: combo.price,
          items: combo.items || '',
          image: combo.image || ''
      });
      // Cuộn trang lên đầu để thấy form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 6. Hủy bỏ chế độ Sửa / Reset Form
  const resetForm = () => {
      setIsEditing(false);
      setCurrentComboId(null);
      setFormData({ name: '', price: '', items: '', image: '' });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
            Quản lý Combo & Bắp Nước
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- FORM NHẬP LIỆU (Bên trái) --- */}
        <div className="lg:col-span-1">
            <div className={`bg-slate-800 p-6 rounded-2xl border ${isEditing ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-slate-700'} sticky top-24`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isEditing ? 'text-orange-500' : 'text-white'}`}>
                    {isEditing ? <FaEdit /> : <FaPlus />} 
                    {isEditing ? 'Cập Nhật Combo' : 'Thêm Combo Mới'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Tên Combo</label>
                        <input 
                            type="text" name="name" 
                            value={formData.name} onChange={handleChange}
                            placeholder="VD: Combo Solo, Family..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Giá bán (VNĐ)</label>
                        <input 
                            type="number" name="price" 
                            value={formData.price} onChange={handleChange}
                            placeholder="VD: 89000" 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Chi tiết món</label>
                        <textarea 
                            name="items" rows="3"
                            value={formData.items} onChange={handleChange}
                            placeholder="VD: 1 Bắp ngọt lớn + 2 Pepsi vừa..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Link Ảnh (URL)</label>
                        <input 
                            type="text" name="image" 
                            value={formData.image} onChange={handleChange}
                            placeholder="https://..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition"
                        />
                    </div>

                    {/* Nút Submit & Cancel */}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${isEditing ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                            {isEditing ? <><FaSave/> Lưu Lại</> : <><FaPlus/> Thêm Mới</>}
                        </button>
                        
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={resetForm}
                                className="px-4 rounded-xl font-bold bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>

        {/* --- DANH SÁCH COMBO (Bên phải) --- */}
        <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="p-4">Hình ảnh</th>
                            <th className="p-4">Tên & Chi tiết</th>
                            <th className="p-4">Giá bán</th>
                            <th className="p-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {loading ? (
                             <tr><td colSpan="4" className="text-center p-6 text-slate-500">Đang tải...</td></tr>
                        ) : combos.length === 0 ? (
                             <tr><td colSpan="4" className="text-center p-6 text-slate-500">Chưa có combo nào.</td></tr>
                        ) : (
                            combos.map((combo) => (
                                <tr key={combo._id} className="group hover:bg-slate-700/30 transition">
                                    <td className="p-4">
                                        <img 
                                            src={combo.image || "https://via.placeholder.com/80"} 
                                            alt={combo.name} 
                                            className="w-16 h-16 object-cover rounded-lg border border-slate-600 bg-slate-900"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <h3 className="font-bold text-white text-lg">{combo.name}</h3>
                                        <p className="text-slate-400 text-sm">{combo.items}</p>
                                    </td>
                                    <td className="p-4 font-bold text-orange-400">
                                        {new Intl.NumberFormat('vi-VN').format(combo.price)}đ
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            {/* Nút Sửa */}
                                            <button 
                                                onClick={() => handleEdit(combo)}
                                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition border border-blue-500/20"
                                                title="Sửa combo này"
                                            >
                                                <FaEdit />
                                            </button>
                                            
                                            {/* Nút Xóa */}
                                            <button 
                                                onClick={() => handleDelete(combo._id)}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition border border-red-500/20"
                                                title="Xóa combo này"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ComboPage;