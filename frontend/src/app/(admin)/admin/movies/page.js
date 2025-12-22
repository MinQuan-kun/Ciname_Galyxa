'use client';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosClient from '@/api/axios';
import { FaPlus, FaTrash, FaSearch, FaEdit } from 'react-icons/fa';
// 1. Import Pagination
import Pagination from '@/components/Pagination';

const MovieManagementPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 2. State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // Giới hạn 10 phim

  const fetchMovies = async () => {
    try {
      const res = await axiosClient.get('/movies');
      // Sắp xếp phim mới nhất lên đầu
      const sortedMovies = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMovies(sortedMovies);
    } catch (error) {
      console.error("Lỗi tải danh sách phim:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phim này không?")) {
      try {
        await axiosClient.delete(`/movies/${id}`);
        toast.success("Đã xóa phim!", { icon: "🗑️" });
        fetchMovies();
      } catch (error) {
        toast.error("Xóa thất bại");
      }
    }
  };

  // 3. Logic Lọc & Phân trang
  // B1: Lọc theo từ khóa tìm kiếm trước
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // B2: Tính toán vị trí cắt mảng (cho trang hiện tại)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentMovies = filteredMovies.slice(indexOfFirstItem, indexOfLastItem);

  // B3: Reset về trang 1 nếu người dùng tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  return (
    <div className="animate-in fade-in duration-500">
      {/* Header & Search (Giữ nguyên) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Quản lý Phim
          </h1>
          <p className="text-slate-400 text-sm mt-1">Tổng số phim: <span className="text-white font-bold">{movies.length}</span></p>
        </div>
        <Link href="/admin/movies/add" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition">
          <FaPlus /> Thêm Phim Mới
        </Link>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl mb-6 flex items-center gap-3 border border-slate-700 shadow-md">
        <FaSearch className="text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm tên phim..."
          className="bg-transparent border-none outline-none text-white w-full placeholder-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng Danh Sách */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-bold border-b border-slate-700">Poster</th>
                <th className="p-5 font-bold border-b border-slate-700">Tên Phim</th>
                <th className="p-5 font-bold border-b border-slate-700">Thể loại</th>
                <th className="p-5 font-bold border-b border-slate-700">Thời lượng</th>
                <th className="p-5 font-bold border-b border-slate-700">Trạng thái</th>
                <th className="p-5 font-bold border-b border-slate-700 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="text-center p-8 text-slate-400">Đang tải dữ liệu...</td></tr>
              ) : currentMovies.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-slate-400">Không tìm thấy phim nào.</td></tr>
              ) : (
                currentMovies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-slate-700/30 transition duration-200">
                    <td className="p-4">
                      <div className="h-20 w-14 rounded-lg overflow-hidden border border-slate-600 shadow-sm relative group">
                        <img src={movie.poster || "https://via.placeholder.com/150"} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      </div>
                    </td>
                    <td className="p-4">
                      <h3 className="font-bold text-white text-lg">{movie.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{movie.director}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}
                    </td>
                    <td className="p-4 text-sm text-slate-300">{movie.duration} phút</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${movie.status === 'Đang chiếu' ? 'bg-green-500/10 text-green-400 border-green-500/20' : movie.status === 'Sắp chiếu' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {movie.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-3">
                        <Link href={`/admin/movies/edit/${movie._id}`} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-2 rounded-lg transition hover:bg-blue-500/20"><FaEdit /></Link>
                        <button onClick={() => handleDelete(movie._id)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-2 rounded-lg transition hover:bg-red-500/20"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination  */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
            <Pagination 
                totalItems={filteredMovies.length} 
                itemsPerPage={ITEMS_PER_PAGE} 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
            />
        </div>
      </div>
    </div>
  );
};

export default MovieManagementPage;