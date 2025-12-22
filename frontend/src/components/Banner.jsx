'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight, FaPlay, FaTicketAlt, FaTimes } from 'react-icons/fa';
import axiosClient from '../api/axios';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Banner = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTrailer, setActiveTrailer] = useState(null);

    const swiperRef = useRef(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await axiosClient.get('/movies');
                if (res.data && res.data.length > 0) {
                    // 1. Random và lấy 3 phim
                    const shuffled = [...res.data].sort(() => 0.5 - Math.random());
                    const selectedMovies = shuffled.slice(0, 3);

                    // 2. [UPDATE] KIỂM TRA LỊCH CHIẾU CHO TỪNG PHIM
                    // Để biết phim Sắp chiếu có suất chiếu sớm hay không
                    const moviesWithStatus = await Promise.all(selectedMovies.map(async (movie) => {
                        try {
                            // Gọi API check lịch chiếu
                            const showtimeRes = await axiosClient.get(`/showtimes/${movie._id}`);
                            // Nếu mảng trả về có dữ liệu => Đã có lịch
                            const hasShowtimes = showtimeRes.data && showtimeRes.data.length > 0;
                            return { ...movie, hasShowtimes };
                        } catch (err) {
                            return { ...movie, hasShowtimes: false };
                        }
                    }));

                    setMovies(moviesWithStatus);
                }
            } catch (error) {
                console.error("Lỗi tải Banner:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11)
            ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
            : null;
    };

    const handlePlayTrailer = (url) => {
        const embedUrl = getEmbedUrl(url);
        if (embedUrl) {
            if (swiperRef.current) swiperRef.current.autoplay.stop();
            setActiveTrailer(embedUrl);
        } else {
            window.open(url, '_blank');
        }
    };

    const closeTrailer = () => {
        if (swiperRef.current) swiperRef.current.autoplay.start();
        setActiveTrailer(null);
    };

    if (loading) return (
        <div className="h-[600px] w-full bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="relative h-[600px] w-full group overflow-hidden bg-black font-sans">

            <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                modules={[Autoplay, EffectFade, Pagination, Navigation]}
                spaceBetween={0}
                effect={'fade'}
                loop={true} 
                centeredSlides={true}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                navigation={{ nextEl: '.button-next-slide', prevEl: '.button-prev-slide' }}
                className="h-full w-full"
            >
                {movies.map((movie) => (
                    <SwiperSlide key={movie._id}>
                        <div className="relative h-full w-full">
                            {/* Ảnh nền */}
                            <img
                                src={movie.banner || movie.poster || "https://via.placeholder.com/1920x1080"}
                                alt={movie.title}
                                className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.7]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent"></div>

                            {/* Nội dung chính */}
                            <div className="absolute top-1/2 left-4 md:left-16 lg:left-24 -translate-y-1/2 max-w-3xl z-20 pr-4">

                                <div className="animate-in slide-in-from-left-10 fade-in duration-700 space-y-5">

                                    {/* Badge Trạng thái */}
                                    <div className="flex items-center gap-3">
                                        <span className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg ${movie.status === 'Sắp chiếu' ? 'bg-orange-600 shadow-orange-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
                                            {movie.status || "Đang Chiếu"}
                                        </span>
                                        {/* Nếu là Sắp chiếu mà có lịch thì hiện thêm badge nhỏ */}
                                        {movie.status === 'Sắp chiếu' && movie.hasShowtimes && (
                                            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider animate-pulse">
                                                Có suất chiếu sớm
                                            </span>
                                        )}
                                    </div>

                                    {/* Tiêu đề */}
                                    <h2 className="text-3xl md:text-2xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] line-clamp-2 leading-snug py-2 uppercase tracking-tighter mb-2">
                                        {movie.title}
                                    </h2>

                                    {/* Info */}
                                    <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm md:text-base font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                        <span>{Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                        <span>{movie.duration} phút</span>
                                    </div>

                                    {/* Mô tả */}
                                    <p className="text-gray-300 text-sm md:text-lg leading-relaxed line-clamp-3 max-w-2xl drop-shadow-md border-l-2 border-slate-500/50 pl-4">
                                        {movie.description}
                                    </p>

                                    {/* Buttons */}
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        
                                        {/* --- 3. [UPDATE] LOGIC HIỂN THỊ NÚT ĐẶT VÉ --- */}
                                        {/* Hiện nút khi: (Đang chiếu) HOẶC (Sắp chiếu NHƯNG đã có lịch) */}
                                        {(movie.status === 'Đang chiếu' || (movie.status === 'Sắp chiếu' && movie.hasShowtimes)) && (
                                            <Link href={`/booking/movie/${movie._id}`} className="group">
                                                <button className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all duration-300">
                                                    <FaTicketAlt />
                                                    <span>{movie.status === 'Sắp chiếu' ? 'Đặt Vé Sớm' : 'Đặt Vé Ngay'}</span>
                                                </button>
                                            </Link>
                                        )}
                                        
                                        {movie.trailer && (
                                            <button
                                                onClick={() => handlePlayTrailer(movie.trailer)}
                                                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 group/btn"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                                    <FaPlay size={10} className="ml-0.5" />
                                                </div>
                                                <span>Xem Trailer</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Navigation Buttons */}
            <div className="button-prev-slide absolute top-1/2 left-6 z-30 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-blue-600 text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer">
                <FaChevronLeft size={20} />
            </div>
            <div className="button-next-slide absolute top-1/2 right-6 z-30 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-blue-600 text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer">
                <FaChevronRight size={20} />
            </div>

            {/* Popup Trailer */}
            {activeTrailer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.2)] border border-slate-800">
                        <button onClick={closeTrailer} className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-all backdrop-blur-md group">
                            <FaTimes size={20} className="group-hover:rotate-90 transition-transform" />
                        </button>
                        <iframe
                            src={activeTrailer}
                            title="Trailer"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="absolute inset-0 -z-10 cursor-pointer" onClick={closeTrailer}></div>
                </div>
            )}
        </div>
    );
};

export default Banner;