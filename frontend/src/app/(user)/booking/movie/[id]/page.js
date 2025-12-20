'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axiosClient from '@/api/axios';
import { FaCalendarAlt, FaClock, FaStar, FaPlay, FaUserSecret, FaUsers, FaFilm, FaLanguage, FaExclamationTriangle } from 'react-icons/fa';

const MovieBookingPage = () => {
  const { id } = useParams();
  
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieRes = await axiosClient.get(`/movies/${id}`);
        setMovie(movieRes.data);
        
        const showtimeRes = await axiosClient.get(`/showtimes?movieId=${id}`);
        setShowtimes(showtimeRes.data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  // Helper: Màu sắc cho nhãn độ tuổi
  const getAgeColor = (code) => {
      switch(code) {
          case 'P': return 'bg-green-500';
          case 'K': return 'bg-blue-500';
          case 'T13': return 'bg-yellow-500 text-black';
          case 'T16': return 'bg-orange-500';
          case 'T18': return 'bg-red-600';
          default: return 'bg-gray-500';
      }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">Đang tải...</div>;
  if (!movie) return <div className="text-white text-center pt-20">Không tìm thấy phim!</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      
      {/* --- BANNER --- */}
      <div className="relative h-[450px] w-full overflow-hidden group">
        <img src={movie.banner || movie.poster} alt="" className="w-full h-full object-cover opacity-30 blur-sm transform group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-10 flex flex-col md:flex-row gap-8 items-end max-w-7xl mx-auto z-20">
            {/* Poster nhỏ */}
            <div className="relative shrink-0 hidden md:block">
                <img src={movie.poster} alt={movie.title} className="w-52 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-slate-700" />
                {/* Nhãn độ tuổi nổi bật trên Poster */}
                <div className={`absolute top-2 left-2 ${getAgeColor(movie.ageLimit)} text-white text-xs font-bold px-2 py-1 rounded shadow-md`}>
                    {movie.ageLimit || 'P'}
                </div>
            </div>
            
            {/* Text Info */}
            <div className="mb-4 flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {movie.status || "Đang Chiếu"}
                    </span>
                    {/* Nhãn độ tuổi mobile */}
                    <span className={`md:hidden ${getAgeColor(movie.ageLimit)} text-white text-[10px] font-bold px-2 py-1 rounded`}>
                        {movie.ageLimit || 'P'}
                    </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase leading-none">
                    {movie.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm font-medium">
                    <span className="flex items-center gap-2"><FaClock className="text-blue-500"/> {movie.duration} phút</span>
                    <span className="flex items-center gap-2"><FaFilm className="text-pink-500"/> {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
                    <span className="flex items-center gap-2"><FaCalendarAlt className="text-green-500"/> {new Date(movie.releaseDate || Date.now()).toLocaleDateString('vi-VN')}</span>
                </div>

                {/* --- HIỂN THỊ CHÚ THÍCH (NOTE) --- */}
                {movie.note && (
                    <div className="mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/30 p-3 rounded-lg max-w-2xl">
                        <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-200 italic">{movie.note}</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* --- CỘT TRÁI: LỊCH CHIẾU --- */}
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white border-l-4 border-orange-500 pl-4 mb-8">Lịch Chiếu</h2>

            {showtimes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                    <p className="text-slate-500">Chưa có lịch chiếu nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showtimes.map((item) => (
                        <div key={item._id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-orange-500/50 transition group flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-white">{item.room?.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{item.room?.type || 'Standard'}</p>
                                </div>
                                <span className="text-lg font-bold text-orange-400">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</span>
                            </div>

                            <div className="bg-slate-950 p-3 rounded-lg flex items-center justify-between mb-4 border border-slate-800/50">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 uppercase">Ngày</p>
                                    <p className="font-bold text-slate-300 text-sm">{new Date(item.date).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="h-6 w-px bg-slate-800"></div>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 uppercase">Giờ</p>
                                    <p className="font-bold text-white text-lg text-orange-500">{item.startTime}</p>
                                </div>
                            </div>

                            <Link href={`/booking/${item._id}`}>
                                <button className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-lg transition shadow-lg shadow-orange-600/20 active:scale-95 text-sm uppercase">
                                    Đặt Vé
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Nội dung phim */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-6">Nội Dung Phim</h2>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed text-justify">
                    {movie.description || "Đang cập nhật nội dung..."}
                </div>
            </div>
        </div>

        {/* --- CỘT PHẢI: THÔNG TIN CHI TIẾT --- */}
        <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Thông Tin
                </h3>
                
                <ul className="space-y-5">
                    {/* Thêm mục Giới hạn độ tuổi */}
                    <li className="flex items-start gap-4 border-b border-slate-800 pb-4">
                        <div className={`w-10 h-10 rounded flex items-center justify-center text-white font-bold shrink-0 ${getAgeColor(movie.ageLimit)}`}>
                            {movie.ageLimit || 'P'}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Kiểm duyệt</p>
                            <p className="text-white font-medium text-sm">
                                {movie.ageLimit === 'T18' ? 'Cấm khán giả dưới 18 tuổi' : 
                                 movie.ageLimit === 'T16' ? 'Cấm khán giả dưới 16 tuổi' :
                                 movie.ageLimit === 'T13' ? 'Cấm khán giả dưới 13 tuổi' :
                                 movie.ageLimit === 'K' ? 'Dưới 13 tuổi cần người giám hộ' :
                                 'Phổ biến mọi lứa tuổi'}
                            </p>
                        </div>
                    </li>

                    <li className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <FaUserSecret/>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Đạo diễn</p>
                            <p className="text-white font-medium">{movie.director || "Chưa cập nhật"}</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <FaUsers/>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Diễn viên</p>
                            <p className="text-white font-medium line-clamp-2">{movie.cast || "Chưa cập nhật"}</p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Trailer Video */}
            {movie.trailer && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Trailer
                    </h3>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black">
                        {getEmbedUrl(movie.trailer) ? (
                            <iframe 
                                src={getEmbedUrl(movie.trailer)} 
                                title="Movie Trailer"
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            ></iframe>
                        ) : (
                             <a href={movie.trailer} target="_blank" className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-white transition">
                                <FaPlay size={40} className="mb-2"/>
                                <span>Xem trên Youtube</span>
                             </a>
                        )}
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default MovieBookingPage;