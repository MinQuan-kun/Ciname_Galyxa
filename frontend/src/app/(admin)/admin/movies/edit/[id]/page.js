'use client';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import axiosClient from '@/api/axios';
import { FaCloudUploadAlt, FaFilm, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const EditMoviePage = () => {
    const router = useRouter();
    const { id } = useParams(); // Lấy ID phim từ URL
    const [loading, setLoading] = useState(false);

    // State form
    const [formData, setFormData] = useState({
        title: '', description: '', director: '', genre: '',
        duration: '', releaseDate: '', trailer: '', status: 'Đang chiếu',
        ageLimit: 'P', 
        note: ''
    });

    // State ảnh (File mới & Link ảnh cũ để preview)
    const [posterFile, setPosterFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [previewPoster, setPreviewPoster] = useState(null);
    const [previewBanner, setPreviewBanner] = useState(null);

    // 1. TẢI DỮ LIỆU CŨ LÊN FORM
    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                const res = await axiosClient.get(`/movies/${id}`);
                const movie = res.data;

                // Format lại dữ liệu cho đúng form
                setFormData({
                    title: movie.title,
                    description: movie.description,
                    director: movie.director,
                    // Chuyển mảng genre ["A", "B"] thành chuỗi "A, B"
                    genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
                    duration: movie.duration,
                    // Chuyển ngày Date ISO sang định dạng YYYY-MM-DD cho input date
                    releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
                    trailer: movie.trailer || '',
                    status: movie.status,
                    ageLimit: movie.ageLimit || 'P',
                    note: movie.note || ''
                });

                // Set ảnh cũ vào preview
                setPreviewPoster(movie.poster);
                setPreviewBanner(movie.banner);

            } catch (error) {
                console.error("Lỗi lấy thông tin phim:", error);
                toast.warn("Không tìm thấy tên phim");
                router.push('/admin/movies');
            }
        };
        if (id) fetchMovieData();
    }, [id, router]);


    // Xử lý nhập liệu
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Xử lý chọn file ảnh mới
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const name = e.target.name;
        if (file) {
            if (name === 'poster') {
                setPosterFile(file);
                setPreviewPoster(URL.createObjectURL(file));
            } else if (name === 'banner') {
                setBannerFile(file);
                setPreviewBanner(URL.createObjectURL(file));
            }
        }
    };

    // 2. GỬI DỮ LIỆU CẬP NHẬT (PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));

            // Chỉ append file nếu người dùng có chọn ảnh mới
            if (posterFile) data.append('poster', posterFile);
            if (bannerFile) data.append('banner', bannerFile);

            await axiosClient.put(`/movies/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success("💾 Cập nhật thông tin phim thành công!");
            router.push('/admin/movies');

        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            toast.error("❌ Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-right-10 duration-500">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/movies" className="bg-slate-800 p-3 rounded-full hover:bg-slate-700 transition">
                        <FaArrowLeft />
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Chỉnh Sửa Phim
                    </h1>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Các ô input giống hệt trang Add (Title, Director...) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm font-bold">Tên phim</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm font-bold">Đạo diễn</label>
                            <input type="text" name="director" value={formData.director} onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm font-bold">Thể loại</label>
                            <input type="text" name="genre" value={formData.genre} onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm font-bold">Thời lượng (phút)</label>
                            <input required type="number" name="duration" value={formData.duration} onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm font-bold">Ngày khởi chiếu</label>
                            <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 mb-2 text-sm font-bold">Mô tả nội dung</label>
                        <textarea rows="4" name="description" value={formData.description} onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" />
                    </div>

                    {/* Trailer & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm font-bold">Link Trailer</label>
                            <input type="text" name="trailer" value={formData.trailer} onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm font-bold">Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none text-white">
                                <option value="Sắp chiếu">Sắp chiếu</option>
                                <option value="Đang chiếu">Đang chiếu</option>
                                <option value="Đã kết thúc">Đã kết thúc</option>
                            </select>
                        </div>
                    </div>

                    {/* --- RATE & NOTE --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm font-bold flex items-center gap-2">
                                Phân loại độ tuổi <span className="text-red-500">*</span>
                            </label>
                            <select 
                                name="ageLimit" 
                                value={formData.ageLimit} 
                                onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 focus:border-blue-500 focus:outline-none text-white font-bold"
                            >
                                <option value="P">P - Mọi lứa tuổi</option>
                                <option value="K">K - Dưới 13t có người giám hộ</option>
                                <option value="T13">T13 - Cấm dưới 13 tuổi</option>
                                <option value="T16">T16 - Cấm dưới 16 tuổi</option>
                                <option value="T18">T18 - Cấm dưới 18 tuổi</option>
                                <option value="C">C - Cấm phổ biến</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-2 text-sm font-bold">Chú thích thêm</label>
                            <input 
                                type="text" 
                                name="note" 
                                value={formData.note} 
                                onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 focus:border-blue-500 focus:outline-none" 
                                placeholder="VD: Cần mang CCCD..." 
                            />
                        </div>
                    </div>

                    {/* KHU VỰC ẢNH */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-700 pt-6 mt-6">
                        <div className="space-y-2">
                            <label className="block text-slate-400 text-sm font-bold">Poster Phim</label>
                            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-800 transition relative group">
                                {previewPoster ? (
                                    <img src={previewPoster} alt="Preview" className="h-64 object-cover rounded-lg shadow-lg" />
                                ) : (
                                    <div className="text-center text-slate-500">
                                        <FaCloudUploadAlt className="text-4xl mx-auto mb-2" />
                                        <p className="text-sm">Chưa có ảnh</p>
                                    </div>
                                )}
                                <input type="file" name="poster" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                <div className="absolute bottom-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Bấm để thay đổi</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-slate-400 text-sm font-bold">Banner Phim</label>
                            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-800 transition relative group h-full">
                                {previewBanner ? (
                                    <img src={previewBanner} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow-lg" />
                                ) : (
                                    <div className="text-center text-slate-500">
                                        <FaFilm className="text-4xl mx-auto mb-2" />
                                        <p className="text-sm">Chưa có banner</p>
                                    </div>
                                )}
                                <input type="file" name="banner" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                <div className="absolute bottom-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Bấm để thay đổi</div>
                            </div>
                        </div>
                    </div>

                    

                    {/* Nút Submit */}
                    <div className="flex justify-end pt-6">
                        <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition flex items-center gap-2">
                            {loading ? 'Đang cập nhật...' : <><FaSave /> Lưu Thay Đổi</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditMoviePage;