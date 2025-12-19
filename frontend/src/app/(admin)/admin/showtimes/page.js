'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosClient from '@/api/axios';
import { FaPlus, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa';

const ShowtimesPage = () => {
  // Dữ liệu giả lập (Mock Data) - Sau này thay bằng API
  const [showtimes, setShowtimes] = useState([
    { _id: '1', movieTitle: 'Đào, Phở và Piano', room: 'Phòng 01', date: '2025-12-20', time: '19:30', price: 50000 },
    { _id: '2', movieTitle: 'Mai', room: 'Phòng 03 (IMAX)', date: '2025-12-20', time: '21:00', price: 120000 },
    { _id: '3', movieTitle: 'Kung Fu Panda 4', room: 'Phòng 02', date: '2025-12-21', time: '10:00', price: 70000 },
  ]);

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            LỊCH CHIẾU PHIM
          </h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý suất chiếu & phòng vé</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition">
          <FaPlus /> Tạo Lịch Chiếu
        </button>
      </div>

      {/* Grid danh sách lịch chiếu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showtimes.map((item) => (
            <div key={item._id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-purple-500/50 transition group shadow-xl">
                
                {/* Tên phim */}
                <h3 className="text-xl font-bold text-white mb-4 line-clamp-1 group-hover:text-purple-400 transition">
                    {item.movieTitle}
                </h3>
                
                <div className="space-y-3 text-slate-300">
                    <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-red-400"/> 
                        <span className="font-medium">{item.room}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-blue-400"/> 
                        <span>{new Date(item.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaClock className="text-yellow-400"/> 
                        <span className="text-lg font-bold text-white">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
                        <FaTicketAlt className="text-green-400"/> 
                        <span className="text-green-400 font-bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2">
                    <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-bold transition">Sửa</button>
                    <button className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-lg text-sm font-bold transition">Hủy chiếu</button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ShowtimesPage;