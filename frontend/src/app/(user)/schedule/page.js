'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const formatDateLocal = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNext7Days = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      fullDate: date,
      dayName: i === 0 ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { weekday: 'long' }),
      dateStr: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      isoDate: formatDateLocal(date) // <--- Dùng hàm mới này
    });
  }
  return days;
};

const SchedulePage = () => {
  // --- STATE ---
  const [dateList] = useState(getNext7Days());
  const [selectedDate, setSelectedDate] = useState(dateList[0].isoDate); // Mặc định chọn hôm nay
  const [moviesData, setMoviesData] = useState([]); // Dữ liệu phim & lịch chiếu
  const [loading, setLoading] = useState(true);

  // --- API CALL ---
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        // Gọi API lấy tất cả lịch chiếu (đã viết ở bước trước)
        // API này trả về: [{ movie: {...}, showtimes: [...] }, ...]
        const res = await fetch('http://localhost:5001/api/showtimes');
        if (res.ok) {
          const data = await res.json();
          setMoviesData(data);
        }
      } catch (error) {
        console.error("Lỗi tải lịch chiếu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  // --- LOGIC FILTER ---
  const filteredMovies = moviesData.map(group => {
    // Lọc suất chiếu khớp ngày
    const showsInDate = group.showtimes.filter(show => {
      const showDateObj = new Date(show.startTime);
      const showDateLocal = formatDateLocal(showDateObj);
      
      return showDateLocal === selectedDate;
    });

    return {
      ...group,
      showtimes: showsInDate.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    };
  }).filter(group => group.showtimes.length > 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-10 px-4 md:px-10">

      {/* 1. HEADER & DATE SELECTOR */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 uppercase tracking-widest">
          Lịch Chiếu Phim
        </h1>

        {/* Thanh cuộn ngày */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center">
          {dateList.map((day) => (
            <button
              key={day.isoDate}
              onClick={() => setSelectedDate(day.isoDate)}
              className={`
                flex flex-col items-center justify-center min-w-[90px] px-4 py-3 rounded-xl transition-all border-2
                ${selectedDate === day.isoDate
                  ? 'border-orange-500 bg-orange-500/20 text-orange-400 scale-105 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                  : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600 hover:bg-gray-800'}
              `}
            >
              <span className="text-xs font-medium uppercase tracking-wider mb-1">{day.dayName}</span>
              <span className="text-xl font-bold">{day.dateStr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. MOVIE LIST */}
      <div className="max-w-6xl mx-auto space-y-8">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Đang tải lịch chiếu...</div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <span className="text-5xl mb-4 block">🍿</span>
            <p className="text-xl text-gray-400">Không có suất chiếu nào vào ngày này.</p>
            <p className="text-sm text-gray-600 mt-2">Vui lòng chọn ngày khác.</p>
          </div>
        ) : (
          filteredMovies.map((item) => (
            <div key={item.movie._id} className="flex flex-col md:flex-row bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 group">

              {/* Cột Trái: Poster */}
              <div className="w-full md:w-48 h-64 md:h-auto relative shrink-0 overflow-hidden">
                <img
                  src={item.movie.poster || "https://via.placeholder.com/300x450"}
                  alt={item.movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/20">
                  {item.movie.ageLimit || 'P'}
                </div>
              </div>

              {/* Cột Phải: Thông tin & Suất chiếu */}
              <div className="flex-1 p-6 flex flex-col justify-center">
                <div className="mb-4 border-b border-gray-800 pb-4">
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {item.movie.title}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      🕒 {item.movie.duration} phút
                    </span>
                    <span className="flex items-center gap-1">
                      🎬 {item.movie.genre?.join(', ') || 'Phim rạp'}
                    </span>
                  </div>
                </div>

                {/* Danh sách giờ chiếu */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Giờ chiếu:</h3>
                  <div className="flex flex-wrap gap-3">
                    {item.showtimes.map((show) => {
                      const timeString = new Date(show.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                      const showTimeDate = new Date(show.startTime);
                      const now = new Date();
                      const closeBookingTime = new Date(showTimeDate.getTime() - 10 * 60000);
                      const isBookingClosed = now >= closeBookingTime;

                      if (isBookingClosed) {
                        return (
                          <div
                            key={show._id}
                            className="relative px-5 py-2 rounded-lg bg-gray-800 border border-gray-700 opacity-50 cursor-not-allowed text-center min-w-[80px]"
                            title="Đã hết hạn đặt vé (trước 10 phút)"
                          >
                            <div className="text-lg font-bold text-gray-500">
                              {timeString}
                            </div>
                            <div className="text-[10px] text-gray-600 mt-1">
                              {show.roomId?.type || '2D'}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={show._id}
                          href={`/booking/${show._id}`} // Link đến trang đặt vé
                          className="group/btn relative"
                        >
                          <div className="px-5 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-orange-500 hover:bg-orange-500 transition-all cursor-pointer text-center min-w-[80px]">
                            <div className="text-lg font-bold text-white group-hover/btn:text-white">
                              {timeString}
                            </div>
                            <div className="text-[10px] text-gray-400 group-hover/btn:text-orange-100 mt-1">
                              {show.roomId?.type || '2D'}
                            </div>
                            {/* Tooltip giá vé */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {show.ticketPrice.toLocaleString()}đ
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SchedulePage;