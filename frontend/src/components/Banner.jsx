'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight, FaPlay, FaTicketAlt, FaTimes, FaStar, FaCalendarAlt } from 'react-icons/fa';
import axiosClient from '../api/axios';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Banner = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTrailer, setActiveTrailer] = useState(null);

    // Ref để điều khiển dừng/chạy slide khi xem trailer
    const swiperRef = useRef(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await axiosClient.get('/movies');
                if (res.data && res.data.length > 0) {
                    // Random và lấy 3 phim
                    const shuffled = [...res.data].sort(() => 0.5 - Math.random());
                    setMovies(shuffled.slice(0, 3));
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
                centeredSlides={true}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                navigation={{ nextEl: '.button-next-slide', prevEl: '.button-prev-slide' }}
                className="h-full w-full"
            >
                {movies.map((movie) => (
                    <SwiperSlide key={movie._id}>
                        <div className="relative h-full w-full">
                            {/* 1. Ảnh nền & Lớp phủ */}
                            <img
                                src={movie.banner || movie.poster || "https://via.placeholder.com/1920x1080"}
                                alt={movie.title}
                                className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.7]"
                            />
                            {/* Gradient làm tối phần dưới và bên trái để chữ dễ đọc */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent"></div>

                            {/* 2. Nội dung chính */}
                            <div className="absolute top-1/2 left-4 md:left-16 lg:left-24 -translate-y-1/2 max-w-3xl z-20 pr-4">

                                {/* Hiệu ứng Fade In cho chữ */}
                                <div className="animate-in slide-in-from-left-10 fade-in duration-700 space-y-5">

                                    {/* Badge Trạng thái & Rating */}
                                    <div className="flex items-center gap-3">
                                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/20">
                                            {movie.status || "Đang Chiếu"}
                                        </span>
                                        <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                            <FaStar /> 8.5
                                        </span>
                                    </div>

                                    {/* TIÊU ĐỀ PHIM  */}
                                    <h2 className="text-3xl md:text-2xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] line-clamp-2 leading-snug py-2 uppercase tracking-tighter mb-2">
                                        {movie.title}
                                    </h2>

                                    {/* Thông tin phụ (Thể loại, Thời lượng) */}
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

                                    {/* Nút bấm hành động */}
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <button className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all duration-300">
                                            <FaTicketAlt />
                                            <span>Đặt Vé Ngay</span>
                                        </button>

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

            {/* Nút điều hướng  */}
            <div className="button-prev-slide absolute top-1/2 left-6 z-30 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-blue-600 text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer">
                <FaChevronLeft size={20} />
            </div>
            <div className="button-next-slide absolute top-1/2 right-6 z-30 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-blue-600 text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer">
                <FaChevronRight size={20} />
            </div>

            {/* --- POPUP VIDEO TRAILER --- */}
            {activeTrailer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.2)] border border-slate-800">
                        <button
                            onClick={closeTrailer}
                            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-all backdrop-blur-md group"
                        >
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