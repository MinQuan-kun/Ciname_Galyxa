'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosClient from '@/api/axios';
import { FaPlus, FaTrash, FaSearch, FaEdit } from 'react-icons/fa';
import Pagination from '@/components/Pagination';

const MovieManagementPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // Giới hạn 10 phim

  // --- STATE POPUP MỚI
  const [notification, setNotification] = useState(null); // Thông báo kết quả
  const [confirmModal, setConfirmModal] = useState(null); // Xác nhận xóa

  const fetchMovies = async () => {
    try {
      const res = await axiosClient.get('/movies');
      // Sắp xếp phim mới nhất lên đầu
      const sortedMovies = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMovies(sortedMovies);
    } catch (error) {
      console.error("Lỗi tải danh sách phim:", error);
      setNotification({ type: 'error', title: 'Lỗi', message: 'Không thể tải danh sách phim.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleRequestDelete = (movie) => {
    setConfirmModal(movie);
  };

  // --- 2. THỰC HIỆN XÓA---
  const executeDelete = async () => {
    if (!confirmModal) return;
    try {
      await axiosClient.delete(`/movies/${confirmModal._id}`);
      setNotification({
        type: 'success',
        title: 'Đã xóa',
        message: `Đã xóa phim "${confirmModal.title}" thành công!`
      });
      fetchMovies();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Lỗi xóa',
        message: 'Không thể xóa phim này. Vui lòng thử lại.'
      });
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
      case 'warning': return { bgHeader: 'bg-yellow-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path> };
      default: return { bgHeader: 'bg-blue-600', icon: null };
    }
  };

  // Logic Lọc & Phân trang
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentMovies = filteredMovies.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  return (
    <div className="animate-in fade-in duration-500 bg-gray-900 min-h-screen p-6 text-gray-100 relative">
      {/* Header & Search*/}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Quản lý Phim
          </h1>
          <p className="text-gray-400 text-sm mt-1">Tổng số phim: <span className="text-white font-bold">{movies.length}</span></p>
        </div>
        <Link href="/admin/movies/add" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition">
          <FaPlus /> Thêm Phim Mới
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6 flex items-center gap-3 border border-gray-700 shadow-md">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm tên phim..."
          className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng Danh Sách */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-bold border-b border-gray-700">Poster</th>
                <th className="p-5 font-bold border-b border-gray-700">Tên Phim</th>
                <th className="p-5 font-bold border-b border-gray-700">Thể loại</th>
                <th className="p-5 font-bold border-b border-gray-700">Thời lượng</th>
                <th className="p-5 font-bold border-b border-gray-700">Trạng thái</th>
                <th className="p-5 font-bold border-b border-gray-700 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="text-center p-8 text-gray-400">Đang tải dữ liệu...</td></tr>
              ) : currentMovies.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-gray-400">Không tìm thấy phim nào.</td></tr>
              ) : (
                currentMovies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-gray-700/30 transition duration-200">
                    <td className="p-4">
                      <div className="h-20 w-14 rounded-lg overflow-hidden border border-gray-600 shadow-sm relative group">
                        <img src={movie.poster || "https://via.placeholder.com/150"} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      </div>
                    </td>
                    <td className="p-4">
                      <h3 className="font-bold text-white text-lg">{movie.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{movie.director}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}
                    </td>
                    <td className="p-4 text-sm text-gray-300">{movie.duration} phút</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${movie.status === 'Đang chiếu' ? 'bg-green-500/10 text-green-400 border-green-500/20' : movie.status === 'Sắp chiếu' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {movie.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <Link href={`/admin/movies/edit/${movie._id}`} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-2 rounded-lg transition hover:bg-blue-500/20" title="Sửa">
                          <FaEdit />
                        </Link>
                        <button onClick={() => handleRequestDelete(movie)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-2 rounded-lg transition hover:bg-red-500/20" title="Xóa">
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

        {/* Pagination  */}
        <div className="p-4 border-t border-gray-700 bg-gray-900/30">
          <Pagination
            totalItems={filteredMovies.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* --- MODAL 1: CẢNH BÁO XÁC NHẬN XÓA --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-800 border border-red-500/50 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">

            <div className="bg-red-600/90 p-4 flex items-center gap-3">
              <div className="bg-white text-red-600 rounded-full p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-white font-bold text-lg">Xác nhận xóa phim?</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                Bạn có chắc chắn muốn xóa bộ phim này không?
              </p>

              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex gap-4 items-start">
                {/* Ảnh Poster trong Popup */}
                <div className="w-16 h-24 flex-shrink-0 rounded-md overflow-hidden border border-gray-600">
                  <img
                    src={confirmModal.poster || "https://via.placeholder.com/150"}
                    alt={confirmModal.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">{confirmModal.title}</h4>
                  <p className="text-xs text-gray-400">Đạo diễn: {confirmModal.director}</p>
                  <p className="text-xs text-gray-400">Thời lượng: {confirmModal.duration} phút</p>
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

export default MovieManagementPage;