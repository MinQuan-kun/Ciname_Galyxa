'use client';
import React, { useState, useEffect } from 'react';

const ShowtimesPage = () => {
  // --- STATE ---
  const [movies, setMovies] = useState([]);       // Danh sách phim (dropdown)
  const [rooms, setRooms] = useState([]);         // Danh sách phòng (dropdown)
  
  // Dữ liệu hiển thị chính: Mảng các nhóm [{ movie: {}, showtimes: [] }]
  const [groupedShowtimes, setGroupedShowtimes] = useState([]); 
  
  const [selectedMovieId, setSelectedMovieId] = useState('ALL'); // Mặc định là ALL
  const [loading, setLoading] = useState(false);
  
  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentShowtimeId, setCurrentShowtimeId] = useState(null);
  
  const [formData, setFormData] = useState({
    movieId: '',
    roomId: '',
    startTime: '',
    ticketPrice: 75000
  });

  // --- API CALLS ---

  // 1. Khởi tạo: Lấy danh sách Phim, Phòng và TẤT CẢ Lịch chiếu
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [resMovies, resRooms] = await Promise.all([
          fetch('http://localhost:5001/api/movies'),
          fetch('http://localhost:5001/api/rooms')
        ]);
        
        if (resMovies.ok) setMovies(await resMovies.json());
        if (resRooms.ok) setRooms(await resRooms.json());

        // Gọi luôn hàm lấy tất cả lịch chiếu khi mới vào
        fetchShowtimes('ALL');
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };
    fetchInitData();
  }, []);

  // 2. Hàm lấy lịch chiếu (Xử lý cả 2 trường hợp: ALL và Single)
  const fetchShowtimes = async (movieId) => {
    setLoading(true);
    try {
      let data = [];
      
      if (movieId === 'ALL' || !movieId) {
        // CASE 1: Lấy tất cả (API mới trả về mảng đã nhóm theo phim)
        const res = await fetch('http://localhost:5001/api/showtimes');
        if (res.ok) data = await res.json();

      } else {
        // CASE 2: Lấy theo 1 phim (API cũ trả về mảng phẳng)
        // Ta cần "ép" nó về cấu trúc nhóm để dùng chung logic render
        const res = await fetch(`http://localhost:5001/api/showtimes/${movieId}`);
        if (res.ok) {
            const flatList = await res.json();
            // Tìm thông tin phim từ state movies để hiển thị header
            const currentMovie = movies.find(m => m._id === movieId);
            if (flatList.length > 0 || currentMovie) {
                data = [{
                    movie: currentMovie || { title: 'Unknown Movie' },
                    showtimes: flatList
                }];
            }
        }
      }
      setGroupedShowtimes(data);
    } catch (error) {
      console.error("Lỗi tải lịch chiếu:", error);
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

  // --- CRUD HANDLERS ---

  const openModal = (showtime = null, preSelectedMovieId = null) => {
    if (showtime) {
      // Edit Mode
      setIsEditing(true);
      setCurrentShowtimeId(showtime._id);
      const localDate = new Date(showtime.startTime);
      localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
      
      setFormData({
        movieId: showtime.movieId._id || showtime.movieId, // Xử lý tùy vào việc populate hay không
        roomId: showtime.roomId._id || showtime.roomId,
        startTime: localDate.toISOString().slice(0, 16),
        ticketPrice: showtime.ticketPrice
      });
    } else {
      // Create Mode
      setIsEditing(false);
      setFormData({
        // Nếu đang filter 1 phim thì điền sẵn, nếu ALL thì để trống
        movieId: (selectedMovieId !== 'ALL' ? selectedMovieId : (preSelectedMovieId || '')), 
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
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert(isEditing ? "Cập nhật thành công!" : "Tạo lịch chiếu thành công!");
        setIsModalOpen(false);
        fetchShowtimes(selectedMovieId); // Refresh lại list
      } else {
        alert(`Lỗi: ${data.message}`);
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
        alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      alert("Lỗi khi xóa: " + error.message);
    }
  };

  // --- HELPER ---
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

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100 font-sans">
      
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

      {/* DANH SÁCH SHOWTIMES (RENDER LOOP) */}
      <div className="space-y-8">
        {loading ? (
            <p className="text-center text-gray-400 py-8">Đang tải dữ liệu...</p>
        ) : groupedShowtimes.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border border-gray-700 rounded-xl bg-gray-800">
                <span className="text-4xl mb-2 block">🎬</span>
                <p>Không có lịch chiếu nào để hiển thị.</p>
            </div>
        ) : (
            // DUYỆT QUA TỪNG NHÓM PHIM
            groupedShowtimes.map((group) => (
                <div key={group.movie._id} className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                    
                    {/* Header của từng phim */}
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 border-b border-gray-600 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {/* Ảnh Poster nhỏ (nếu có) */}
                            {group.movie.poster && (
                                <img src={group.movie.poster} alt={group.movie.title} className="w-10 h-14 object-cover rounded border border-gray-500"/>
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-orange-400">{group.movie.title}</h3>
                                <p className="text-xs text-gray-400">Thời lượng: {group.movie.duration} phút</p>
                            </div>
                        </div>
                        {/* Nút thêm nhanh cho phim này */}
                        <button 
                            onClick={() => openModal(null, group.movie._id)}
                            className="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-white transition"
                        >
                            + Thêm lịch cho phim này
                        </button>
                    </div>

                    {/* Bảng lịch chiếu của phim đó */}
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
                                                    <button onClick={() => handleDelete(show._id)} className="text-red-400 hover:bg-red-900/30 p-1.5 rounded transition" title="Xóa">🗑️</button>
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

      {/* MODAL FORM (GIỮ NGUYÊN) */}
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
                <select required value={formData.roomId} onChange={(e) => setFormData({...formData, roomId: e.target.value})} className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-orange-500">
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
                  <input type="number" required min="0" step="1000" value={formData.ticketPrice} onChange={(e) => setFormData({...formData, ticketPrice: Number(e.target.value)})} className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-orange-500" />
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
    </div>
  );
};

export default ShowtimesPage;