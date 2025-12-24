// Minh hoàng
'use client';
import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';

const SEAT_TYPES = {
  Standard: { color: 'bg-blue-600', label: 'Thường', price: 0 },
  VIP: { color: 'bg-yellow-500', label: 'VIP', price: 20000 },
  Couple: { color: 'bg-pink-500', label: 'Đôi', price: 50000 },
  _HIDDEN: { color: 'bg-gray-700 opacity-20', label: 'Trống (Lối đi)', price: 0 }
};

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState(null);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    rows: 10,
    cols: 12
  });

  const [seatMap, setSeatMap] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const syncTokenToCookie = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
  };

  const calculateDimensions = (map) => {
    if (!map || map.length === 0) return { rows: 10, cols: 12 };
    const maxCol = Math.max(...map.map(s => s.number));
    const uniqueRows = new Set(map.map(s => s.row)).size;
    return { rows: uniqueRows, cols: maxCol };
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/rooms');
      setRooms(res.data);
    } catch (error) {
      console.error("Lỗi tải phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    syncTokenToCookie();
  }, []);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setIsEditing(true);
    const dims = calculateDimensions(room.seatMap);
    setFormData({
      name: room.name,
      type: room.type,
      rows: dims.rows, 
      cols: dims.cols
    });
    setSeatMap(room.seatMap || []);
  };

  const handleCreateNew = () => {
    setSelectedRoom(null);
    setIsEditing(false);
    setFormData({ name: '', type: 'Standard', rows: 10, cols: 12 });
    setSeatMap([]);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setNotification({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập tên phòng chiếu!' });
      return;
    }
    syncTokenToCookie();

    const realSeatsCount = seatMap.filter(s => s.type !== '_HIDDEN').length;

    const payload = {
      name: formData.name,
      type: formData.type,
      seatMap: seatMap,
      totalSeats: realSeatsCount,
      status: 'Active'
    };

    try {
      const url = isEditing
        ? `/rooms/${selectedRoom._id}`
        : '/rooms';

      let res;
      if (isEditing) {
        res = await axiosClient.put(url, payload);
      } else {
        res = await axiosClient.post(url, payload);
      }

      setNotification({
        type: 'success',
        title: 'Thành công!',
        message: isEditing ? 'Đã cập nhật thông tin phòng chiếu.' : 'Đã tạo phòng chiếu mới thành công.'
      });
      fetchRooms();
      if (!isEditing) handleCreateNew();

    } catch (error) {
      // ... (code xử lý lỗi giữ nguyên)
      const errorMsg = error.response?.data?.message || error.message;
      setNotification({ type: 'error', title: 'Lỗi', message: errorMsg });
    }
  };

  const handleConfirmDeleteClick = async (room) => {
    try {
      // 4. Thay fetch bằng axiosClient.get
      const res = await axiosClient.get('/showtimes');
      const groups = res.data;

      let affected = [];
      if (Array.isArray(groups)) {
        groups.forEach(group => {
          if (group.showtimes) {
            group.showtimes.forEach(show => {
              const rId = show.roomId?._id || show.roomId;
              if (rId === room._id) {
                affected.push({
                  ...show,
                  movieTitle: group.movie?.title || "Phim không xác định"
                });
              }
            });
          }
        });
      }

      setConfirmModal({
        room: room,
        affectedShowtimes: affected
      });

    } catch (error) {
      console.error("Lỗi kiểm tra lịch chiếu:", error);
      setConfirmModal({ room: room, affectedShowtimes: [], errorCheck: true });
    }
  };

  const executeDelete = async () => {
    if (!confirmModal) return;
    const { room } = confirmModal;

    syncTokenToCookie();

    try {
      // 5. Thay fetch bằng axiosClient.delete
      await axiosClient.delete(`/rooms/${room._id}`);

      setNotification({
        type: 'success',
        title: 'Đã xóa!',
        message: `Đã xóa phòng "${room.name}" thành công.`
      });
      fetchRooms();
      handleCreateNew();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setNotification({ type: 'error', title: 'Lỗi kết nối', message: errorMsg });
    } finally {
      setConfirmModal(null);
    }
  };

  const closeNotification = () => setNotification(null);
  const closeConfirmModal = () => setConfirmModal(null);


  // --- LOGIC UI GHẾ ---
  const generateMatrix = () => {
    const newMap = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let r = 0; r < formData.rows; r++) {
      const rowLabel = r < alphabet.length ? alphabet[r] : `R${r + 1}`;

      for (let c = 1; c <= formData.cols; c++) {
        newMap.push({
          id: `${rowLabel}${c}`, row: rowLabel, number: c, type: 'Standard', priceSurcharge: 0
        });
      }
    }
    setSeatMap(newMap);
  };

  const toggleSeatType = (seatId) => {
    setSeatMap(prevMap => prevMap.map(seat => {
      if (seat.id === seatId) {
        let newType = 'Standard';
        let newPrice = 0;
        if (seat.type === 'Standard') { newType = 'VIP'; newPrice = 20000; }
        else if (seat.type === 'VIP') { newType = 'Couple'; newPrice = 50000; }
        else if (seat.type === 'Couple') { newType = '_HIDDEN'; newPrice = 0; }
        else if (seat.type === '_HIDDEN') { newType = 'Standard'; newPrice = 0; }
        return { ...seat, type: newType, priceSurcharge: newPrice };
      }
      return seat;
    }));
  };

  const getPopupStyles = (type) => {
    switch (type) {
      case 'success': return { bgHeader: 'bg-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path> };
      case 'error': return { bgHeader: 'bg-red-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path> };
      case 'warning': return { bgHeader: 'bg-yellow-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path> };
      default: return { bgHeader: 'bg-blue-600', icon: null };
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100 font-sans relative">
      <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Quản lý Phòng Chiếu
          </h1>
          <p className="text-gray-400 text-sm mt-1">Thiết lập sơ đồ ghế và thông tin phòng chiếu phim.</p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* CỘT TRÁI */}
        <div className="col-span-12 md:col-span-4 bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-700 h-fit">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">Danh sách phòng</h2>
            <button onClick={handleCreateNew} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition shadow-sm">+ Thêm mới</button>
          </div>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600">
            {rooms.map(room => (
              <div key={room._id} onClick={() => handleSelectRoom(room)}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-700 
                ${selectedRoom?._id === room._id ? 'border-orange-500 bg-orange-900/20 ring-1 ring-orange-500/50' : 'border-gray-700 bg-gray-800'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-200">{room.name}</h3>
                  <button onClick={(e) => { e.stopPropagation(); handleConfirmDeleteClick(room); }} className="text-red-400 hover:text-red-500 hover:bg-gray-700 p-1 rounded transition">🗑️</button>
                </div>
                <div className="mt-1 flex gap-2 text-xs">
                  <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded border border-gray-600">{room.type}</span>
                  <span className="text-gray-500">{room.totalSeats} ghế</span>
                </div>
              </div>
            ))}
            {rooms.length === 0 && <p className="text-center text-gray-500 italic py-4">Chưa có dữ liệu phòng.</p>}
          </div>
        </div>

        {/* CỘT PHẢI: FORM & SƠ ĐỒ */}
        <div className="col-span-12 md:col-span-8 bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold text-orange-500 mb-6 pb-2 border-b border-gray-700">
            {isEditing ? `✏️ Chỉnh sửa: ${selectedRoom?.name}` : '✨ Thêm phòng mới'}
          </h2>

          {/* INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-400 mb-1">Tên phòng chiếu <span className="text-red-500">*</span></label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-orange-500 placeholder-gray-600" placeholder="Ví dụ: Rạp 01 - IMAX" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-400 mb-1">Loại phòng</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-orange-500">
                <option value="Standard">Standard (Thường)</option>
                <option value="IMAX">IMAX</option>
                <option value="Gold Class">Gold Class</option>
                <option value="4DX">4DX</option>
                <option value="Sweetbox">Sweetbox</option>
              </select>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="bg-gray-700/30 p-4 rounded-lg border border-dashed border-gray-600 mb-6">
            <h3 className="text-sm font-bold text-gray-300 mb-3">🛠️ Công cụ tạo sơ đồ nhanh:</h3>
            <div className="flex flex-wrap items-end gap-4">
              <div><label className="text-xs font-semibold text-gray-500 block mb-1">Số hàng</label><input type="number" value={formData.rows} onChange={e => setFormData({ ...formData, rows: Number(e.target.value) })} className="w-20 p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-orange-500 outline-none" /></div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1">Ghế/hàng</label><input type="number" value={formData.cols} onChange={e => setFormData({ ...formData, cols: Number(e.target.value) })} className="w-20 p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-orange-500 outline-none" /></div>
              <button onClick={generateMatrix} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition shadow-sm border border-gray-500">🔄 Tạo lưới ghế</button>
            </div>
          </div>

          {/* SƠ ĐỒ GHẾ */}
          <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50 overflow-hidden relative shadow-inner">

            {/* CHÚ THÍCH  */}
            <div className="flex gap-4 mb-6 justify-center text-xs bg-gray-800 py-1.5 px-4 rounded-full w-fit mx-auto border border-gray-700">
              {Object.entries(SEAT_TYPES).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5"><div className={`w-2.5 h-2.5 rounded-sm ${val.color} shadow-sm`}></div><span className="text-gray-400">{val.label}</span></div>
              ))}
            </div>

            <div className="flex flex-col items-center w-full overflow-x-auto">
              {/* MÀN HÌNH (SCREEN) */}
              <div className="w-1/2 bg-gradient-to-b from-gray-700 to-transparent h-6 mb-8 rounded-t-[50%] opacity-50 relative shadow-[0_-5px_20px_rgba(255,255,255,0.1)] border-t border-gray-600"><span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 tracking-[0.2em] uppercase font-bold">Màn hình</span></div>

              {/* LƯỚI GHẾ */}
              <div className="flex flex-col gap-1.5 min-w-max pb-4 px-4">
                {seatMap.length === 0 && <p className="text-gray-600 italic text-xs">Chưa có ghế nào.</p>}
                {[...new Set(seatMap.map(s => s.row))].map(rowLabel => (
                  <div key={rowLabel} className="flex gap-1.5">
                    {seatMap.filter(s => s.row === rowLabel).map(seat => (
                      <div key={seat.id} onClick={() => toggleSeatType(seat.id)} className={`w-7 h-7 text-[9px] rounded flex items-center justify-center cursor-pointer font-bold select-none transition-all duration-150 border border-white/5 ${SEAT_TYPES[seat.type]?.color || 'bg-gray-700'} ${seat.type === 'Couple' ? 'w-[62px]' : ''} hover:brightness-125 hover:scale-105 shadow-sm text-white/90`} title={`Ghế ${seat.id} - ${seat.type}`}>{seat.type !== '_HIDDEN' && seat.id}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t border-gray-700">
            <button onClick={handleSave} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-lg shadow-orange-900/50 transform active:scale-95 transition">
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Phòng Mới'}
            </button>
          </div>
        </div>
      </div>
      {/* --- MODAL: CẢNH BÁO XÁC NHẬN XÓA --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-800 border border-red-500/50 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">

            <div className="bg-red-600/90 p-4 flex items-center gap-3">
              <div className="bg-white text-red-600 rounded-full p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-white font-bold text-lg">Xác nhận xóa phòng?</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                Bạn đang yêu cầu xóa phòng: <span className="text-white font-bold text-lg">"{confirmModal.room.name}"</span>
              </p>

              {confirmModal.affectedShowtimes.length > 0 ? (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                    ⚠️ CẢNH BÁO: Hành động này sẽ xóa VĨNH VIỄN {confirmModal.affectedShowtimes.length} suất chiếu sau:
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600">
                    {confirmModal.affectedShowtimes.map((show, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-gray-500">{idx + 1}.</span>
                        <span>
                          <span className="text-orange-300">
                            [{new Date(show.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(show.startTime).getDate()}/{new Date(show.startTime).getMonth() + 1}]
                          </span>
                          - {show.movieTitle}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-400 italic mt-2 text-right">* Không thể hoàn tác sau khi xóa.</p>
                </div>
              ) : (
                <p className="text-sm text-green-400 italic flex items-center gap-1">
                  ✔ Phòng này hiện không có lịch chiếu nào. An toàn để xóa.
                </p>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button onClick={closeConfirmModal} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium">Hủy bỏ</button>
              <button onClick={executeDelete} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-bold shadow-lg shadow-red-900/50">Xác nhận Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: THÔNG BÁO KẾT QUẢ CHUNG*/}
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

export default RoomsPage;