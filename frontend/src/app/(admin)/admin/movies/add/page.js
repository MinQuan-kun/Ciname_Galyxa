'use client';
import { toast } from 'react-toastify';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/api/axios'; //
import { FaCloudUploadAlt, FaFilm, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const AddMoviePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    director: '',
    genre: '', 
    duration: '',
    releaseDate: '',
    trailer: '',
    status: 'Đang chiếu' ,
    ageLimit: 'P', 
    note: ''
  });

  // State lưu file ảnh
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  // State để xem trước ảnh (Preview)
  const [previewPoster, setPreviewPoster] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);

  // Xử lý nhập liệu text
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý chọn file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    if (file) {
      if (name === 'poster') {
        setPosterFile(file);
        setPreviewPoster(URL.createObjectURL(file)); // Tạo link xem trước
      } else if (name === 'banner') {
        setBannerFile(file);
        setPreviewBanner(URL.createObjectURL(file));
      }
    }
  };

  // Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Tạo FormData (Bắt buộc khi upload file)
      const data = new FormData();

      // Thêm các trường text
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Thêm file (quan trọng: tên key phải trùng với backend: 'poster', 'banner')
      if (posterFile) data.append('poster', posterFile);
      if (bannerFile) data.append('banner', bannerFile);

      // 2. Gửi API
      // Lưu ý: Không cần set Content-Type thủ công, axios + FormData tự xử lý
      await axiosClient.post('/movies', data);

      toast.success("🎉 Thêm phim mới thành công!");
      router.push('/admin/movies'); // Quay về danh sách phim

    } catch (error) {
      console.error("Lỗi thêm phim:", error);
      toast.error("❌ " + (error.response?.data?.message || "Lỗi thêm phim"));
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
            Thêm Phim Mới
          </h1>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Hàng 1: Tên phim & Đạo diễn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-400 mb-2 text-sm font-bold">Tên phim</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" placeholder="Nhập tên phim..." />
            </div>
            <div>
              <label className="block text-slate-400 mb-2 text-sm font-bold">Đạo diễn</label>
              <input type="text" name="director" value={formData.director} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" placeholder="Tên đạo diễn..." />
            </div>
          </div>

          {/* Hàng 2: Thể loại & Thời lượng & Ngày chiếu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-slate-400 mb-2 text-sm font-bold">Thể loại</label>
              <input type="text" name="genre" value={formData.genre} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" placeholder="Vd: Hành động, Hài..." />
            </div>
            <div>
              <label className="block text-slate-400 mb-2 text-sm font-bold">Thời lượng (phút)</label>
              <input required type="number" name="duration" value={formData.duration} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" placeholder="120" />
            </div>
            <div>
              <label className="block text-slate-400 mb-2 text-sm font-bold">Ngày khởi chiếu</label>
              <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          {/* Hàng 3: Mô tả */}
          <div>
            <label className="block text-slate-400 mb-2 text-sm font-bold">Mô tả nội dung</label>
            <textarea rows="4" name="description" value={formData.description} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" placeholder="Tóm tắt phim..." />
          </div>

          {/* --- Hàng 4: Phân loại & Chú thích --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
             
             {/* Chọn Độ Tuổi */}
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
                <p className="text-xs text-slate-500 mt-1">Chọn đúng theo quy định kiểm duyệt.</p>
             </div>

             {/* Nhập Chú thích */}
             <div>
                <label className="block text-slate-400 mb-2 text-sm font-bold">Chú thích thêm</label>
                <input 
                    type="text" 
                    name="note" 
                    value={formData.note} 
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 focus:border-blue-500 focus:outline-none placeholder-slate-600" 
                    placeholder="VD: Cần mang CCCD, Có cảnh bạo lực..." 
                />
             </div>
          </div>

          {/* Hàng 5: Trailer & Trạng thái */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-400 mb-2 text-sm font-bold">Link Trailer (Youtube)</label>
              <input type="text" name="trailer" value={formData.trailer} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 focus:outline-none" placeholder="https://..." />
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

          {/* KHI VỰC UPLOAD ẢNH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-700 pt-6 mt-6">

            {/* 1. Upload Poster (Dọc) */}
            <div className="space-y-2">
              <label className="block text-slate-400 text-sm font-bold">Poster Phim (Ảnh dọc)</label>
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-800 transition relative group">
                {previewPoster ? (
                  <img src={previewPoster} alt="Poster Preview" className="h-64 object-cover rounded-lg shadow-lg" />
                ) : (
                  <div className="text-center text-slate-500">
                    <FaCloudUploadAlt className="text-4xl mx-auto mb-2" />
                    <p className="text-sm">Kéo thả hoặc click chọn ảnh</p>
                  </div>
                )}
                <input type="file" name="poster" onChange={handleFileChange} accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* 2. Upload Banner (Ngang) */}
            <div className="space-y-2">
              <label className="block text-slate-400 text-sm font-bold">Banner Phim (Ảnh ngang)</label>
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-800 transition relative group h-full">
                {previewBanner ? (
                  <img src={previewBanner} alt="Banner Preview" className="w-full h-40 object-cover rounded-lg shadow-lg" />
                ) : (
                  <div className="text-center text-slate-500">
                    <FaFilm className="text-4xl mx-auto mb-2" />
                    <p className="text-sm">Kéo thả hoặc click chọn Banner</p>
                  </div>
                )}
                <input type="file" name="banner" onChange={handleFileChange} accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Nút Submit */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition flex items-center gap-2"
            >
              {loading ? 'Đang tải lên...' : <><FaSave /> Lưu Phim</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddMoviePage;