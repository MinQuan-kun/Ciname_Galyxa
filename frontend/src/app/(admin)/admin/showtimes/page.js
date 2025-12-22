// Minh hoàng
// Gợi ý: hiển thị column gồm tên phim/ rạp/ ngày/ giờ chiếu/ giá vé và cột hành động xóa sửa
// hoặc làm 1 cái bảng như google calender để 1 lần chỉnh cho cả 1 tuần hoặc cả tháng


'use client';
import React, { useState, useEffect } from 'react';

const ShowtimesPage = () => {
  // --- STATE ---
  const [movies, setMovies] = useState([]);      // Danh sách phim (để chọn)
  const [rooms, setRooms] = useState([]);        // Danh sách phòng (để chọn)
  const [showtimes, setShowtimes] = useState([]); // Danh sách lịch chiếu
  
  const [selectedMovieId, setSelectedMovieId] = useState(''); // Phim đang được chọn xem lịch
  const [loading, setLoading] = useState(false);
  
  // State cho Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentShowtimeId, setCurrentShowtimeId] = useState(null);
  
  const [formData, setFormData] = useState({
    movieId: '',
    roomId: '',
    startTime: '', // Format: YYYY-MM-DDTHH:mm
    ticketPrice: 75000
  });

  // --- API CALLS ---

  // 1. Lấy danh sách Phim và Phòng (Chạy 1 lần khi load trang)
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [resMovies, resRooms] = await Promise.all([
          fetch('http://localhost:5001/api/movies'),
          fetch('http://localhost:5001/api/rooms')
        ]);
        
        if (resMovies.ok) setMovies(await resMovies.json());
        if (resRooms.ok) setRooms(await resRooms.json());
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };
    fetchInitData();
  }, []);

  // 2. Lấy lịch chiếu khi chọn phim (Controller yêu cầu movieId)
  const fetchShowtimes = async (movieId) => {
    if (!movieId) return;
    setLoading(true);
    try {
      // Gọi API: GET /api/showtimes/:movieId
      const res = await fetch(`http://localhost:5001/api/showtimes/${movieId}`);
      const data = await res.json();
      if (res.ok) {
        setShowtimes(data);
      } else {
        setShowtimes([]);
      }
    } catch (error) {
      console.error("Lỗi tải lịch chiếu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Khi người dùng chọn phim khác từ dropdown filter
  const handleFilterChange = (e) => {
    const movieId = e.target.value;
    setSelectedMovieId(movieId);
    if (movieId) {
      fetchShowtimes(movieId);
    } else {
      setShowtimes([]);
    }
  };

  // --- XỬ LÝ FORM (CRUD) ---

  const openModal = (showtime = null) => {
    if (showtime) {
      // Chế độ Sửa
      setIsEditing(true);
      setCurrentShowtimeId(showtime._id);
      // Convert startTime sang format input datetime-local (YYYY-MM-DDTHH:mm)
      const localDate = new Date(showtime.startTime);
      localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
      
      setFormData({
        movieId: showtime.movieId._id, // Vì populate nên movieId là object
        roomId: showtime.roomId._id,   // Vì populate nên roomId là object
        startTime: localDate.toISOString().slice(0, 16),
        ticketPrice: showtime.ticketPrice
      });
    } else {
      // Chế độ Thêm mới
      setIsEditing(false);
      setFormData({
        movieId: selectedMovieId || '', // Tự điền phim đang chọn
        roomId: rooms.length > 0 ? rooms[0]._id : '',
        startTime: '',
        ticketPrice: 75000
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.movieId || !formData.roomId || !formData.startTime) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const url = isEditing 
        ? `http://localhost:5001/api/showtimes/${currentShowtimeId}`
        : 'http://localhost:5001/api/showtimes';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Gửi cookie token
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert(isEditing ? "Cập nhật thành công!" : "Tạo lịch chiếu thành công!");
        setIsModalOpen(false);
        // Refresh lại danh sách theo phim đang chọn hoặc phim vừa thêm
        fetchShowtimes(selectedMovieId || formData.movieId);
        if (!selectedMovieId) setSelectedMovieId(formData.movieId);
      } else {
        alert(`Lỗi: ${data.message}`); // Hiển thị lỗi trùng lịch từ backend
      }
    } catch (error) {
      alert("Lỗi kết nối server: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) return;
    try {
      const res = await fetch(`http://localhost:5001/api/showtimes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Đã xóa thành công!");
        fetchShowtimes(selectedMovieId);
      } else {
        alert(`Lỗi: ${data.message}`); // VD: Đã có người đặt vé
      }
    } catch (error) {
      alert("Lỗi khi xóa: " + error.message);
    }
  };

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
    const end = new Date(start.getTime() + duration * 60000);
    return end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100 font-sans">
      
      {/* HEADER */}
      <header className="mb-8 border-b border-gray-700 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Quản lý Lịch Chiếu
          </h1>
          <p className="text-gray-400 text-sm mt-1">Sắp xếp thời gian chiếu phim cho từng rạp.</p>
        </div>
        
        {/* Nút thêm mới */}
        <button 
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition flex items-center gap-2"
        >
          <span>+</span> Thêm Suất Chiếu
        </button>
      </header>

      {/* FILTER BAR (CHỌN PHIM ĐỂ XEM) */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-md">
        <span className="text-orange-400 font-bold whitespace-nowrap">Chọn phim để xem lịch:</span>
        <select 
          value={selectedMovieId}
          onChange={handleFilterChange}
          className="bg-gray-900 text-white border border-gray-600 rounded px-3 py-2 outline-none focus:border-orange-500 w-full md:flex-1 md:max-w-md cursor-pointer"
        >
          <option value="">-- Chọn phim --</option>
          {movies.map(movie => (
            <option key={movie._id} value={movie._id}>
              {movie.title} - ({movie.duration} phút)
            </option>
          ))}
        </select>
      </div>

      {/* DANH SÁCH SHOWTIMES (TABLE) */}
      <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
        {selectedMovieId ? (
          <>
             {loading ? (
                <p className="p-8 text-center text-gray-400">Đang tải dữ liệu...</p>
             ) : showtimes.length === 0 ? (
                <p className="p-8 text-center text-gray-500 italic">Chưa có lịch chiếu nào cho phim này.</p>
             ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-700 text-gray-300 text-sm uppercase">
                        <th className="p-4 border-b border-gray-600">Phòng Chiếu</th>
                        <th className="p-4 border-b border-gray-600">Ngày Chiếu</th>
                        <th className="p-4 border-b border-gray-600">Giờ Chiếu</th>
                        <th className="p-4 border-b border-gray-600">Giá Vé</th>
                        <th className="p-4 border-b border-gray-600 text-center">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {showtimes.map((show) => {
                        const { date, time } = formatDateTime(show.startTime);
                        const endTime = calculateEndTime(show.startTime, show.movieId.duration);
                        
                        return (
                          <tr key={show._id} className="hover:bg-gray-700/50 transition">
                            <td className="p-4 font-medium text-white">
                              {show.roomId?.name || 'Phòng đã xóa'} 
                              <span className="block text-xs text-gray-400 font-normal">{show.roomId?.type}</span>
                            </td>
                            <td className="p-4 text-gray-300">{date}</td>
                            <td className="p-4">
                              <span className="bg-orange-900 text-orange-200 px-2 py-1 rounded text-sm font-bold border border-orange-700/50">
                                {time} - {endTime}
                              </span>
                            </td>
                            <td className="p-4 text-green-400 font-medium">
                              {show.ticketPrice.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="p-4 flex justify-center gap-3">
                              <button 
                                onClick={() => openModal(show)}
                                className="text-blue-400 hover:text-blue-300 bg-gray-700/50 hover:bg-blue-900/30 p-2 rounded transition"
                                title="Sửa"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDelete(show._id)}
                                className="text-red-400 hover:text-red-300 bg-gray-700/50 hover:bg-red-900/30 p-2 rounded transition"
                                title="Xóa"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
             )}
          </>
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <span className="text-4xl mb-2">🎬</span>
             <p>Vui lòng chọn một bộ phim ở trên để xem và quản lý lịch chiếu.</p>
          </div>
        )}
      </div>

      {/* MODAL (FORM THÊM / SỬA) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-600 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Chỉnh Sửa Lịch Chiếu' : 'Thêm Lịch Chiếu Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {/* Chọn Phim */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Phim</label>
                <select 
                  required
                  value={formData.movieId}
                  onChange={(e) => setFormData({...formData, movieId: e.target.value})}
                  className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-orange-500 outline-none"
                >
                  <option value="">-- Chọn Phim --</option>
                  {movies.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              {/* Chọn Phòng */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Phòng Chiếu</label>
                <select 
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                  className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-orange-500 outline-none"
                >
                  <option value="">-- Chọn Phòng --</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>{r.name} ({r.type})</option>
                  ))}
                </select>
              </div>

              {/* Thời gian & Giá vé */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Thời gian bắt đầu</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Giá vé (VNĐ)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="1000"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({...formData, ticketPrice: Number(e.target.value)})}
                    className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-700 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-lg transition"
                >
                  {isEditing ? 'Lưu Thay Đổi' : 'Tạo Lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShowtimesPage;