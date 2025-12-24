'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosClient from '@/api/axios';

const formatDateLocal = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Tính giờ kết thúc
const calculateEndTime = (startTime, duration) => {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60000); 
  return end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getNext14Days = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      fullDate: date, 
      dayName: i === 0 ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { weekday: 'long' }),
      dateStr: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      isoDate: date.toISOString().split('T')[0] 
    });
  }
  return days;
};

const SchedulePage = () => {
  // --- STATE ---
  const [dateList] = useState(getNext14Days());
  const [selectedDate, setSelectedDate] = useState(dateList[0].isoDate); 
  const [moviesData, setMoviesData] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- API CALL ---
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/showtimes'); 
        setMoviesData(res.data);
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

  const renderDateButton = (day) => (
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
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-6 pb-10 px-4 md:px-10">

      {/* 1. DATE SELECTOR */}
      <div className="max-w-6xl mx-auto mb-16 space-y-6">
        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
          {dateList.slice(0, 7).map(renderDateButton)}
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
           {dateList.slice(7, 14).map(renderDateButton)}
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
                      const endTimeString = calculateEndTime(show.startTime, item.movie.duration);

                      const showTimeDate = new Date(show.startTime);
                      const now = new Date();
                      const closeBookingTime = new Date(showTimeDate.getTime() - 10 * 60000);
                      const isBookingClosed = now >= closeBookingTime;

                      // === LOGIC NÚT (ĐÃ ĐÓNG) ===
                      if (isBookingClosed) {
                        return (
                          <div
                            key={show._id}
                            className="relative px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 opacity-50 cursor-not-allowed text-center min-w-[90px] flex flex-col justify-center"
                            title="Đã hết hạn đặt vé (trước 10 phút)"
                          >
                            {/* Giờ bắt đầu */}
                            <div className="text-lg font-bold text-gray-500 leading-none mb-1">
                              {timeString}
                            </div>
                            
                            {/* Loại phòng (GIỮ LẠI) */}
                            <div className="text-[10px] font-bold text-gray-600 uppercase">
                              {show.roomId?.type || '2D'}
                            </div>

                            {/* Giờ kết thúc */}
                            <div className="text-[10px] text-gray-600">
                               ~ {endTimeString}
                            </div>
                          </div>
                        );
                      }

                      // === LOGIC NÚT (ĐANG MỞ) ===
                      return (
                        <Link
                          key={show._id}
                          href={`/booking/${show._id}`} 
                          className="group/btn relative"
                        >
                          <div className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-orange-500 hover:bg-orange-500 transition-all cursor-pointer text-center min-w-[90px] flex flex-col justify-center">
                            
                            {/* Giờ bắt đầu */}
                            <div className="text-lg font-bold text-white group-hover/btn:text-white leading-none mb-1">
                              {timeString}
                            </div>
                            
                            {/* Loại phòng (GIỮ LẠI - Có đổi màu khi hover) */}
                            <div className="text-[10px] font-bold text-gray-400 group-hover/btn:text-orange-100 uppercase">
                              {show.roomId?.type || '2D'}
                            </div>

                            {/* Giờ kết thúc */}
                            <div className="text-[10px] text-gray-500 group-hover/btn:text-orange-200">
                               ~ {endTimeString}
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