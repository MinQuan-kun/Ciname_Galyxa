// Minh hoàng
// Gợi ý nên có tiêu đề ở phía trên (Quản lý phòng chiếu & ghế) màu là cam
// Làm nút thêm phòng, sửa thông tin phòng và xóa phòng (có loại phòng và tên phòng)
// Tạo sơ đồ ghế, chỉnh loại ghế thường/vip/couple/Trống gợi ý (nhấp để thay đổi trạng thái) và nút lưu, thông báo lưu thành công, chỉnh sửa thành công làm đẹp xíu nếu được 

'use client';
import React, { useState, useEffect } from 'react';

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
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    rows: 10,
    cols: 12
  });

  const [seatMap, setSeatMap] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // --- LOGIC GIỮ NGUYÊN ---
  const syncTokenToCookie = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/rooms');
      const data = await res.json();
      if (res.ok) setRooms(data);
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
    setFormData({ 
        name: room.name, 
        type: room.type, 
        rows: 10, 
        cols: 12 
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
        alert("Vui lòng nhập tên phòng!");
        return;
    }
    syncTokenToCookie();

    const validSeats = seatMap.filter(s => s.type !== '_HIDDEN');
    const payload = {
      name: formData.name,
      type: formData.type,
      seatMap: validSeats,
      totalSeats: validSeats.length,
      status: 'Active'
    };

    try {
      const url = isEditing 
        ? `http://localhost:5001/api/rooms/${selectedRoom._id}`
        : 'http://localhost:5001/api/rooms';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert(isEditing ? 'Cập nhật thành công!' : 'Tạo phòng thành công!');
        fetchRooms();
        if (!isEditing) handleCreateNew();
      } else {
        if (res.status === 401) alert("Lỗi 401: Hết phiên đăng nhập.");
        else if (res.status === 403) alert("Lỗi 403: Không có quyền Admin.");
        else alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      alert('Lỗi kết nối server: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;
    syncTokenToCookie();
    try {
      const res = await fetch(`http://localhost:5001/api/rooms/${id}`, { 
          method: 'DELETE',
          credentials: 'include'
      });
      if (res.ok) {
        alert("Đã xóa phòng");
        fetchRooms();
        handleCreateNew();
      } else {
        const data = await res.json();
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Lỗi khi xóa");
    }
  };

  // --- LOGIC UI GHẾ ---
  const generateMatrix = () => {
    const newMap = [];
    const rowLabels = ['A','B','C','D','E','F','G','H','J','K','L','M','N','O'];
    
    for (let r = 0; r < formData.rows; r++) {
      for (let c = 1; c <= formData.cols; c++) {
        const rowLabel = rowLabels[r] || `R${r+1}`; 
        newMap.push({
          id: `${rowLabel}${c}`,
          row: rowLabel,
          number: c,
          type: 'Standard', 
          priceSurcharge: 0
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

  // --- RENDER DARK THEME ---
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100 font-sans">
      <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Quản lý Phòng Chiếu
          </h1>
          <p className="text-gray-400 text-sm mt-1">Thiết lập sơ đồ ghế và thông tin phòng chiếu phim.</p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* CỘT TRÁI: DANH SÁCH (Dark Card) */}
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
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(room._id); }} className="text-red-400 hover:text-red-500 hover:bg-gray-700 p-1 rounded transition">🗑️</button>
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

        {/* CỘT PHẢI: FORM & SƠ ĐỒ (Dark Card) */}
        <div className="col-span-12 md:col-span-8 bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold text-orange-500 mb-6 pb-2 border-b border-gray-700">
            {isEditing ? `✏️ Chỉnh sửa: ${selectedRoom?.name}` : '✨ Thêm phòng mới'}
          </h2>

          {/* INPUTS (Dark Mode) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-400 mb-1">Tên phòng chiếu <span className="text-red-500">*</span></label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition placeholder-gray-600" 
                placeholder="Ví dụ: Rạp 01 - IMAX" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-400 mb-1">Loại phòng</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} 
                className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition">
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
               <div>
                 <label className="text-xs font-semibold text-gray-500 block mb-1">Số hàng</label>
                 <input type="number" value={formData.rows} onChange={e => setFormData({...formData, rows: Number(e.target.value)})} 
                  className="w-20 p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-orange-500 outline-none"/>
               </div>
               <div>
                 <label className="text-xs font-semibold text-gray-500 block mb-1">Ghế/hàng</label>
                 <input type="number" value={formData.cols} onChange={e => setFormData({...formData, cols: Number(e.target.value)})} 
                  className="w-20 p-2 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:border-orange-500 outline-none"/>
               </div>
               <button onClick={generateMatrix} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition shadow-sm border border-gray-500">
                  🔄 Tạo lưới ghế
               </button>
            </div>
          </div>

          {/* SƠ ĐỒ GHẾ */}
          <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 overflow-hidden relative">
             <div className="flex gap-4 mb-8 justify-center text-sm bg-gray-800 py-2 px-4 rounded-full w-fit mx-auto border border-gray-700">
                {Object.entries(SEAT_TYPES).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${val.color} shadow-sm`}></div>
                    <span className="text-gray-300 text-xs">{val.label}</span>
                  </div>
                ))}
            </div>

            <div className="flex flex-col items-center">
                <div className="w-2/3 bg-gray-700 h-1 mb-12 rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.1)] relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 tracking-[0.2em] uppercase">Màn hình (Screen)</span>
                </div>
                
                <div className="flex flex-col gap-2 overflow-x-auto w-full items-center pb-4 scrollbar-thin scrollbar-thumb-orange-500/30">
                    {seatMap.length === 0 && <p className="text-gray-600 italic text-sm">Chưa có ghế nào.</p>}
                    {[...new Set(seatMap.map(s => s.row))].map(rowLabel => (
                    <div key={rowLabel} className="flex items-center justify-center gap-1.5">
                        <span className="w-5 text-gray-500 font-bold text-center text-[10px]">{rowLabel}</span>
                        {seatMap.filter(s => s.row === rowLabel).map(seat => (
                        <div key={seat.id} onClick={() => toggleSeatType(seat.id)} 
                            className={`w-7 h-7 rounded-t-sm flex items-center justify-center text-[9px] cursor-pointer font-bold select-none transition-all duration-200
                            ${SEAT_TYPES[seat.type]?.color || 'bg-gray-700'} 
                            ${seat.type === 'Couple' ? 'w-[62px]' : ''} 
                            hover:brightness-125 hover:scale-105 shadow-sm text-white/90`} 
                            title={`Ghế ${seat.id}`}>
                            {seat.type !== '_HIDDEN' && seat.number}
                        </div>
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
    </div>
  );
};

export default RoomsPage;