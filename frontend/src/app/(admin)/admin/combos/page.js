'use client';

import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
// SỬA: Thay FaPopcorn bằng FaHamburger (vì fa không có popcorn)
import { FaPlus, FaTrash, FaUtensils, FaImage, FaHamburger } from 'react-icons/fa';

const CombosPage = () => {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', items: '' });
    const [imageFile, setImageFile] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);

    // 1. Fetch dữ liệu
    const fetchCombos = async () => {
        try {
            const res = await axiosClient.get('/combos');
            setCombos(res.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách Combo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCombos(); }, []);

    // 2. Xử lý Ảnh Preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImg(URL.createObjectURL(file));
        }
    };

    // 3. Submit Form Tạo Mới
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('price', formData.price);
            payload.append('items', formData.items);
            if (imageFile) payload.append('image', imageFile);

            await axiosClient.post('/combos', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Thêm Combo thành công! 🍿");
            setIsModalOpen(false);

            // Reset Form
            setFormData({ name: '', price: '', items: '' });
            setImageFile(null);
            setPreviewImg(null);

            fetchCombos(); // Reload list
        } catch (error) {
            toast.error("Lỗi tạo combo");
        }
    };

    // 4. Xử lý Xóa
    const handleDelete = async (id) => {
        if (window.confirm("Bạn muốn xóa gói Combo này?")) {
            try {
                await axiosClient.delete(`/combos/${id}`);
                setCombos(combos.filter(c => c._id !== id));
                toast.success("Đã xóa!");
            } catch (error) {
                toast.error("Xóa thất bại");
            }
        }
    };

    return (
        <div className="animate-in fade-in duration-500">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 uppercase drop-shadow-sm">
                        QUẢN LÝ DỊCH VỤ & COMBO
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Thiết lập các gói bắp nước bán kèm</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition"
                >
                    <FaPlus /> Thêm Gói Mới
                </button>
            </div>

            {/* DANH SÁCH COMBO (GRID VIEW) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-slate-500 col-span-3 text-center">Đang tải dữ liệu...</p>
                ) : combos.length === 0 ? (
                    <div className="col-span-3 bg-slate-800 p-8 rounded-xl text-center border border-dashed border-slate-700">
                        {/* Thay FaPopcorn bằng FaHamburger */}
                        <FaHamburger className="text-6xl text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Chưa có gói combo nào.</p>
                    </div>
                ) : (
                    combos.map((item) => (
                        <div key={item._id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg group hover:border-orange-500 transition relative">
                            {/* Ảnh Combo */}
                            <div className="h-48 overflow-hidden relative bg-slate-900">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <FaImage size={40} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-orange-400 font-bold px-3 py-1 rounded-lg border border-orange-500/30">
                                    {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                                </div>
                            </div>

                            {/* Nội dung */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-sm text-slate-400 flex items-start gap-2 h-10 line-clamp-2">
                                    <FaUtensils className="mt-1 shrink-0 text-slate-500" /> {item.items}
                                </p>

                                {/* Action Buttons */}
                                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="text-red-400 hover:text-white hover:bg-red-500 px-3 py-2 rounded-lg transition text-sm font-bold flex items-center gap-1"
                                    >
                                        <FaTrash /> Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- MODAL THÊM COMBO --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Thêm Combo Mới</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Tên Combo */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-1 font-bold">Tên Combo</label>
                                <input
                                    type="text" required placeholder="VD: Combo Couple (2 người)"
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Chi tiết vật phẩm */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-1 font-bold">Chi tiết (Bắp, Nước...)</label>
                                <input
                                    type="text" required placeholder="VD: 1 Bắp Phô mai lớn + 2 Coca vừa"
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                    value={formData.items} onChange={e => setFormData({ ...formData, items: e.target.value })}
                                />
                            </div>

                            {/* Giá bán */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-1 font-bold">Giá bán (VNĐ)</label>
                                <input
                                    type="number" required min="0"
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>

                            {/* Upload Ảnh */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-1 font-bold">Hình ảnh minh họa</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white text-sm transition">
                                        Chọn ảnh...
                                        <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                                    </label>
                                    {previewImg && (
                                        <img src={previewImg} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-500" />
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border border-slate-600 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-800">Hủy</button>
                                <button type="submit" className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-xl shadow-lg">Lưu Combo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CombosPage;