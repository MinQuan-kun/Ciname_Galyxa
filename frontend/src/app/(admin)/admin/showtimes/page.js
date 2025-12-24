'use client';
import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';

// 1. ĐỊNH NGHĨA BẢNG GIÁ THEO LOẠI PHÒNG
const ROOM_PRICES = {
  'Standard': 60000,
  'IMAX': 90000,
  '4DX': 100000,
  'Gold Class': 120000, // Tự thêm
  'Sweetbox': 80000     // Tự thêm
};

const ShowtimesPage = () => {
  // --- STATE ---
  const [movies, setMovies] = useState([]);       
  const [rooms, setRooms] = useState([]);         
  const [groupedShowtimes, setGroupedShowtimes] = useState([]); 
  
  const [selectedMovieId, setSelectedMovieId] = useState('ALL'); 
  const [loading, setLoading] = useState(false);
  
  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentShowtimeId, setCurrentShowtimeId] = useState(null);
  
  // State Popup
  const [notification, setNotification] = useState(null); 
  const [confirmModal, setConfirmModal] = useState(null); 
  
  const [formData, setFormData] = useState({
    movieId: '',
    roomId: '',
    startTime: '',
    ticketPrice: 0 // Mặc định 0, sẽ tự tính khi mở modal
  });

  // --- API CALLS ---
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [resMovies, resRooms] = await Promise.all([
          axiosClient.get('/movies'),
          axiosClient.get('/rooms')
        ]);
        
        setMovies(resMovies.data);
        setRooms(resRooms.data);

        fetchShowtimes('ALL');
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };
    fetchInitData();
  }, []);

  const fetchShowtimes = async (movieId) => {
    setLoading(true);
    try {
      let data = [];
      if (movieId === 'ALL' || !movieId) {
        const res = await axiosClient.get('/showtimes');
        data = res.data;
      } else {
        const res = await axiosClient.get(`/showtimes/${movieId}`);
        const flatList = res.data;
        const currentMovie = movies.find(m => m._id === movieId);
        if (flatList.length > 0 || currentMovie) {
            data = [{
                movie: currentMovie || { title: 'Unknown Movie' },
                showtimes: flatList
            }];
        }
      }
      setGroupedShowtimes(data);
    } catch (error) {
      setGroupedShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const movieId = e.target.value;
    setSelectedMovieId(movieId);
    fetchShowtimes(movieId);
  };

  // --- XỬ LÝ CHỌN PHÒNG ĐỂ TỰ TÍNH GIÁ ---
  const handleRoomChange = (e) => {
    const newRoomId = e.target.value;
    
    // Tìm thông tin phòng vừa chọn trong danh sách rooms
    const selectedRoom = rooms.find(r => r._id === newRoomId);
    
    // Lấy giá dựa trên loại phòng, nếu không có trong list thì mặc định 60k
    const newPrice = selectedRoom ? (ROOM_PRICES[selectedRoom.type] || 60000) : 0;

    setFormData({
        ...formData,
        roomId: newRoomId,
        ticketPrice: newPrice
    });
  };

  // --- CRUD HANDLERS ---

  const openModal = (showtime = null, preSelectedMovieId = null) => {
    if (showtime) {
      // --- CHẾ ĐỘ SỬA ---
      setIsEditing(true);
      setCurrentShowtimeId(showtime._id);
      const localDate = new Date(showtime.startTime);
      localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
      
      setFormData({
        movieId: showtime.movieId._id || showtime.movieId, 
        roomId: showtime.roomId._id || showtime.roomId,
        startTime: localDate.toISOString().slice(0, 16),
        ticketPrice: showtime.ticketPrice
      });
    } else {
      // --- CHẾ ĐỘ THÊM MỚI ---
      setIsEditing(false);
      
      // Xác định phòng mặc định (phòng đầu tiên trong danh sách)
      const defaultRoomId = rooms.length > 0 ? rooms[0]._id : '';
      const defaultRoom = rooms.find(r => r._id === defaultRoomId);
      const defaultPrice = defaultRoom ? (ROOM_PRICES[defaultRoom.type] || 60000) : 0;

      setFormData({
        movieId: (selectedMovieId !== 'ALL' ? selectedMovieId : (preSelectedMovieId || '')), 
        roomId: defaultRoomId,
        startTime: '',
        ticketPrice: defaultPrice // Tự điền giá của phòng đầu tiên
      });
    }
    setIsModalOpen(true);
  };

  // --- XỬ LÝ LƯU (SAVE) ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.movieId || !formData.roomId || !formData.startTime) {
      setNotification({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }

    try {
      const url = isEditing 
        ? `/showtimes/${currentShowtimeId}`
        : '/showtimes';
      
      if (isEditing) {
          await axiosClient.put(url, formData);
      } else {
          await axiosClient.post(url, formData);
      }

      setNotification({ 
        type: 'success', 
        title: 'Thành công', 
        message: isEditing ? "Cập nhật lịch chiếu thành công!" : "Tạo lịch chiếu mới thành công!" 
      });
      setIsModalOpen(false);
      fetchShowtimes(selectedMovieId);

    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      setNotification({ type: 'error', title: 'Lỗi', message: msg });
    }
  };

  const handleRequestDelete = (show, movieTitle) => {
      setConfirmModal({
          id: show._id,
          movieTitle: movieTitle,
          roomName: show.roomId?.name || "Phòng đã xóa",
          startTime: show.startTime,
          ticketPrice: show.ticketPrice
      });
  };

  const executeDelete = async () => {
    if (!confirmModal) return;

    try {
      await axiosClient.delete(`/showtimes/${confirmModal.id}`);
      setNotification({ type: 'success', title: 'Đã xóa', message: 'Đã xóa suất chiếu thành công!' });
      fetchShowtimes(selectedMovieId);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      setNotification({ type: 'error', title: 'Không thể xóa', message: msg });
    } finally {
        setConfirmModal(null); 
    }
  };

  const closeNotification = () => setNotification(null);
  const closeConfirmModal = () => setConfirmModal(null);

  // --- HELPER FORMAT ---
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const calculateEndTime = (startTime, duration) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (duration || 0) * 60000);
    return end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getPopupStyles = (type) => {
    switch(type) {
        case 'success': return { bgHeader: 'bg-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path> };
        case 'error': return { bgHeader: 'bg-red-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path> };
        case 'warning': return { bgHeader: 'bg-yellow-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path> };
        default: return { bgHeader: 'bg-blue-600', icon: null };
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100 font-sans relative">
      
      {/* HEADER */}
      <header className="mb-8 border-b border-gray-700 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Quản lý Lịch Chiếu
          </h1>
          <p className="text-gray-400 text-sm mt-1">Xem và sắp xếp lịch chiếu cho toàn bộ hệ thống.</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition flex items-center gap-2"
        >
          <span>+</span> Thêm Suất Chiếu
        </button>
      </header>

      {/* FILTER */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 flex flex-col md:flex-row items-center gap-4 shadow-md">
        <span className="text-orange-400 font-bold whitespace-nowrap">Lọc theo phim:</span>
        <select 
          value={selectedMovieId}
          onChange={handleFilterChange}
          className="bg-gray-900 text-white border border-gray-600 rounded px-3 py-2 outline-none focus:border-orange-500 w-full md:max-w-md cursor-pointer"
        >
          <option value="ALL">-- Tất cả phim (A-Z) --</option>
          {movies.map(movie => (
            <option key={movie._id} value={movie._id}>
              {movie.title} - ({movie.duration} phút)
            </option>
          ))}
        </select>
      </div>

      {/* DANH SÁCH SHOWTIMES */}
      <div className="space-y-8">
        {loading ? (
            <p className="text-center text-gray-400 py-8">Đang tải dữ liệu...</p>
        ) : groupedShowtimes.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border border-gray-700 rounded-xl bg-gray-800">
                <span className="text-4xl mb-2 block">🎬</span>
                <p>Không có lịch chiếu nào để hiển thị.</p>
            </div>
        ) : (
            groupedShowtimes.map((group) => (
                <div key={group.movie._id} className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 border-b border-gray-600 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {group.movie.poster && (
                                <img src={group.movie.poster} alt={group.movie.title} className="w-10 h-14 object-cover rounded border border-gray-500"/>
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-orange-400">{group.movie.title}</h3>
                                <p className="text-xs text-gray-400">Thời lượng: {group.movie.duration} phút</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => openModal(null, group.movie._id)}
                            className="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-white transition"
                        >
                            + Thêm lịch cho phim này
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {group.showtimes.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500 italic">Chưa có lịch chiếu.</p>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-700/50 text-gray-400 text-xs uppercase">
                                        <th className="p-3 border-b border-gray-600">Phòng Chiếu</th>
                                        <th className="p-3 border-b border-gray-600">Ngày Chiếu</th>
                                        <th className="p-3 border-b border-gray-600">Thời gian</th>
                                        <th className="p-3 border-b border-gray-600">Giá Vé</th>
                                        <th className="p-3 border-b border-gray-600 text-center">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {group.showtimes.map((show) => {
                                        const { date, time } = formatDateTime(show.startTime);
                                        const endTime = calculateEndTime(show.startTime, group.movie.duration);
                                        return (
                                            <tr key={show._id} className="hover:bg-gray-700/30 transition text-sm">
                                                <td className="p-3 font-medium text-white">
                                                    {show.roomId?.name || 'Phòng đã xóa'} 
                                                    <span className="ml-2 text-[10px] bg-gray-600 px-1.5 py-0.5 rounded text-gray-200">{show.roomId?.type}</span>
                                                </td>
                                                <td className="p-3 text-gray-300">{date}</td>
                                                <td className="p-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-orange-300">{time}</span>
                                                        <span className="text-[10px] text-gray-500">Kết thúc: {endTime}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-green-400 font-medium">
                                                    {show.ticketPrice?.toLocaleString('vi-VN')} đ
                                                </td>
                                                <td className="p-3 flex justify-center gap-2">
                                                    <button onClick={() => openModal({...show, movieId: group.movie}, null)} className="text-blue-400 hover:bg-blue-900/30 p-1.5 rounded transition" title="Sửa">✏️</button>
                                                    <button onClick={() => handleRequestDelete(show, group.movie.title)} className="text-red-400 hover:bg-red-900/30 p-1.5 rounded transition" title="Xóa">🗑️</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>

      {/* MODAL FORM (THÊM/SỬA) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-600 animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Chỉnh Sửa Lịch Chiếu' : 'Thêm Lịch Chiếu Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Phim</label>
                <select required value={formData.movieId} onChange={(e) => setFormData({...formData, movieId: e.target.value})} className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-orange-500">
                  <option value="">-- Chọn Phim --</option>
                  {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Phòng Chiếu</label>
                <select 
                    required 
                    value={formData.roomId} 
                    // SỬA: Gọi handleRoomChange thay vì setFormData trực tiếp
                    onChange={handleRoomChange} 
                    className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-orange-500"
                >
                  <option value="">-- Chọn Phòng --</option>
                  {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Thời gian bắt đầu</label>
                  <input type="datetime-local" required value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Giá vé (VNĐ)</label>
                  {/* SỬA: Thêm readOnly và class visual */}
                  <input 
                    type="number" 
                    required 
                    value={formData.ticketPrice} 
                    readOnly 
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 outline-none cursor-not-allowed font-bold" 
                  />
                  <p className="text-[10px] text-gray-500 mt-1 italic">* Giá vé tự động theo loại phòng</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-700 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">Hủy bỏ</button>
                <button type="submit" className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-lg transition">{isEditing ? 'Lưu Thay Đổi' : 'Tạo Lịch'}</button>
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
              <h3 className="text-white font-bold text-lg">Xác nhận xóa lịch chiếu?</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-300">Bạn có chắc chắn muốn xóa suất chiếu này không?</p>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-2">
                 <div className="flex justify-between"><span className="text-gray-500 text-sm">Phim:</span><span className="text-white font-bold text-right w-2/3">{confirmModal.movieTitle}</span></div>
                 <div className="flex justify-between"><span className="text-gray-500 text-sm">Phòng:</span><span className="text-orange-300 font-bold">{confirmModal.roomName}</span></div>
                 <div className="flex justify-between"><span className="text-gray-500 text-sm">Thời gian:</span><span className="text-green-400 font-mono">{new Date(confirmModal.startTime).toLocaleString('vi-VN')}</span></div>
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

export default ShowtimesPage;